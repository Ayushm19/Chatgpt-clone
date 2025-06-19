// src/types/index.ts

export type MessageRole = "user" | "assistant"

export interface MessagePayload {
  userId: string
  chatId: string
  role: MessageRole
  content: string
  fileText?: string // ✅ invisible assistant context
}
