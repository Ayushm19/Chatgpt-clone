import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

declare global {
  var _mongooseConnection: Promise<typeof mongoose> | undefined
}

let cached = global._mongooseConnection

export async function connectToDatabase() {
  if (!cached) {
    cached = global._mongooseConnection = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    })
  }
  return cached
}

