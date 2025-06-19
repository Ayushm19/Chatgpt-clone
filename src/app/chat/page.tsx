"use client"

import { useChat } from "ai/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEffect, useRef } from "react"

export default function ChatPage() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  } = useChat({
    api: "/api/chat",
  })

  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((m, idx) => {
          console.log("📨 Message received:", m)
          return (
            <div
              key={idx}
              className={`p-3 rounded-lg ${
                m.role === "user" ? "bg-gray-800" : "bg-gray-700"
              }`}
            >
              <p className="text-sm text-white">{m.content}</p>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          console.log("📤 Sending message:", input) // 🔍 Added log
          handleSubmit(e)
        }}
        className="flex gap-2 mt-4"
      >
        <Input
          className="flex-1"
          value={input}
          onChange={handleInputChange}
          placeholder="Message ChatGPT..."
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          Send
        </Button>
      </form>

      {error && (
        <p className="text-red-500 text-sm mt-2">Error: {error.message}</p>
      )}
    </div>
  )
}
