"use client"

import { useUser } from "@clerk/nextjs"
import { FakeLanding } from "@/components/ui/fakelanding"
import FullApp from "@/components/ui/full-app" // or your existing chat app
import PulseWaveLoader from "@/components/ui/cool-loader"

export default function Page() {
  const { isSignedIn, isLoaded } = useUser()

  if (!isLoaded) return <PulseWaveLoader />

  // 🧠 If not signed in, show fake landing
  if (!isSignedIn) {
    return <FakeLanding />
    // Or use useRouter() to redirect programmatically if needed
  }

  // ✅ If signed in, show app
  return <FullApp />
}
