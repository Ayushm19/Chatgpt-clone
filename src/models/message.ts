// src/models/message.ts
import mongoose, { Schema, Document, models, model } from "mongoose"

export interface IMessage extends Document {
  userId: string
  chatId?: string
  role: "user" | "assistant"
  content: string
  createdAt: Date
}

const MessageSchema = new Schema<IMessage>(
  {
    userId: { type: String, required: true },
    chatId: { type: String, default: null },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)

export const Message =
  models.Message || model<IMessage>("Message", MessageSchema)
