'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Paperclip, Send, Loader2, X } from 'lucide-react'
import { MessagePayload } from '@/types'

interface ChatInputProps {
  onSendMessage: (message: MessagePayload, fileText?: string) => void
  chatId: string
  userId: string
}

export function ChatInput({ onSendMessage, chatId, userId }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleSend = async () => {
  if (!input.trim() && !selectedFile) return

  try {
    setLoading(true)
    let fileUrl = ""
    let extractedText = ""

    if (selectedFile) {
      setUploading(true)
      const formData = new FormData()
      formData.append("file", selectedFile)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Upload failed: ${res.status} - ${text}`)
      }

      const data = await res.json()
      fileUrl = data.secure_url
      extractedText = data.extracted_text || ""
    }

    const contentToSend = [input.trim(), fileUrl].filter(Boolean).join("\n\n")

    const message: MessagePayload = {
      chatId,
      userId,
      role: "user",
      content: contentToSend,
      fileText: extractedText,
    }

    onSendMessage(message, extractedText)

    setInput("")
    setSelectedFile(null)
  } catch (error) {
    console.error("❌ Failed to send:", error)
  } finally {
    setLoading(false)
    setUploading(false)
  }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
  }

  return (
    <div className="sticky bottom-0 inset-x-0 z-10 bg-background/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-2 px-4 overflow-x-hidden">

        {selectedFile && (
          <div className="text-xs text-muted-foreground break-all flex items-center justify-between bg-muted px-2 py-1 rounded">
            <span className="truncate">📎 {selectedFile.name}</span>
            <button
              onClick={handleRemoveFile}
              className="ml-2 text-muted-foreground hover:text-destructive"
              aria-label="Remove selected file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex flex-row items-end gap-3 overflow-x-auto">
          <label className="cursor-pointer">
            {uploading ? (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            ) : (
              <Paperclip className="w-5 h-5 text-muted-foreground" />
            )}
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message ChatGPT..."
            className="min-h-[80px] max-h-[240px] w-full resize-none rounded-xl border border-border bg-card text-foreground p-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            disabled={loading || uploading}
          />

          <Button
            onClick={handleSend}
            className="h-10 px-4 rounded-xl"
            disabled={(loading || uploading) || (!input.trim() && !selectedFile)}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
