'use client'

import { useEffect, useRef, useState } from "react"
import { ChatInput } from "@/components/ui/chat-input"
import { MessagePayload } from "@/types"
import ReactMarkdown from "react-markdown"
import { CodeBlock } from "@/components/ui/code-block"
import { useUser } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"
import PulseWaveLoader from "@/components/ui/cool-loader"

type CodeProps = {
  inline?: boolean
  className?: string
  children?: React.ReactNode
}

export default function FullApp() {
  const [messages, setMessages] = useState<MessagePayload[]>([])
  const [isAssistantThinking, setIsAssistantThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const { user, isLoaded } = useUser()
  const searchParams = useSearchParams()
  const initialChatId = searchParams!.get("chatId")
  const [chatId, setChatId] = useState<string | null>(initialChatId)

  useEffect(() => {
  if (!initialChatId) {
    const newId = crypto.randomUUID()
    setChatId(newId)

    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set("chatId", newId)
    window.history.replaceState({}, "", newUrl.toString())
  }
  }, [initialChatId])


  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  useEffect(() => {
  const loadMessages = async () => {
    if (!chatId) return;

    try {
      const res = await fetch(`/api/messages/${chatId}`);

      if (!res.ok) {
        console.error("❌ Network error:", res.status);
        setMessages([]);
        return;
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("❌ Invalid JSON response");
        setMessages([]);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setMessages(data.messages);
      } else {
        console.error("❌ Error loading messages", data.error);
        setMessages([]);
      }
    } catch (err) {
      console.error("❌ Failed to fetch messages", err);
      setMessages([]);
    }
  };

  loadMessages();
  }, [chatId]);



  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (!isLoaded || !user || !chatId) {
    return <PulseWaveLoader />
  }

  const userId = user.id

  const handleAddMessage = async (message: MessagePayload, fileText?: string) => {
    const userMessage: MessagePayload = {
      ...message,
      userId,
      role: "user",
      chatId,
    }

    const currentMessages = [...messages, userMessage]
    setMessages(currentMessages)
    setIsAssistantThinking(true)

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: currentMessages, fileText: fileText || "" }),
    })

    if (!response.ok || !response.body) {
      console.error("❌ Failed to get assistant response")
      setIsAssistantThinking(false)
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let assistantReply = ""

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      assistantReply += decoder.decode(value, { stream: true })

      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1]
        if (lastMsg && lastMsg.role === "assistant") {
          return [
            ...prev.slice(0, -1),
            { ...lastMsg, content: assistantReply },
          ]
        } else {
          return [
            ...prev,
            {
              userId: "ai",
              chatId: message.chatId,
              role: "assistant",
              content: assistantReply,
            },
          ]
        }
      })
    }

    setIsAssistantThinking(false)
  }


  return (
    <div className="flex flex-col bg-popover text-foreground w-full h-full overflow-x-hidden">
      <main className="flex-1 px-4 pb-32 pt-4 flex flex-col space-y-4 overflow-y-auto overflow-x-hidden max-w-full min-w-0">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-sm text-center mt-4">
            Start chatting with AI...
          </p>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`w-full sm:max-w-2xl px-4 py-3 rounded-xl text-sm whitespace-pre-wrap break-words ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground self-end"
                : "bg-muted text-foreground self-start"
            }`}
          >
            {msg.role === "assistant" ? (
              <div className="prose prose-neutral dark:prose-invert max-w-none min-w-0">
                <ReactMarkdown
                  components={{
                    code({ inline, className, children, ...props }: CodeProps) {
                      const match = /language-(\w+)/.exec(className || "")
                      return !inline && match ? (
                        <div className="overflow-x-auto rounded">
                          <CodeBlock
                            language={match[1]}
                            value={String(children).replace(/\n$/, "")}
                          />
                        </div>
                      ) : (
                        <code className="bg-muted px-1 py-0.5 rounded" {...props}>
                          {children}
                        </code>
                      )
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="group relative space-y-2">
                {msg.content.split("\n").map((line, i) => {
                  if (line.match(/\.(jpeg|jpg|png|gif|webp)$/i)) {
                    return (
                      <img
                        key={i}
                        src={line}
                        alt="Uploaded"
                        className="rounded-lg border max-w-xs shadow"
                      />
                    )
                  } else if (line.match(/\.pdf$/i)) {
                    return (
                      <a
                        key={i}
                        href={line}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline flex items-center gap-1 hover:text-blue-800"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 11V3m0 0L8 7m4-4l4 4M4 21h16"
                          />
                        </svg>
                        View PDF
                      </a>
                    )
                  } else {
                    return (
                      <div key={i}>
                        <p className="whitespace-pre-wrap">{line}</p>
                      </div>
                    )
                  }
                })}

                {/* Buttons below the message */}
                <div className="gap-2 justify-end mt-1 flex sm:hidden group-hover:flex sm:group-hover:flex">
                  <button
                    onClick={() => {
                    navigator.clipboard.writeText(msg.content)
                    setCopiedIdx(idx)
                    setTimeout(() => setCopiedIdx(null), 2000)
                    }}
                    className="text-muted-foreground hover:text-foreground"
                    title="Copy"
                  >
                    📋
                  </button>
                  <button
                    onClick={() => {
                      const newText = prompt("Edit your message:", msg.content)
                      if (newText !== null) {
                        const updated = [...messages]
                        updated[idx].content = newText
                        setMessages(updated)
                      }
                    }}
                    className="text-muted-foreground hover:text-foreground"
                    title="Edit"
                  >
                    ✏️
                  </button>
                </div>
                {/* ✅ Feedback message */}
                {copiedIdx === idx && (
                <div className="text-xs text-green-500 text-right pr-1">Copied to clipboard!</div>
                 )}
              </div>
            )}
          </div>
        ))}

        {isAssistantThinking && (
          <div className="w-full sm:max-w-2xl px-4 py-3 rounded-xl text-sm bg-muted text-foreground self-start animate-pulse">
            <span className="opacity-70">Assistant is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      <ChatInput
        onSendMessage={handleAddMessage}
        chatId={chatId}
        userId={userId}
      />
    </div>
  )
}
