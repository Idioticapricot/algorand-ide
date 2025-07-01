"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface XTermTerminalProps {
  title: string
}

interface TerminalLine {
  type: "input" | "output" | "error" | "success"
  content: string
  timestamp: Date
}

export function XTermTerminal({ title }: XTermTerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "success", content: `$ Welcome to ${title}`, timestamp: new Date() },
    { type: "output", content: 'Type "help" to see available commands', timestamp: new Date() },
  ])
  const [currentInput, setCurrentInput] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isProcessing, setIsProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [lines])

  const addLine = (type: TerminalLine["type"], content: string) => {
    setLines((prev) => [...prev, { type, content, timestamp: new Date() }])
  }

  const executeCommand = async (command: string) => {
    if (!command.trim()) return

    // Add command to history
    setCommandHistory((prev) => [...prev, command])
    setHistoryIndex(-1)

    // Add input line
    addLine("input", `$ ${command}`)

    const [cmd, ...args] = command.trim().split(" ")

    setIsProcessing(true)

    // Simulate processing delay for some commands
    const needsDelay = ["install", "build", "deploy"].includes(cmd)
    if (needsDelay) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    switch (cmd) {
      case "help":
        addLine("output", "Available Commands:")
        addLine("output", "  help       Show this help message")
        addLine("output", "  clear      Clear the terminal")
        addLine("output", "  echo       Echo text")
        addLine("output", "  ls         List files and directories")
        addLine("output", "  pwd        Print working directory")
        addLine("output", "  date       Show current date and time")
        addLine("output", "  whoami     Show current user")
        addLine("output", "  uname      Show system information")
        addLine("output", "  cat        Display file contents")
        addLine("output", "  mkdir      Create directory")
        addLine("output", "  touch      Create empty file")
        break

      case "clear":
        setLines([
          { type: "success", content: `$ Welcome to ${title}`, timestamp: new Date() },
          { type: "output", content: 'Type "help" to see available commands', timestamp: new Date() },
        ])
        break

      case "echo":
        addLine("output", args.join(" "))
        break

      case "ls":
        if (args[0] === "-la" || args[0] === "-l") {
          addLine("output", "drwxr-xr-x  3 user user  4096 Dec  7 10:30 src/")
          addLine("output", "drwxr-xr-x  2 user user  4096 Dec  7 10:30 tests/")
          addLine("output", "drwxr-xr-x  2 user user  4096 Dec  7 10:30 scripts/")
          addLine("output", "-rw-r--r--  1 user user   512 Dec  7 10:30 package.json")
          addLine("output", "-rw-r--r--  1 user user   256 Dec  7 10:30 requirements.txt")
          addLine("output", "-rw-r--r--  1 user user  1024 Dec  7 10:30 README.md")
        } else {
          addLine("output", "src/")
          addLine("output", "tests/")
          addLine("output", "scripts/")
          addLine("output", "package.json")
          addLine("output", "requirements.txt")
          addLine("output", "README.md")
        }
        break

      case "pwd":
        addLine("output", "/workspace/algorand-project")
        break

      case "date":
        addLine("output", new Date().toString())
        break

      case "whoami":
        addLine("output", "algorand-developer")
        break

      case "uname":
        if (args[0] === "-a") {
          addLine("output", "Linux algorand-ide 5.15.0 #1 SMP x86_64 GNU/Linux")
        } else {
          addLine("output", "Linux")
        }
        break

      case "cat":
        if (args.length === 0) {
          addLine("error", "cat: missing file operand")
        } else {
          const filename = args[0]
          if (filename === "package.json") {
            addLine("output", "{")
            addLine("output", '  "name": "algorand-project",')
            addLine("output", '  "version": "1.0.0",')
            addLine("output", '  "scripts": {')
            addLine("output", '    "build": "python src/main.py",')
            addLine("output", '    "test": "python -m pytest tests/"')
            addLine("output", "  }")
            addLine("output", "}")
          } else if (filename === "README.md") {
            addLine("output", "# Algorand Smart Contract Project")
            addLine("output", "")
            addLine("output", "This project demonstrates Algorand smart contract development.")
          } else {
            addLine("error", `cat: ${filename}: No such file or directory`)
          }
        }
        break

      case "mkdir":
        if (args.length === 0) {
          addLine("error", "mkdir: missing operand")
        } else {
          addLine("success", `Directory '${args[0]}' created`)
        }
        break

      case "touch":
        if (args.length === 0) {
          addLine("error", "touch: missing file operand")
        } else {
          addLine("success", `File '${args[0]}' created`)
        }
        break

      case "python":
        if (args[0] === "--version") {
          addLine("output", "Python 3.11.0")
        } else if (args[0] === "-c") {
          addLine("output", "Python code execution simulated")
        } else {
          addLine("output", "Python interpreter (simulated)")
        }
        break

      case "pip":
        if (args[0] === "list") {
          addLine("output", "Package    Version")
          addLine("output", "---------- -------")
          addLine("output", "pyteal     0.20.1")
          addLine("output", "algosdk    2.7.0")
        } else if (args[0] === "install") {
          addLine("output", `Installing ${args[1]}...`)
          await new Promise((resolve) => setTimeout(resolve, 1500))
          addLine("success", `Successfully installed ${args[1]}`)
        } else {
          addLine("output", "pip 23.0.1")
        }
        break

      case "git":
        if (args[0] === "status") {
          addLine("output", "On branch main")
          addLine("output", "Your branch is up to date with 'origin/main'.")
          addLine("output", "")
          addLine("output", "nothing to commit, working tree clean")
        } else if (args[0] === "log") {
          addLine("output", "commit abc123def456 (HEAD -> main)")
          addLine("output", "Author: Developer <dev@algorand.com>")
          addLine("output", "Date:   " + new Date().toDateString())
          addLine("output", "")
          addLine("output", "    Initial commit")
        } else {
          addLine("output", "git version 2.39.0")
        }
        break

      default:
        addLine("error", `Command not found: ${cmd}`)
        addLine("output", 'Type "help" to see available commands')
    }

    setIsProcessing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isProcessing) {
      executeCommand(currentInput)
      setCurrentInput("")
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setCurrentInput(commandHistory[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setCurrentInput("")
        } else {
          setHistoryIndex(newIndex)
          setCurrentInput(commandHistory[newIndex])
        }
      }
    }
  }

  const getLineColor = (type: TerminalLine["type"]) => {
    switch (type) {
      case "input":
        return "text-yellow-400"
      case "success":
        return "text-green-400"
      case "error":
        return "text-red-400"
      default:
        return "text-gray-300"
    }
  }

  return (
    <div className="h-full bg-[#1e1e1e] flex flex-col">
      <div className="h-8 bg-[#2d2d30] flex items-center px-3 text-xs font-medium border-b border-[#3e3e42]">
        {title}
      </div>

      <div
        ref={terminalRef}
        className="flex-1 overflow-auto p-3 font-mono text-sm cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, index) => (
          <div key={index} className={`${getLineColor(line.type)} whitespace-pre-wrap`}>
            {line.content}
          </div>
        ))}

        <div className="flex items-center text-yellow-400">
          <span>$ </span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            className="flex-1 bg-transparent outline-none text-gray-300 ml-1"
            placeholder={isProcessing ? "Processing..." : ""}
            autoFocus
          />
          {isProcessing && <span className="text-gray-500 animate-pulse">⏳</span>}
        </div>
      </div>
    </div>
  )
}
