import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
import ClientLayout from "@/components/ui/ClientLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "ChatGPT Clone",
  description: "Clone with Clerk + Next.js",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ClientLayout>{children}</ClientLayout>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

