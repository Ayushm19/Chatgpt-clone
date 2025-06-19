"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { SignInButton } from "@clerk/nextjs"
import { useTheme } from "next-themes"

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  connections: number[]
}

export function FakeLanding() {
  const { theme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef<number | null>(null)

  const nodesRef = useRef<Node[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Initialize nodes function
    const initializeNodes = () => {
      const nodeCount = Math.floor((canvas.width * canvas.height) / 15000) || 50
      nodesRef.current = []

      for (let i = 0; i < nodeCount; i++) {
        nodesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          connections: [],
        })
      }
    }

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initializeNodes()
    }

    // Initial setup
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }
    window.addEventListener("mousemove", handleMouseMove)

    // Calculate distance between two points
    const distance = (x1: number, y1: number, x2: number, y2: number) => {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    }

    // Update node positions and connections
    const updateNodes = () => {
      const maxDistance = 120
      const mouseInfluence = 100
      const mouseStrength = 0.0003

      nodesRef.current.forEach((node, i) => {
        // Mouse attraction
        const mouseDistance = distance(node.x, node.y, mouseRef.current.x, mouseRef.current.y)
        if (mouseDistance < mouseInfluence) {
          const force = (mouseInfluence - mouseDistance) * mouseStrength
          const angle = Math.atan2(mouseRef.current.y - node.y, mouseRef.current.x - node.x)
          node.vx += Math.cos(angle) * force
          node.vy += Math.sin(angle) * force
        }

        // Update position
        node.x += node.vx
        node.y += node.vy

        // Boundary bounce
        if (node.x <= 0 || node.x >= canvas.width) {
          node.vx *= -1
          node.x = Math.max(0, Math.min(canvas.width, node.x))
        }
        if (node.y <= 0 || node.y >= canvas.height) {
          node.vy *= -1
          node.y = Math.max(0, Math.min(canvas.height, node.y))
        }

        // Friction
        node.vx *= 0.99
        node.vy *= 0.99

        // Find connections
        node.connections = []
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const otherNode = nodesRef.current[j]
          const dist = distance(node.x, node.y, otherNode.x, otherNode.y)
          if (dist < maxDistance) {
            node.connections.push(j)
          }
        }
      })
    }

    // Draw everything
    const draw = () => {
      // Clear canvas completely - responsive to theme
      const clearColor = isDark ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)"
      ctx.fillStyle = clearColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const maxDistance = 120

      // Draw connections between nodes - responsive to theme
      const nodeColor = isDark ? "255, 255, 255" : "0, 0, 0"
      nodesRef.current.forEach((node, i) => {
        node.connections.forEach((connectionIndex) => {
          const connectedNode = nodesRef.current[connectionIndex]
          if (connectedNode) {
            const dist = distance(node.x, node.y, connectedNode.x, connectedNode.y)
            const opacity = (1 - dist / maxDistance) * 0.4

            ctx.strokeStyle = `rgba(${nodeColor}, ${opacity})`
            ctx.lineWidth = opacity * 1.5
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(connectedNode.x, connectedNode.y)
            ctx.stroke()
          }
        })
      })

      // Draw connections to mouse - responsive to theme
      const mouseDistance = 150
      nodesRef.current.forEach((node) => {
        const dist = distance(node.x, node.y, mouseRef.current.x, mouseRef.current.y)
        if (dist < mouseDistance) {
          const opacity = (1 - dist / mouseDistance) * 0.6

          ctx.strokeStyle = `rgba(${nodeColor}, ${opacity})`
          ctx.lineWidth = opacity * 2
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y)
          ctx.stroke()
        }
      })

      // Draw nodes - responsive to theme
      nodesRef.current.forEach((node) => {
        const mouseDistance = distance(node.x, node.y, mouseRef.current.x, mouseRef.current.y)
        const isNearMouse = mouseDistance < 100
        const size = isNearMouse ? 4 : 2
        const opacity = isNearMouse ? 1 : 0.6

        // Node glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 2)
        gradient.addColorStop(0, `rgba(${nodeColor}, ${opacity * 0.8})`)
        gradient.addColorStop(1, `rgba(${nodeColor}, 0)`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(node.x, node.y, size * 2, 0, Math.PI * 2)
        ctx.fill()

        // Node core
        ctx.fillStyle = `rgba(${nodeColor}, ${opacity})`
        ctx.beginPath()
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw mouse cursor effect - responsive to theme
      const gradient = ctx.createRadialGradient(
        mouseRef.current.x,
        mouseRef.current.y,
        0,
        mouseRef.current.x,
        mouseRef.current.y,
        50,
      )
      gradient.addColorStop(0, `rgba(${nodeColor}, 0.1)`)
      gradient.addColorStop(1, `rgba(${nodeColor}, 0)`)

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(mouseRef.current.x, mouseRef.current.y, 50, 0, Math.PI * 2)
      ctx.fill()
    }

    // Animation loop
    const animate = () => {
      updateNodes()
      draw()
      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("mousemove", handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isDark])

  return (
    <div className={`relative min-h-screen overflow-hidden ${isDark ? "bg-black" : "bg-white"}`}>
      {/* Network Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: isDark ? "black" : "white" }}
      />

      {/* Hero Content */}
      <div className="relative min-h-screen flex items-center justify-center px-4 z-10">
        {/* Main content */}
        <div className="relative text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className={isDark ? "text-gray-200" : "text-gray-800"}>Welcome to my</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              ChatGPT Clone
            </span>
          </h1>

          {/* Subtitle */}
          <div className="mb-12">
            <p className={`text-2xl md:text-3xl font-light ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Let's chat
              <span className="inline-block w-1 h-8 bg-blue-400 ml-2 animate-pulse" />
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <SignInButton mode="modal">
              <Button
                size="lg"
                className={`group relative px-8 py-4 text-lg font-semibold border-0 rounded-xl shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden ${
                  isDark ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {/* Button background animation */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-transparent to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ${
                    isDark ? "via-white/10" : "via-black/10"
                  }`}
                />

                <span className="relative z-10 flex items-center gap-3">
                  Login / Signup
                  <MessageCircle className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-300" />
                </span>
              </Button>
            </SignInButton>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div
            className={`w-6 h-10 border-2 rounded-full flex justify-center ${
              isDark ? "border-white/30" : "border-black/30"
            }`}
          >
            <div className="w-1 h-3 bg-blue-400 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
