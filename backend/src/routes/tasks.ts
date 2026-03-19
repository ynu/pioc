import { Router } from 'express'
import { Task } from '../models/Task.js'

const router = Router()

// List all tasks
router.get('/', async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query
    const query: any = {}
    
    if (status) query.status = status
    if (priority) query.priority = priority
    
    const total = await Task.countDocuments(query)
    const tasks = await Task.find(query)
      .populate('assignedAgent', 'name')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
    
    res.json({ success: true, data: tasks, total, page: Number(page), limit: Number(limit) })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取任务列表失败' })
  }
})

// Get single task
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedAgent', 'name')
    if (!task) {
      return res.status(404).json({ success: false, error: '任务不存在' })
    }
    res.json({ success: true, data: task })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取任务失败' })
  }
})

// Create task
router.post('/', async (req, res) => {
  try {
    const task = await Task.create(req.body)
    res.status(201).json({ success: true, data: task })
  } catch (error) {
    res.status(500).json({ success: false, error: '创建任务失败' })
  }
})

// Update task
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!task) {
      return res.status(404).json({ success: false, error: '任务不存在' })
    }
    res.json({ success: true, data: task })
  } catch (error) {
    res.status(500).json({ success: false, error: '更新任务失败' })
  }
})

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)
    if (!task) {
      return res.status(404).json({ success: false, error: '任务不存在' })
    }
    res.json({ success: true, message: '删除成功' })
  } catch (error) {
    res.status(500).json({ success: false, error: '删除任务失败' })
  }
})

export default router