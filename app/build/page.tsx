"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FlowBuilder } from "@/components/flow-builder"
import { TerminalBuild } from "@/components/terminalbuild"
import { toast } from "@/hooks/use-toast"
import { Code, Zap, Home, Play, Download, Trash2, TerminalIcon, WalletIcon } from "lucide-react"
import Link from "next/link"
import { WalletPanel } from "@/components/wallet-panel"
import algosdk from "algosdk"
import { generateCode } from "../../lib/code-generator" 

interface Wallet {
  address: string
  balance: number
  privateKey: string
  mnemonic: string
  transactions: any[]
  algoPrice: number
}

export default function BuildPage() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [terminalOutput, setTerminalOutput] = useState("")
  const [activeTab, setActiveTab] = useState("transactions")
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [showWallet, setShowWallet] = useState(false)
  const [wallet, setWallet] = useState<Wallet | null>(null)

  const getWallet = () => {
    const savedWallet = localStorage.getItem("algorand-wallet")
    if (savedWallet) {
      try {
        const parsedWallet = JSON.parse(savedWallet)
        if (parsedWallet && typeof parsedWallet.address === 'string') {
          setWallet(parsedWallet)
        } else {
          console.error("Invalid wallet data in localStorage:", parsedWallet)
          localStorage.removeItem("algorand-wallet") // Clear invalid data
        }
      } catch (error) {
        console.error("Error parsing wallet from localStorage:", error)
        localStorage.removeItem("algorand-wallet") // Clear corrupted data
      }
    }
  }

  useEffect(() => {
    getWallet()
  }, [])

  const createWallet = async () => {
    try {
      const account = algosdk.generateAccount()

      const newWallet = {
        address: account.addr.toString(),
        balance: 0,
        privateKey: algosdk.secretKeyToMnemonic(account.sk),
        mnemonic: algosdk.secretKeyToMnemonic(account.sk),
        transactions: [],
        algoPrice: 0,
      }

      setWallet(newWallet)
      localStorage.setItem("algorand-wallet", JSON.stringify(newWallet))
      
      // Show funding instructions
      console.log("Wallet created! To fund with test ALGO, visit:")
      console.log(`https://testnet.algoexplorer.io/dispenser?addr=${newWallet.address}`)
    } catch (error) {
      console.error("Error creating wallet:", error)
    }
  }

  const fundWallet = async () => {
    if (!wallet?.address) return
    
    try {
      // Use Algorand TestNet faucet
      const response = await fetch("https://testnet-api.algonode.cloud/v2/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          to: wallet.address,
          amount: 100000000, // 100 ALGO in microAlgos
          fee: 1000,
          firstRound: 1,
          lastRound: 1000,
          genesisID: "testnet-v1.0",
          genesisHash: "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
        }),
      })
      
      if (response.ok) {
        console.log("Funding request submitted successfully")
      } else {
        console.error("Failed to fund wallet")
      }
    } catch (error) {
      console.error("Error funding wallet:", error)
    }
  }

  const handleRun = async () => {
    setTerminalOutput("") // Clear previous output
    setIsTerminalOpen(true) // Open terminal

    toast({
      title: "Running Flow",
      description: "Your Algorand flow is being executed...",
      duration: 3000,
    })

    const generatedCode = generateCode(nodes, edges)

    // Replace the algosdk import statement in the generated code
    let modifiedGeneratedCode = generatedCode.replace(
      "import algosdk from 'algosdk';",
      ""
    );
     modifiedGeneratedCode = modifiedGeneratedCode.replace(
      "const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);",
      ""
    );


    modifiedGeneratedCode = modifiedGeneratedCode.replace(
      "const params = await algodClient.getTransactionParams().do();",
      ""
    );
    // console.log(modifiedGeneratedCode)
    // Capture console.log output
    let capturedOutput = ""
    const originalConsoleLog = console.log
    console.log = (...args) => {
      capturedOutput += args.join(" ") + "\n"
      originalConsoleLog.apply(console, args)
    }

    try {
      const algodToken = 'YOUR_ALGOD_API_TOKEN';
      const algodServer = 'https://testnet-api.algonode.cloud';
      const algodPort = ''; // Empty for Algonode cloud

      const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
      const params = await algodClient.getTransactionParams().do();
      // Execute the generated code
      // Using new Function() is generally not recommended for untrusted code
      // due to security risks (e.g., XSS). For an IDE where the user generates
      // their own code, it's a practical approach.
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const runnableCode = new AsyncFunction('algosdk', 'algodClient', 'params', modifiedGeneratedCode);
      
      await runnableCode(algosdk, algodClient, params);

      setTerminalOutput(capturedOutput)
      toast({
        title: "Flow Execution Complete",
        description: "Check terminal for output.",
        duration: 3000,
      })
    } catch (error: any) {
      setTerminalOutput(capturedOutput + `\nError: ${error.message}`)
      toast({
        title: "Flow Execution Failed",
        description: error.message,
        duration: 5000,
        variant: "destructive",
      })
    } finally {
      // Restore original console.log
      console.log = originalConsoleLog
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ backgroundColor: "var(--background-color)", color: "var(--text-color)" }}>
      {/* New Top Bar */}
      <div className="h-9 flex items-center justify-between px-4 text-sm border-b flex-shrink-0" style={{ backgroundColor: "var(--sidebar-color)", borderColor: "var(--border-color)" }}>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#28ca42]"></div>
          </div>
          <span className="font-medium" style={{ color: "var(--text-color)" }}>AlgoFlow</span>
        </div>
        <div className="flex items-center gap-2">
          {wallet && wallet.address ? (
            <button
              onClick={() => setShowWallet(!showWallet)}
              className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
              style={{ backgroundColor: "var(--button-color)", color: "var(--text-color)" }}
            >
              Wallet: {`${String(wallet.address.substring(0,10))}...` || "Invalid Address"}
            </button>
          ) : (
            <button
              onClick={createWallet}
              className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
              style={{ backgroundColor: "var(--button-color)", color: "var(--text-color)" }}
            >
              Create Wallet
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-4 py-2 border-b flex items-center justify-center gap-8" style={{ backgroundColor: "var(--sidebar-color)", borderColor: "var(--border-color)" }}>
            <TabsList className="grid w-full max-w-md grid-cols-1 backdrop-blur-lg" style={{ backgroundColor: "var(--background-color)" }}>
              <TabsTrigger value="transactions" className="data-[state=active]:bg-[var(--button-color)]">
                <Zap className="h-4 w-4 mr-2" />
                Transactions
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              {/* Run Flow Button */}
              <Button onClick={handleRun} className="font-semibold px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded" size="sm" title="Run Flow">
                <Play className="h-4 w-4 mr-2" />
                Run Flow
              </Button>
              {/* Export Button */}
              <Button
                onClick={() => {
                  const generatedCode = generateCode(nodes, edges)
                  const dataBlob = new Blob([generatedCode], { type: "text/javascript" })
                  const url = URL.createObjectURL(dataBlob)
                  const link = document.createElement("a")
                  link.href = url
                  link.download = `algorand-script-${Date.now()}.js`
                  link.click()
                  URL.revokeObjectURL(url)
                  toast({
                    title: "Code Exported",
                    description: "Your Algorand script has been exported as a .js file",
                    duration: 3000,
                  })
                }}
                size="sm"
                style={{ backgroundColor: "var(--button-color)", color: "var(--text-color)", "&:hover": { backgroundColor: "var(--button-hover-color)" } }}
                title="Export Flow"
              >
                <Download className="h-4 w-4" />
              </Button>

              {/* Delete Button */}
              <Button
                onClick={() => {
                  if (selectedNode) {
                    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id))
                    setEdges((eds) =>
                      eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id),
                    )
                    setSelectedNode(null)
                    toast({
                      title: "Node Deleted",
                      description: "Selected node has been removed",
                      duration: 2000,
                    })
                  } else {
                    toast({
                      title: "No Node Selected",
                      description: "Please select a node to delete",
                      duration: 2000,
                    })
                  }
                }}
                size="sm"
                style={{ backgroundColor: "var(--button-color)", color: "var(--text-color)", "&:hover": { backgroundColor: "var(--button-hover-color)" } }}
                title="Delete Selected Node"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="transactions" className="flex-1 m-0 overflow-hidden">
            <FlowBuilder
              type="transaction"
              key="transaction"
              onFlowChange={(newNodes, newEdges) => {
                setNodes(newNodes);
                setEdges(newEdges);
              }}
              onNodeSelect={setSelectedNode}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Terminal Toggle Button */}
      <div className="fixed bottom-4 right-4 z-50 flex gap-2">
        
        <Button
          onClick={() => setIsTerminalOpen(!isTerminalOpen)}
          className={`px-4 py-2 rounded-lg shadow-lg transition-all duration-200`}
          style={{
            backgroundColor: isTerminalOpen ? "var(--button-color)" : "var(--sidebar-color)",
            color: "var(--text-color)",
            border: "1px solid var(--border-color)",
            "&:hover": {
              backgroundColor: isTerminalOpen ? "var(--button-hover-color)" : "var(--button-hover-color)",
            },
          }}
          size="sm"
        >
          <TerminalIcon className="h-4 w-4 mr-2" />
          Terminal
        </Button>
      </div>

      {/* Wallet Panel */}
      {showWallet && wallet && (
        <div
          className="fixed right-0 top-0 h-full border-l flex-shrink-0 overflow-hidden"
          style={{ width: `320px`, backgroundColor: "var(--sidebar-color)", borderColor: "var(--border-color)" }}
        >
          <WalletPanel wallet={wallet} onClose={() => setShowWallet(false)} />
        </div>
      )}

      {/* Terminal */}
      <TerminalBuild isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} output={terminalOutput} />
    </div>
  )
}