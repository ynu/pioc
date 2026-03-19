// Shared types for PIOC

export interface User {
  _id: string
  username: string
  email: string
  role: 'admin' | 'user'
  createdAt: string
  updatedAt: string
}

export interface Agent {
  _id: string
  name: string
  description?: string
  type: 'openai' | 'anthropic' | 'local' | 'custom'
  config: AgentConfig
  status: 'idle' | 'active' | 'error'
  capabilities: string[]
  createdAt: string
  updatedAt: string
}

export interface AgentConfig {
  model?: string
  apiKey?: string
  baseUrl?: string
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
}

export interface Task {
  _id: string
  title: string
  description?: string
  type: 'one-time' | 'recurring' | 'scheduled'
  status: 'pending' | 'running' | 'completed' | 'failed'
  priority: 'low' | 'medium' | 'high'
  assignedAgent?: string
  schedule?: TaskSchedule
  result?: any
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface TaskSchedule {
  cron?: string
  interval?: number // milliseconds
  startTime?: string
  endTime?: string
}

export interface Memory {
  _id: string
  content: string
  type: 'conversation' | 'fact' | 'preference' | 'learning'
  importance: number // 0-10
  tags: string[]
  source?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  limit: number
}