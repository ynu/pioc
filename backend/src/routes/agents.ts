import { Router } from 'express'
import { Agent } from '../models/Agent.js'

const router = Router()

// List all agents
router.get('/', async (req, res) => {
  try {
    const agents = await Agent.find().sort({ createdAt: -1 })
    res.json({ success: true, data: agents })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取智能体列表失败' })
  }
})

// Get single agent
router.get('/:id', async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id)
    if (!agent) {
      return res.status(404).json({ success: false, error: '智能体不存在' })
    }
    res.json({ success: true, data: agent })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取智能体失败' })
  }
})

// Create agent
router.post('/', async (req, res) => {
  try {
    const agent = await Agent.create(req.body)
    res.status(201).json({ success: true, data: agent })
  } catch (error) {
    res.status(500).json({ success: false, error: '创建智能体失败' })
  }
})

// Update agent
router.put('/:id', async (req, res) => {
  try {
    const agent = await Agent.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!agent) {
      return res.status(404).json({ success: false, error: '智能体不存在' })
    }
    res.json({ success: true, data: agent })
  } catch (error) {
    res.status(500).json({ success: false, error: '更新智能体失败' })
  }
})

// Delete agent
router.delete('/:id', async (req, res) => {
  try {
    const agent = await Agent.findByIdAndDelete(req.params.id)
    if (!agent) {
      return res.status(404).json({ success: false, error: '智能体不存在' })
    }
    res.json({ success: true, message: '删除成功' })
  } catch (error) {
    res.status(500).json({ success: false, error: '删除智能体失败' })
  }
})

export default router