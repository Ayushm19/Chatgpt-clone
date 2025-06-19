// src/app/api/chats/route.ts
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { connectToDatabase } from "@/lib/mongoose"
import { Message } from "@/models/message"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  await connectToDatabase()

  // First get chatIds sorted by latest
  const chatGroups = await Message.aggregate([
    { $match: { userId } },
    { $sort: { createdAt: -1 } }, // Sort by newest first
    {
      $group: {
        _id: "$chatId",
        latestMessage: { $first: "$content" },
      },
    },
    { $sort: { _id: -1 } }, // Optional: sort chats
  ])

  return NextResponse.json({ success: true, chats: chatGroups })
}
