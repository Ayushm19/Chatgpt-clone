import { Message } from "@/models/message"
import { connectToDatabase } from "@/lib/mongoose"
import { MessagePayload } from "@/types"

export async function createMessage(message: MessagePayload) {
  await connectToDatabase()
  return await Message.create(message)
}
