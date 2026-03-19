import mongoose, { Document, Schema } from 'mongoose'

export interface IAgent extends Document {
  name: string
  description?: string
  type: 'openai' | 'anthropic' | 'local' | 'custom'
  config: {
    model?: string
    apiKey?: string
    baseUrl?: string
    maxTokens?: number
    temperature?: number
    systemPrompt?: string
  }
  status: 'idle' | 'active' | 'error'
  capabilities: string[]
  createdAt: Date
  updatedAt: Date
}

const AgentSchema = new Schema<IAgent>({
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['openai', 'anthropic', 'local', 'custom'], required: true },
  config: {
    model: { type: String },
    apiKey: { type: String },
    baseUrl: { type: String },
    maxTokens: { type: Number },
    temperature: { type: Number },
    systemPrompt: { type: String }
  },
  status: { type: String, enum: ['idle', 'active', 'error'], default: 'idle' },
  capabilities: [{ type: String }]
}, { timestamps: true })

export const Agent = mongoose.model<IAgent>('Agent', AgentSchema)