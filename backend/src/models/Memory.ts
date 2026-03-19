import mongoose, { Document, Schema } from 'mongoose'

export interface IMemory extends Document {
  content: string
  type: 'conversation' | 'fact' | 'preference' | 'learning'
  importance: number
  tags: string[]
  source?: string
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const MemorySchema = new Schema<IMemory>({
  content: { type: String, required: true },
  type: { type: String, enum: ['conversation', 'fact', 'preference', 'learning'], default: 'conversation' },
  importance: { type: Number, default: 5, min: 0, max: 10 },
  tags: [{ type: String }],
  source: { type: String },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true })

export const Memory = mongoose.model<IMemory>('Memory', MemorySchema)