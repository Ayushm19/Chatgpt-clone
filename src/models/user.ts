import mongoose, { Schema, Document, model, models } from "mongoose"

export interface IUser extends Document {
  clerkId: string // Clerk user ID
  email?: string
  name?: string
  createdAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String },
    name: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)

export const User = models.User || model<IUser>("User", UserSchema)
