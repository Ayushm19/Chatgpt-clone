import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongoose"

export async function GET() {
  try {
    await connectToDatabase()
    return NextResponse.json({ success: true, message: "Connected to MongoDB" })
  } catch (error) {
    console.error("MongoDB connection error:", error)
    return NextResponse.json({ success: false, error: "Failed to connect to MongoDB" })
  }
}