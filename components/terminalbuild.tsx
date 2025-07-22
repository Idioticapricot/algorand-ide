"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TerminalBuildProps {
  isOpen: boolean
  onClose: () => void
  output: string
}

export function TerminalBuild({ isOpen, onClose, output }: TerminalBuildProps) {
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      // Focus the terminal when it opens
      terminalRef.current?.focus()
    }
  }, [isOpen])

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 h-1/2 bg-[var(--background-color)] border-t border-[var(--border-color)] transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-y-0" : "translate-y-full",
      )}
      ref={terminalRef}
      tabIndex={-1} // Make the div focusable
    >
      <div className="flex items-center justify-between p-2 bg-[var(--sidebar-color)] border-b border-[var(--border-color)]">
        <span className="text-sm font-medium text-[var(--text-color)]">Terminal Output</span>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[var(--button-color)] text-[var(--text-color)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4 text-sm text-[var(--text-color)] overflow-y-auto h-[calc(100%-40px)]">
        <pre className="whitespace-pre-wrap break-all">{output}</pre>
      </div>
    </div>
  )
}
