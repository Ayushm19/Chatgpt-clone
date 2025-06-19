import { connectToDatabase } from "@/lib/mongoose"
import { Message } from "@/models/message"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    await connectToDatabase()
    const body = await req.json()

    const { userId, chatId, role, content } = body

    if (!userId || !role || !content) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const message = await Message.create({
      userId,
      chatId: chatId || null,
      role,
      content,
    })

    return NextResponse.json({ success: true, message }, { status: 201 })
  } catch (error) {
    console.error("POST /api/messages error:", error)
    return NextResponse.json({ success: false, error: "Failed to save message" }, { status: 500 })
  }
}
