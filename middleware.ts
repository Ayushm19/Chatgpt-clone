// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware((auth, req) => {
  // Public route: homepage
  if (req.nextUrl.pathname === '/') return
  // Everything else is protected
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}