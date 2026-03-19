import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'pioc-secret-key'

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body
    
    const existingUser = await User.findOne({ $or: [{ username }, { email }] })
    if (existingUser) {
      return res.status(400).json({ success: false, error: '用户名或邮箱已存在' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'user'
    })
    
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ success: true, data: { token, user: { ...user.toObject(), password: undefined } } })
  } catch (error) {
    res.status(500).json({ success: false, error: '注册失败' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(401).json({ success: false, error: '用户名或密码错误' })
    }
    
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ success: false, error: '用户名或密码错误' })
    }
    
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ success: true, data: { token, user: { ...user.toObject(), password: undefined } } })
  } catch (error) {
    res.status(500).json({ success: false, error: '登录失败' })
  }
})

router.post('/logout', (req, res) => {
  res.json({ success: true })
})

router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ success: false, error: '未登录' })
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const user = await User.findById(decoded.userId).select('-password')
    
    if (!user) {
      return res.status(401).json({ success: false, error: '用户不存在' })
    }
    
    res.json({ success: true, data: user })
  } catch (error) {
    res.status(401).json({ success: false, error: '无效的令牌' })
  }
})

export default router