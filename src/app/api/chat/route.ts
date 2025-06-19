import { OpenAIStream, StreamingTextResponse } from "ai"
import { NextRequest } from "next/server"
import { createMessage } from "@/lib/db/messages"
import { MessagePayload } from "@/types"

type ChatPayload = {
  model: string
  stream: boolean
  messages: Array<{
    role: "user" | "assistant" | "system"
    content: string
  }>
}

export async function POST(req: NextRequest) {
  const { messages, fileText } = await req.json()

  console.log("📥 Incoming messages:", messages)

  const latestUserMessage = messages[messages.length - 1] as MessagePayload

  // ✅ Save the user message before OpenAI API call
  if (latestUserMessage.role === "user") {
    await createMessage(latestUserMessage) // ✅ replaced sendMessage
  }

  // ✅ Append fileText to messages only for OpenAI
  const finalMessages = [
  {
    role: "system",
    content: `
You're a super friendly, helpful, and engaging AI assistant 🤖✨  
Always respond in a warm, expressive tone with **plenty of emojis**! 🌟🎉

Here’s how to behave:
- Use emojis often and generously 😄💡📊📚🔥
- Add fun reactions 🥳👏🙌 when things go well
- Use markdown to **bold**, _italicize_, and create readable formatting 🧠✅
- Use bullet points • and numbered lists 1️⃣ 2️⃣ 3️⃣ to organize info
- Start answers with a **clear heading** or title in bold or \`#\` markdown (like ChatGPT) 🏷️  
- Use **section headers** (like \`## Summary\`, \`## Key Points\`) for organization 🧠  
- Break info into **short paragraphs** and **bullet points** for readability 📌
- If a user shares a document, summarize it clearly with structure 🗂️
- If unsure, still be friendly and helpful 😅

Your goal is to make every reply fun, helpful, and delightful ✨🚀

Start every response with a cheerful greeting like:
“Hey there! 😊 Here's what I found:”
    `,
  },
  ...messages,
]


  if (fileText) {
    finalMessages.push({
      role: "user",
      content: `The user uploaded a file. Here's the extracted content:\n\n${fileText}`,
    })
  }

  const payload: ChatPayload = {
    model: "gpt-3.5-turbo",
    stream: true,
    messages: finalMessages,
  }

  console.log("📡 Sending request to OpenAI...")

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  })

  console.log("📡 Response status:", response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error("❌ OpenAI Error Response:", errorText)
    return new Response("OpenAI Error", { status: 500 })
  }

  console.log("🌊 Creating stream...")
  const stream = await OpenAIStream(response, {
    onCompletion: async (completion) => {
      console.log("✅ Completion from OpenAI:", completion)

      const assistantMessage: MessagePayload = {
        userId: "assistant",
        chatId: latestUserMessage.chatId,
        role: "assistant",
        content: completion,
      }

      await createMessage(assistantMessage) // ✅ replaced sendMessage
    },
  })


  console.log("🚀 Returning streaming text response")
  return new StreamingTextResponse(stream)
}