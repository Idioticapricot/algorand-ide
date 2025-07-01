"use client"

import { useEffect, useRef, useState } from "react"
import type { WebContainer } from "@webcontainer/api"

interface WebContainerTerminalProps {
  title: string
  onReady?: (webcontainer: WebContainer) => void
}

export function WebContainerTerminal({ title, onReady }: WebContainerTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const [output, setOutput] = useState<string[]>([])
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null)

  useEffect(() => {
    // Get the WebContainer instance from parent component
    const getWebContainer = async () => {
      // This will be passed from the parent component
      addOutput(`${title} ready - waiting for WebContainer...`)
    }

    getWebContainer()
  }, [title])

  const addOutput = (text: string) => {
    setOutput((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${text}`])
  }

  const executeCommand = async (command: string, args: string[] = []) => {
    if (!webcontainer) {
      addOutput("WebContainer not ready")
      return
    }

    try {
      addOutput(`$ ${command} ${args.join(" ")}`)

      const process = await webcontainer.spawn(command, args)

      process.output.pipeTo(
        new WritableStream({
          write(data) {
            addOutput(data)
          },
        }),
      )

      const exitCode = await process.exit
      addOutput(`Process exited with code: ${exitCode}`)

      return exitCode
    } catch (error) {
      addOutput(`Error: ${error}`)
      return 1
    }
  }

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
