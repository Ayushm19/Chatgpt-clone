// src/app/api/messages/[chatId]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongoose"
import { Message } from "@/models/message"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params  // ✅ Await the params promise

  try {
    await connectToDatabase()
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 })
    return NextResponse.json({ success: true, messages })
  } catch (error) {
    console.error("GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params

  try {
    const { userId, role, content } = await req.json()
    await connectToDatabase()
    const message = await Message.create({ userId, chatId, role, content })
    return NextResponse.json({ success: true, message }, { status: 201 })
  } catch (error) {
    console.error("POST error:", error)
    return NextResponse.json({ success: false, error: "Failed to save message" }, { status: 500 })
  }
}
