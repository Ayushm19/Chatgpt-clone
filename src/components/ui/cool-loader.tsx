'use client'

import React from "react"

export default function CoolLoaders() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-background space-y-4">
      {/* Loader animation */}
      <div className="flex items-center justify-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-8 bg-gradient-to-t from-purple-400 to-purple-600 rounded-full animate-pulse"
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: "1s",
            }}
          />
        ))}
      </div>

      {/* Text below the loader */}
      <p className="text-sm text-muted-foreground">Loading, please wait...</p>
    </div>
  )
}

