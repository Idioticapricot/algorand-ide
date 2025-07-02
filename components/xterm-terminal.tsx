"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface XTermTerminalProps {
  title: string
}

interface TerminalLine {
  type: "input" | "output" | "error" | "success" | "info" | "warning"
  content: string
  timestamp: Date
}

export function XTermTerminal({ title }: XTermTerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "success", content: `$ Welcome to ${title}`, timestamp: new Date() },
    { type: "info", content: 'Type "help" to see available commands', timestamp: new Date() },
    { type: "info", content: 'Type "algorand-help" for Algorand development guide', timestamp: new Date() },
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

  const showAlgorandHelp = () => {
    addLine("output", "🚀 ALGORAND DEVELOPMENT GUIDE")
    addLine("output", "==================================")
    addLine("output", "")
    addLine("output", "📚 GETTING STARTED:")
    addLine("output", "  1. Check your environment: 'check-env'")
    addLine("output", "  2. Install dependencies: 'install-deps'")
    addLine("output", "  3. Build your contract: 'build-contract'")
    addLine("output", "  4. Test your contract: 'test-contract'")
    addLine("output", "  5. Deploy to TestNet: 'deploy-testnet'")
    addLine("output", "")
    addLine("output", "🔧 DEVELOPMENT WORKFLOW:")
    addLine("output", "  • Edit your contract in the code editor")
    addLine("output", "  • Use 'build-contract' to compile")
    addLine("output", "  • Use 'test-contract' to run tests")
    addLine("output", "  • Use 'deploy-testnet' when ready")
    addLine("output", "")
    addLine("output", "📖 USEFUL COMMANDS:")
    addLine("output", "  • 'algorand-status' - Check Algorand network status")
    addLine("output", "  • 'show-contract' - Display current contract")
    addLine("output", "  • 'show-account' - Display account info")
    addLine("output", "  • 'show-balance' - Check account balance")
    addLine("output", "  • 'create-account' - Generate new account")
    addLine("output", "")
    addLine("output", "🌐 NETWORKS:")
    addLine("output", "  • TestNet: https://testnet.algoexplorer.io")
    addLine("output", "  • MainNet: https://algoexplorer.io")
    addLine("output", "  • Sandbox: Local development environment")
    addLine("output", "")
    addLine("output", "📚 RESOURCES:")
    addLine("output", "  • Docs: https://developer.algorand.org")
    addLine("output", "  • PyTeal: https://pyteal.readthedocs.io")
    addLine("output", "  • TealScript: https://tealscript.algorand.dev")
    addLine("output", "  • SDK: https://developer.algorand.org/docs/sdks")
  }

  const showDetailedHelp = () => {
    addLine("output", "📋 AVAILABLE COMMANDS")
    addLine("output", "====================")
    addLine("output", "")
    addLine("output", "🔧 SYSTEM COMMANDS:")
    addLine("output", "  help              Show this help message")
    addLine("output", "  clear             Clear the terminal")
    addLine("output", "  echo <text>       Echo text")
    addLine("output", "  ls [-la]          List files and directories")
    addLine("output", "  pwd               Print working directory")
    addLine("output", "  date              Show current date and time")
    addLine("output", "  whoami            Show current user")
    addLine("output", "  uname [-a]        Show system information")
    addLine("output", "  cat <file>        Display file contents")
    addLine("output", "  mkdir <dir>       Create directory")
    addLine("output", "  touch <file>      Create empty file")
    addLine("output", "")
    addLine("output", "🐍 PYTHON COMMANDS:")
    addLine("output", "  python --version  Show Python version")
    addLine("output", "  pip list          List installed packages")
    addLine("output", "  pip install <pkg> Install Python package")
    addLine("output", "")
    addLine("output", "📦 PACKAGE MANAGEMENT:")
    addLine("output", "  npm install       Install Node.js dependencies")
    addLine("output", "  npm run build     Build the project")
    addLine("output", "  npm run test      Run tests")
    addLine("output", "  npm run deploy    Deploy to network")
    addLine("output", "")
    addLine("output", "🔗 GIT COMMANDS:")
    addLine("output", "  git status        Show repository status")
    addLine("output", "  git log           Show commit history")
    addLine("output", "  git add .         Stage all changes")
    addLine("output", "  git commit -m     Commit changes")
    addLine("output", "  git push          Push to remote")
    addLine("output", "")
    addLine("output", "🚀 ALGORAND COMMANDS:")
    addLine("output", "  algorand-help     Show Algorand development guide")
    addLine("output", "  check-env         Check development environment")
    addLine("output", "  install-deps      Install Algorand dependencies")
    addLine("output", "  build-contract    Build smart contract")
    addLine("output", "  test-contract     Test smart contract")
    addLine("output", "  deploy-testnet    Deploy to TestNet")
    addLine("output", "  algorand-status   Check network status")
    addLine("output", "  show-contract     Display contract info")
    addLine("output", "  show-account      Display account info")
    addLine("output", "  show-balance      Check account balance")
    addLine("output", "  create-account    Generate new account")
    addLine("output", "  fund-account      Fund account with test ALGO")
    addLine("output", "  compile-teal      Compile PyTeal to TEAL")
    addLine("output", "  validate-teal     Validate TEAL code")
    addLine("output", "")
    addLine("output", "💡 TIPS:")
    addLine("output", "  • Use Tab for command completion")
    addLine("output", "  • Use ↑/↓ arrows for command history")
    addLine("output", "  • Use Ctrl+C to cancel running commands")
    addLine("output", "  • Check 'algorand-help' for detailed guide")
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
    const needsDelay = ["install", "build", "deploy", "install-deps", "build-contract", "test-contract", "deploy-testnet"].includes(cmd)
    if (needsDelay) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    switch (cmd) {
      case "help":
        showDetailedHelp()
        break

      case "algorand-help":
        showAlgorandHelp()
        break

      case "clear":
        setLines([
          { type: "success", content: `$ Welcome to ${title}`, timestamp: new Date() },
          { type: "info", content: 'Type "help" to see available commands', timestamp: new Date() },
          { type: "info", content: 'Type "algorand-help" for Algorand development guide', timestamp: new Date() },
        ])
        break

      case "echo":
        addLine("output", args.join(" "))
        break

      case "ls":
        if (args[0] === "-la" || args[0] === "-l") {
          addLine("output", "total 24")
          addLine("output", "drwxr-xr-x  3 user user  4096 Dec  7 10:30 src/")
          addLine("output", "drwxr-xr-x  2 user user  4096 Dec  7 10:30 tests/")
          addLine("output", "drwxr-xr-x  2 user user  4096 Dec  7 10:30 scripts/")
          addLine("output", "-rw-r--r--  1 user user   512 Dec  7 10:30 package.json")
          addLine("output", "-rw-r--r--  1 user user   256 Dec  7 10:30 requirements.txt")
          addLine("output", "-rw-r--r--  1 user user  1024 Dec  7 10:30 README.md")
          addLine("output", "-rw-r--r--  1 user user   128 Dec  7 10:30 algorand.json")
        } else {
          addLine("output", "src/")
          addLine("output", "tests/")
          addLine("output", "scripts/")
          addLine("output", "package.json")
          addLine("output", "requirements.txt")
          addLine("output", "README.md")
          addLine("output", "algorand.json")
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
            addLine("output", '    "test": "python -m pytest tests/",')
            addLine("output", '    "deploy": "python scripts/deploy.py"')
            addLine("output", "  }")
            addLine("output", "}")
          } else if (filename === "README.md") {
            addLine("output", "# Algorand Smart Contract Project")
            addLine("output", "")
            addLine("output", "This project demonstrates Algorand smart contract development.")
            addLine("output", "")
            addLine("output", "## Getting Started")
            addLine("output", "1. Install dependencies: `pip install -r requirements.txt`")
            addLine("output", "2. Build contract: `python src/main.py`")
            addLine("output", "3. Run tests: `python -m pytest tests/`")
            addLine("output", "4. Deploy: `python scripts/deploy.py`")
          } else if (filename === "requirements.txt") {
            addLine("output", "pyteal==0.20.1")
            addLine("output", "py-algorand-sdk==2.7.0")
            addLine("output", "pytest==7.4.0")
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
          addLine("output", "Package           Version")
          addLine("output", "----------------- -------")
          addLine("output", "pyteal            0.20.1")
          addLine("output", "py-algorand-sdk   2.7.0")
          addLine("output", "pytest            7.4.0")
          addLine("output", "requests          2.31.0")
        } else if (args[0] === "install") {
          addLine("output", `Installing ${args[1]}...`)
          await new Promise((resolve) => setTimeout(resolve, 1500))
          addLine("success", `Successfully installed ${args[1]}`)
        } else {
          addLine("output", "pip 23.0.1")
        }
        break

      case "npm":
        if (args[0] === "install") {
          addLine("output", "Installing dependencies...")
          await new Promise((resolve) => setTimeout(resolve, 2000))
          addLine("success", "Dependencies installed successfully")
        } else if (args[0] === "run") {
          if (args[1] === "build") {
            addLine("output", "Building project...")
            await new Promise((resolve) => setTimeout(resolve, 1500))
            addLine("success", "Build completed successfully")
          } else if (args[1] === "test") {
            addLine("output", "Running tests...")
            await new Promise((resolve) => setTimeout(resolve, 1000))
            addLine("success", "All tests passed")
          } else if (args[1] === "deploy") {
            addLine("output", "Deploying to network...")
            await new Promise((resolve) => setTimeout(resolve, 3000))
            addLine("success", "Deployment completed")
          }
        } else {
          addLine("output", "npm 9.5.0")
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
        } else if (args[0] === "add") {
          addLine("success", "Changes staged for commit")
        } else if (args[0] === "commit") {
          addLine("success", "Changes committed successfully")
        } else if (args[0] === "push") {
          addLine("success", "Changes pushed to remote repository")
        } else {
          addLine("output", "git version 2.39.0")
        }
        break

      // Algorand-specific commands
      case "check-env":
        addLine("output", "🔍 Checking Algorand development environment...")
        addLine("output", "")
        addLine("output", "✅ Python 3.11.0 - OK")
        addLine("output", "✅ PyTeal 0.20.1 - OK")
        addLine("output", "✅ Algorand SDK 2.7.0 - OK")
        addLine("output", "✅ Node.js 18.0.0 - OK")
        addLine("output", "✅ Git 2.39.0 - OK")
        addLine("output", "")
        addLine("success", "Environment check completed successfully!")
        break

      case "install-deps":
        addLine("output", "📦 Installing Algorand dependencies...")
        addLine("output", "Installing pyteal...")
        await new Promise((resolve) => setTimeout(resolve, 1000))
        addLine("output", "Installing py-algorand-sdk...")
        await new Promise((resolve) => setTimeout(resolve, 1000))
        addLine("output", "Installing pytest...")
        await new Promise((resolve) => setTimeout(resolve, 500))
        addLine("success", "All dependencies installed successfully!")
        break

      case "build-contract":
        addLine("output", "🔨 Building smart contract...")
        addLine("output", "Compiling PyTeal to TEAL...")
        await new Promise((resolve) => setTimeout(resolve, 1500))
        addLine("output", "✅ Approval program compiled")
        addLine("output", "✅ Clear state program compiled")
        addLine("output", "✅ Contract validation passed")
        addLine("success", "Contract built successfully!")
        break

      case "test-contract":
        addLine("output", "🧪 Running contract tests...")
        addLine("output", "Running unit tests...")
        await new Promise((resolve) => setTimeout(resolve, 1000))
        addLine("output", "✅ Contract creation test passed")
        addLine("output", "✅ Message setting test passed")
        addLine("output", "✅ Authorization test passed")
        addLine("output", "")
        addLine("output", "3 tests passed in 1.2s")
        addLine("success", "All tests passed!")
        break

      case "deploy-testnet":
        addLine("output", "🚀 Deploying to Algorand TestNet...")
        addLine("output", "Connecting to TestNet...")
        await new Promise((resolve) => setTimeout(resolve, 1000))
        addLine("output", "Submitting transaction...")
        await new Promise((resolve) => setTimeout(resolve, 2000))
        addLine("output", "Waiting for confirmation...")
        await new Promise((resolve) => setTimeout(resolve, 1000))
        addLine("output", "")
        addLine("output", "📋 Deployment Summary:")
        addLine("output", "  App ID: 12345678")
        addLine("output", "  Creator: ABC123...XYZ789")
        addLine("output", "  Transaction: DEF456...ABC123")
        addLine("output", "  Block: 12345678")
        addLine("output", "")
        addLine("success", "Contract deployed successfully to TestNet!")
        addLine("info", "View on TestNet Explorer: https://testnet.algoexplorer.io/application/12345678")
        break

      case "algorand-status":
        addLine("output", "🌐 Algorand Network Status")
        addLine("output", "========================")
        addLine("output", "")
        addLine("output", "🔗 TestNet:")
        addLine("output", "  Status: ✅ Online")
        addLine("output", "  Block Height: 12,345,678")
        addLine("output", "  Last Block: 2 seconds ago")
        addLine("output", "")
        addLine("output", "🔗 MainNet:")
        addLine("output", "  Status: ✅ Online")
        addLine("output", "  Block Height: 45,678,901")
        addLine("output", "  Last Block: 4 seconds ago")
        addLine("output", "")
        addLine("output", "💰 Current ALGO Price: $0.15")
        break

      case "show-contract":
        addLine("output", "📄 Current Smart Contract")
        addLine("output", "=======================")
        addLine("output", "")
        addLine("output", "📁 Files:")
        addLine("output", "  src/main.py - Main contract logic")
        addLine("output", "  src/contract.py - Contract deployment")
        addLine("output", "  src/utils.py - Utility functions")
        addLine("output", "")
        addLine("output", "🔧 Functions:")
        addLine("output", "  • createApplication() - Contract creation")
        addLine("output", "  • hello() - Simple greeting")
        addLine("output", "  • setMessage() - Update message")
        addLine("output", "  • getMessage() - Get current message")
        addLine("output", "")
        addLine("output", "📊 State Schema:")
        addLine("output", "  Global: 1 uint, 2 byte slices")
        addLine("output", "  Local: 0 uint, 0 byte slices")
        break

      case "show-account":
        addLine("output", "👤 Account Information")
        addLine("output", "=====================")
        addLine("output", "")
        addLine("output", "📍 Address: ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890")
        addLine("output", "💰 Balance: 100.0 ALGO")
        addLine("output", "🔐 Status: Online")
        addLine("output", "📅 Created: 2024-01-15")
        addLine("output", "")
        addLine("output", "📋 Assets: 0")
        addLine("output", "📋 Applications: 1")
        addLine("output", "  • App ID: 12345678 (Hello World)")
        break

      case "show-balance":
        addLine("output", "💰 Account Balance")
        addLine("output", "=================")
        addLine("output", "")
        addLine("output", "📍 Address: ABC123...BCD890")
        addLine("output", "💎 ALGO Balance: 100.0 ALGO")
        addLine("output", "💵 USD Value: $15.00")
        addLine("output", "")
        addLine("output", "📊 Balance History:")
        addLine("output", "  Last 24h: +5.0 ALGO")
        addLine("output", "  Last 7d: +12.5 ALGO")
        addLine("output", "  Last 30d: +25.0 ALGO")
        break

      case "create-account":
        addLine("output", "🆕 Creating new Algorand account...")
        await new Promise((resolve) => setTimeout(resolve, 1000))
        addLine("output", "")
        addLine("output", "✅ Account created successfully!")
        addLine("output", "")
        addLine("output", "📍 Address: XYZ789ABC123DEF456GHI789JKL012MNO345PQR678STU901")
        addLine("output", "🔑 Private Key: [REDACTED]")
        addLine("output", "📝 Mnemonic: [REDACTED]")
        addLine("output", "")
        addLine("warning", "⚠️  IMPORTANT: Save your private key and mnemonic securely!")
        addLine("info", "💡 Use 'fund-account' to add test ALGO to this account")
        break

      case "fund-account":
        addLine("output", "💸 Funding account with test ALGO...")
        addLine("output", "Connecting to TestNet faucet...")
        await new Promise((resolve) => setTimeout(resolve, 1000))
        addLine("output", "Requesting 100 ALGO...")
        await new Promise((resolve) => setTimeout(resolve, 2000))
        addLine("output", "Transaction confirmed!")
        addLine("output", "")
        addLine("success", "✅ Account funded with 100 ALGO")
        addLine("info", "💡 You can now deploy contracts and make transactions")
        break

      case "compile-teal":
        addLine("output", "🔨 Compiling PyTeal to TEAL...")
        addLine("output", "Processing approval program...")
        await new Promise((resolve) => setTimeout(resolve, 1000))
        addLine("output", "Processing clear state program...")
        await new Promise((resolve) => setTimeout(resolve, 500))
        addLine("output", "")
        addLine("output", "📄 Approval Program (TEAL v6):")
        addLine("output", "#pragma version 6")
        addLine("output", "txn ApplicationID")
        addLine("output", "int 0")
        addLine("output", "==")
        addLine("output", "bnz create")
        addLine("output", "...")
        addLine("output", "")
        addLine("output", "📄 Clear State Program (TEAL v6):")
        addLine("output", "#pragma version 6")
        addLine("output", "int 1")
        addLine("output", "return")
        addLine("output", "")
        addLine("success", "✅ TEAL compilation completed!")
        break

      case "validate-teal":
        addLine("output", "✅ Validating TEAL code...")
        addLine("output", "Checking syntax...")
        await new Promise((resolve) => setTimeout(resolve, 500))
        addLine("output", "Checking opcodes...")
        await new Promise((resolve) => setTimeout(resolve, 500))
        addLine("output", "Checking stack usage...")
        await new Promise((resolve) => setTimeout(resolve, 500))
        addLine("output", "Checking resource usage...")
        await new Promise((resolve) => setTimeout(resolve, 500))
        addLine("output", "")
        addLine("success", "✅ TEAL validation passed!")
        addLine("output", "  • Syntax: OK")
        addLine("output", "  • Opcodes: OK")
        addLine("output", "  • Stack: OK")
        addLine("output", "  • Resources: OK")
        break

      default:
        addLine("error", `Command not found: ${cmd}`)
        addLine("output", 'Type "help" to see available commands')
        addLine("output", 'Type "algorand-help" for Algorand development guide')
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
      case "warning":
        return "text-orange-400"
      case "info":
        return "text-blue-400"
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
