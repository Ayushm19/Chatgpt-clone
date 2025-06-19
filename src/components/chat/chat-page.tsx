'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ChatInput } from '@/components/ui/chat-input'
import { MessagePayload } from '@/types'
import { Loader2 } from 'lucide-react'
import { useUser } from '@clerk/nextjs' // ✅ Added to get real userId

interface Message {
  _id: string
  userId: string
  chatId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const { user } = useUser() // ✅ Clerk user object

  const chatId = params?.chatId as string
  const userId = user?.id // ✅ Real userId from Clerk

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages/${chatId}`)
        const data = await res.json()
        if (data.success) {
          setMessages(data.messages)
        } else {
          console.error('Failed to fetch messages:', data.error)
        }
      } catch (error) {
        console.error('Fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    if (chatId) fetchMessages()
  }, [chatId])

  const handleSendMessage = async (message: MessagePayload) => {
    try {
      setMessages((prev) => [...prev, { ...message, _id: `${Date.now()}` } as Message])

      const res = await fetch(`/api/messages/${chatId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      })

      const data = await res.json()
      if (!data.success) {
        console.error('Failed to save message:', data.error)
      }
    } catch (error) {
      console.error('Send message error:', error)
    }
  }

  if (loading || !userId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-4 overflow-y-auto max-w-3xl mx-auto">
      <div className="flex-1 space-y-4 overflow-y-auto pb-20">
        {messages.map((m) => (
          <div
            key={m._id}
            className={`p-3 rounded-lg max-w-xs ${
              m.role === 'user' ? 'bg-gray-800 ml-auto text-right' : 'bg-gray-700'
            }`}
          >
            {m.content.endsWith('.pdf') ? (
              <a
                href={m.content}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline text-sm"
              >
                📄 View PDF
              </a>
            ) : m.content.includes('res.cloudinary.com') &&
              (m.content.endsWith('.jpg') ||
                m.content.endsWith('.jpeg') ||
                m.content.endsWith('.png') ||
                m.content.endsWith('.webp')) ? (
              <img
                src={m.content}
                alt="Uploaded"
                className="max-w-full rounded-lg border mt-1"
              />
            ) : (
              <p className="text-sm text-white whitespace-pre-wrap">{m.content}</p>
            )}
          </div>
        ))}
      </div>

      <ChatInput onSendMessage={handleSendMessage} chatId={chatId} userId={userId} />
    </div>
  )
}
