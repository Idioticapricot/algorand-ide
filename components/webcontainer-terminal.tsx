"use client"

import { useEffect, useRef, useState } from "react"
import type { WebContainer } from "@webcontainer/api"

interface WebContainerTerminalProps {
  title: string
  webcontainer: WebContainer | null
}

export function WebContainerTerminal({ title, webcontainer }: WebContainerTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const [output, setOutput] = useState<string[]>([])

  useEffect(() => {
    if (webcontainer) {
      addOutput(`${title} ready`)
    }
  }, [webcontainer, title])

  const addOutput = (text: string) => {
    setOutput((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${text}`])
  }

  useEffect(() => {
    if (!webcontainer) return

    const handleProcessOutput = (process: any) => {
      process.output.pipeTo(
        new WritableStream({
          write(data) {
            addOutput(data)
          },
        }),
      )
    }

    webcontainer.on("spawn", handleProcessOutput)

    return () => {
      // webcontainer.off("spawn", handleProcessOutput) // not available in current version
    }
  }, [webcontainer])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  return (
    <div className="h-full bg-[#1e1e1e] flex flex-col">
      <div className="h-8 bg-[#2d2d30] flex items-center px-3 text-xs font-medium border-b border-[#3e3e42]">
        {title}
      </div>

      <div ref={terminalRef} className="flex-1 overflow-auto p-3 font-mono text-sm text-[#cccccc]">
        {output.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap">
            {line}
          </div>
        ))}
        <div className="text-[#969696] mt-4">
          <p>WebContainer Build Terminal</p>
          <p>Build commands will appear here when executed</p>
        </div>
      </div>
    </div>
  )
}
