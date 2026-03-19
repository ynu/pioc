import mongoose, { Document, Schema } from 'mongoose'

export interface ITask extends Document {
  title: string
  description?: string
  type: 'one-time' | 'recurring' | 'scheduled'
  status: 'pending' | 'running' | 'completed' | 'failed'
  priority: 'low' | 'medium' | 'high'
  assignedAgent?: mongoose.Types.ObjectId
  schedule?: {
    cron?: string
    interval?: number
    startTime?: Date
    endTime?: Date
  }
  result?: any
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['one-time', 'recurring', 'scheduled'], default: 'one-time' },
  status: { type: String, enum: ['pending', 'running', 'completed', 'failed'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  assignedAgent: { type: Schema.Types.ObjectId, ref: 'Agent' },
  schedule: {
    cron: { type: String },
    interval: { type: Number },
    startTime: { type: Date },
    endTime: { type: Date }
  },
  result: { type: Schema.Types.Mixed },
  completedAt: { type: Date }
}, { timestamps: true })

export const Task = mongoose.model<ITask>('Task', TaskSchema)