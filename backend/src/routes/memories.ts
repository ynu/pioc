import { Router } from 'express'
import { Memory } from '../models/Memory.js'

const router = Router()

// List all memories
router.get('/', async (req, res) => {
  try {
    const { type, tag, page = 1, limit = 20 } = req.query
    const query: any = {}
    
    if (type) query.type = type
    if (tag) query.tags = tag
    
    const total = await Memory.countDocuments(query)
    const memories = await Memory.find(query)
      .sort({ importance: -1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
    
    res.json({ success: true, data: memories, total, page: Number(page), limit: Number(limit) })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取记忆列表失败' })
  }
})

// Create memory
router.post('/', async (req, res) => {
  try {
    const memory = await Memory.create(req.body)
    res.status(201).json({ success: true, data: memory })
  } catch (error) {
    res.status(500).json({ success: false, error: '创建记忆失败' })
  }
})

// Delete memory
router.delete('/:id', async (req, res) => {
  try {
    const memory = await Memory.findByIdAndDelete(req.params.id)
    if (!memory) {
      return res.status(404).json({ success: false, error: '记忆不存在' })
    }
    res.json({ success: true, message: '删除成功' })
  } catch (error) {
    res.status(500).json({ success: false, error: '删除记忆失败' })
  }
})

export default router