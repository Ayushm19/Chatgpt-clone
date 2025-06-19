"use client"

import { useState } from "react"
import { Copy, Check, Pencil } from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

export function CodeBlock({
  language,
  value,
}: {
  language: string
  value: string
}) {
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [code, setCode] = useState(value)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
  }

  return (
    <div className="relative rounded-md bg-muted mb-4 w-full overflow-x-auto">
      {/* Header */}
      <div className="flex items-center justify-between text-xs px-4 py-2 border-b border-border bg-muted rounded-t-md">
        <span className="font-mono text-muted-foreground">{language}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs hover:underline"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={handleEditToggle}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:underline"
          >
            <Pencil size={14} />
            {isEditing ? "Done" : "Edit"}
          </button>
        </div>
      </div>

      {/* Code content */}
      {isEditing ? (
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full p-4 text-sm font-mono bg-black text-white rounded-b-md outline-none resize-y"
          rows={Math.max(4, code.split("\n").length)}
        />
      ) : (
        <div className="w-full overflow-x-auto">
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: "1rem",
              backgroundColor: "#000",
              borderRadius: "0 0 0.5rem 0.5rem",
              minWidth: "100%",
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  )
}
