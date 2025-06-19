
# Chatgpt-clone

🚀 Live Demo : Open [https://ayushchatgpt-clone-beryl-eight.vercel.app](https://ayushchatgpt-clone-beryl-eight.vercel.app) to view the app.

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
```

Then create a .env.local file in the root of the project and add the following environment variables:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=......
CLERK_SECRET_KEY=.......
NEXT_PUBLIC_CLERK_FRONTEND_API=.......

MONGODB_URI=......

OPENAI_API_KEY=......

CLOUDINARY_CLOUD_NAME=.......
CLOUDINARY_API_KEY=......
CLOUDINARY_API_SECRET=......

NEXT_PUBLIC_SITE_URL=http://localhost:3000  //later deployed url
```
Then, run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```
## Folder Structure 
```bash
src/
├── app/                # Main application routes and layout
│   ├── api/            # Backend API route handlers (chat, messages, etc.)
│   ├── chat/           # The main chat page
│   ├── layout.tsx      # Root layout (Topbar + Sidebar)
│   └── page.tsx        # Landing page 
│
├── components/         # Reusable UI and app components
│   ├── chat/           # Chat page logic (input, output)
│   └── ui/             # Buttons, cards, Fakepage, sidebar etc modals, inputs, etc.
│
├── lib/                # Helper libraries and config
│   ├── cloudinary.ts   # Cloudinary image upload config
│   ├── mongoose.ts     # MongoDB connection
│   └── db/             # DB logic (message queries)
│
├── models/             # Mongoose models for MongoDB
│   ├── message.ts      # Message schema
│   └── user.ts         # User schema
│
├── pages/              # Traditional API routes (e.g., image upload)
│   └── api/upload.ts   # Handles Cloudinary uploads
│
├── types/              # Custom TypeScript declarations and types
│   ├── index.ts
│   ├── formidable.d.ts
│   └── pdf-parse.d.ts
│
├── middleware.ts       # Middleware for authentication/routing
└── declarations.d.ts   # Global TypeScript declarations
```
## Features
🎬 Interactive landing page with animations

🌗 Dark mode / Light mode toggle

📄 Upload PDF or image and extract text using OCR

✍️ User can edit and copy AI messages

💻 Code block rendering for better readability

📚 Sidebar showing chat history

🔍 Search through previous chats

🤖 Model selection at bottom of sidebar

📱 Fully responsive layout across all devices




