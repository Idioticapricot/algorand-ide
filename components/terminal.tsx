"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { Plus, X } from "lucide-react"

const algorandCommands = {
  help: "Print help message",
  clear: "Clear terminal",
  algorand: "Commands for interacting with Algorand",
  compile: "Compile your PyTeal contract",
  deploy: "Deploy your contract to testnet",
  test: "Run test(s)",
  build: "Build your program",
  connect: "Toggle connection to Algorand Wallet",
  account: "Show account information",
  balance: "Check account balance",
  asset: "Commands for interacting with Algorand Assets",
  app: "Commands for interacting with Algorand Applications",
  node: "Node status and information",
  "!!": "Run the last command",
}

interface TerminalLine {
  type: "input" | "output" | "error" | "success"
  content: string
  timestamp?: Date
}

interface TerminalInstance {
  id: string
  name: string
  lines: TerminalLine[]
  currentInput: string
  commandHistory: string[]
  historyIndex: number
  isProcessing: boolean
}

export function Terminal() {
  const [terminals, setTerminals] = useState<TerminalInstance[]>([
    {
      id: "1",
      name: "Terminal 1",
      lines: [
        { type: "success", content: "$ Welcome to Algocraft IDE Terminal" },
        { type: "output", content: 'Type "help" to see available commands' },
      ],
      currentInput: "",
      commandHistory: [],
      historyIndex: -1,
      isProcessing: false,
    },
  ])
  const [activeTerminalId, setActiveTerminalId] = useState("1")
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const terminalRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const activeTerminal = terminals.find((t) => t.id === activeTerminalId)

  const scrollToBottom = useCallback((terminalId: string) => {
    const terminalRef = terminalRefs.current[terminalId]
    if (terminalRef) {
      terminalRef.scrollTop = terminalRef.scrollHeight
    }
  }, [])

  useEffect(() => {
    if (activeTerminal) {
      scrollToBottom(activeTerminal.id)
    }
  }, [activeTerminal, scrollToBottom])

  const updateTerminal = (terminalId: string, updates: Partial<TerminalInstance>) => {
    setTerminals((prev) =>
      prev.map((terminal) => (terminal.id === terminalId ? { ...terminal, ...updates } : terminal)),
    )
  }

  const addLine = (terminalId: string, type: TerminalLine["type"], content: string) => {
    setTerminals((prev) =>
      prev.map((terminal) =>
        terminal.id === terminalId
          ? {
              ...terminal,
              lines: [...terminal.lines, { type, content, timestamp: new Date() }],
            }
          : terminal,
      ),
    )
  }

  const executeCommand = async (terminalId: string, command: string) => {
    if (!command.trim()) return

    const terminal = terminals.find((t) => t.id === terminalId)
    if (!terminal) return

    // Add command to history
    updateTerminal(terminalId, {
      commandHistory: [...terminal.commandHistory, command],
      historyIndex: -1,
    })

    // Add input line
    addLine(terminalId, "input", `$ ${command}`)

    const [cmd, ...args] = command.trim().split(" ")

    updateTerminal(terminalId, { isProcessing: true })

    // Simulate processing delay for some commands
    const needsDelay = ["compile", "deploy", "test"].includes(cmd)
    if (needsDelay) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    switch (cmd) {
      case "help":
        addLine(terminalId, "output", "Available Commands:")
        Object.entries(algorandCommands).forEach(([cmd, desc]) => {
          addLine(terminalId, "output", `  ${cmd.padEnd(15)} ${desc}`)
        })
        break

      case "clear":
        updateTerminal(terminalId, {
          lines: [
            { type: "success", content: "$ Welcome to Algocraft IDE Terminal" },
            { type: "output", content: 'Type "help" to see available commands' },
          ],
        })
        break

      case "algorand":
        if (args.length === 0) {
          addLine(terminalId, "output", "Algorand CLI - Available subcommands:")
          addLine(terminalId, "output", "  status      Show network status")
          addLine(terminalId, "output", "  version     Show Algorand version")
          addLine(terminalId, "output", "  network     Show current network")
        } else {
          switch (args[0]) {
            case "status":
              addLine(terminalId, "success", "✓ Connected to Algorand TestNet")
              addLine(terminalId, "output", "  Block: 12345678")
              addLine(terminalId, "output", "  Round Time: 4.5s")
              break
            case "version":
              addLine(terminalId, "output", "Algorand CLI v3.15.0")
              break
            case "network":
              addLine(terminalId, "output", "Current Network: TestNet")
              break
            default:
              addLine(terminalId, "error", `Unknown algorand command: ${args[0]}`)
          }
        }
        break

      case "compile":
        addLine(terminalId, "output", "Compiling PyTeal contract...")
        await new Promise((resolve) => setTimeout(resolve, 1500))
        addLine(terminalId, "success", "✓ Contract compiled successfully")
        addLine(terminalId, "output", "  Approval Program: 1234 bytes")
        addLine(terminalId, "output", "  Clear State Program: 56 bytes")
        break

      case "deploy":
        addLine(terminalId, "output", "Deploying contract to TestNet...")
        await new Promise((resolve) => setTimeout(resolve, 2000))
        addLine(terminalId, "success", "✓ Contract deployed successfully")
        addLine(terminalId, "output", "  App ID: 123456789")
        addLine(terminalId, "output", "  Transaction ID: ABC123DEF456")
        break

      case "test":
        addLine(terminalId, "output", "Running tests...")
        await new Promise((resolve) => setTimeout(resolve, 1000))
        addLine(terminalId, "success", "✓ All tests passed (3/3)")
        break

      case "build":
        addLine(terminalId, "output", "Building project...")
        await new Promise((resolve) => setTimeout(resolve, 800))
        addLine(terminalId, "success", "✓ Build completed successfully")
        break

      case "balance":
        addLine(terminalId, "output", "Account Balance:")
        addLine(terminalId, "output", "  ALGO: 10.5 ALGO")
        addLine(terminalId, "output", "  Assets: 2 ASA tokens")
        break

      case "connect":
        addLine(terminalId, "success", "✓ Connected to Algorand Wallet")
        break

      case "account":
        addLine(terminalId, "output", "Account Information:")
        addLine(terminalId, "output", "  Address: ALGO7X8K9L2M3N4P5Q6R7S8T9U0V1W2X3Y4Z5A6B7C8D9E0F1G2H3")
        addLine(terminalId, "output", "  Balance: 10.5 ALGO")
        addLine(terminalId, "output", "  Status: Online")
        break

      case "node":
        addLine(terminalId, "output", "Node Information:")
        addLine(terminalId, "output", "  Network: TestNet")
        addLine(terminalId, "output", "  Version: 3.15.0")
        addLine(terminalId, "output", "  Sync Status: Synced")
        break

      case "!!":
        if (terminal.commandHistory.length > 0) {
          const lastCommand = terminal.commandHistory[terminal.commandHistory.length - 1]
          updateTerminal(terminalId, { currentInput: lastCommand })
          setTimeout(() => executeCommand(terminalId, lastCommand), 100)
          return
        } else {
          addLine(terminalId, "error", "No previous command found")
        }
        break

      default:
        addLine(terminalId, "error", `Command not found: ${cmd}`)
        addLine(terminalId, "output", 'Type "help" to see available commands')
    }

    updateTerminal(terminalId, { isProcessing: false })
  }

  const handleKeyDown = (e: React.KeyboardEvent, terminalId: string) => {
    const terminal = terminals.find((t) => t.id === terminalId)
    if (!terminal) return

    if (e.key === "Enter" && !terminal.isProcessing) {
      executeCommand(terminalId, terminal.currentInput)
      updateTerminal(terminalId, { currentInput: "" })
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (terminal.commandHistory.length > 0) {
        const newIndex =
          terminal.historyIndex === -1 ? terminal.commandHistory.length - 1 : Math.max(0, terminal.historyIndex - 1)
        updateTerminal(terminalId, {
          historyIndex: newIndex,
          currentInput: terminal.commandHistory[newIndex],
        })
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (terminal.historyIndex !== -1) {
        const newIndex = terminal.historyIndex + 1
        if (newIndex >= terminal.commandHistory.length) {
          updateTerminal(terminalId, { historyIndex: -1, currentInput: "" })
        } else {
          updateTerminal(terminalId, {
            historyIndex: newIndex,
            currentInput: terminal.commandHistory[newIndex],
          })
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

  const addNewTerminal = () => {
    const newId = (terminals.length + 1).toString()
    const newTerminal: TerminalInstance = {
      id: newId,
      name: `Terminal ${newId}`,
      lines: [
        { type: "success", content: "$ Welcome to Algocraft IDE Terminal" },
        { type: "output", content: 'Type "help" to see available commands' },
      ],
      currentInput: "",
      commandHistory: [],
      historyIndex: -1,
      isProcessing: false,
    }
    setTerminals((prev) => [...prev, newTerminal])
    setActiveTerminalId(newId)
  }

  const closeTerminal = (terminalId: string) => {
    if (terminals.length === 1) return // Don't close the last terminal

    setTerminals((prev) => prev.filter((t) => t.id !== terminalId))

    if (activeTerminalId === terminalId) {
      const remainingTerminals = terminals.filter((t) => t.id !== terminalId)
      setActiveTerminalId(remainingTerminals[0]?.id || "1")
    }
  }

  const renameTerminal = (terminalId: string, newName: string) => {
    updateTerminal(terminalId, { name: newName })
  }

  return (
    <div className="h-full bg-[#1e1e1e] flex flex-col overflow-hidden">
      {/* Terminal Tabs */}
      <div className="h-8 bg-[#2d2d30] flex items-center border-b border-[#3e3e42] flex-shrink-0">
        <div className="flex items-center overflow-x-auto">
          {terminals.map((terminal) => (
            <div
              key={terminal.id}
              className={`flex items-center gap-1 px-3 py-1 text-sm cursor-pointer border-r border-[#3e3e42] ${
                activeTerminalId === terminal.id
                  ? "bg-[#1e1e1e] text-white"
                  : "bg-[#2d2d30] text-[#cccccc] hover:bg-[#37373d]"
              }`}
              onClick={() => setActiveTerminalId(terminal.id)}
            >
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => renameTerminal(terminal.id, e.currentTarget.textContent || terminal.name)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    e.currentTarget.blur()
                  }
                }}
                className="outline-none"
              >
                {terminal.name}
              </span>
              {terminals.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTerminal(terminal.id)
                  }}
                  className="ml-1 hover:bg-[#4e4e52] rounded p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addNewTerminal}
          className="ml-2 p-1 hover:bg-[#37373d] rounded flex items-center justify-center"
          title="New Terminal"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Active Terminal Content */}
      {activeTerminal && (
        <div className="flex-1 overflow-hidden">
          <div
            ref={(el) => (terminalRefs.current[activeTerminal.id] = el)}
            className="h-full overflow-auto p-4 font-mono text-sm"
            onClick={() => inputRefs.current[activeTerminal.id]?.focus()}
          >
            {activeTerminal.lines.map((line, index) => (
              <div key={index} className={`${getLineColor(line.type)} whitespace-pre-wrap`}>
                {line.content}
              </div>
            ))}

            <div className="flex items-center text-yellow-400">
              <span>$ </span>
              <input
                ref={(el) => (inputRefs.current[activeTerminal.id] = el)}
                type="text"
                value={activeTerminal.currentInput}
                onChange={(e) => updateTerminal(activeTerminal.id, { currentInput: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, activeTerminal.id)}
                disabled={activeTerminal.isProcessing}
                className="flex-1 bg-transparent outline-none text-gray-300 ml-1"
                placeholder={activeTerminal.isProcessing ? "Processing..." : ""}
                autoFocus
              />
              {activeTerminal.isProcessing && <span className="text-gray-500 animate-pulse">⏳</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
