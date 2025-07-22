"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FlowBuilder } from "@/components/flow-builder"
import { TerminalBuild } from "@/components/terminalbuild"
import { toast } from "@/hooks/use-toast"
import { Code, Zap, Home, Play, Download, Trash2, TerminalIcon, WalletIcon } from "lucide-react"
import Link from "next/link"
import { WalletPanel } from "@/components/wallet-panel"
import algosdk from "algosdk"

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
  const [activeTab, setActiveTab] = useState("smart-contracts")
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [showWallet, setShowWallet] = useState(false)
  const [wallet, setWallet] = useState<Wallet | null>(null)

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

  const handleRun = () => {
    toast({
      title: "Running Flow",
      description: "Your Algorand flow is being executed...",
      duration: 3000,
    })
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
            <TabsList className="grid w-full max-w-md grid-cols-2 backdrop-blur-lg" style={{ backgroundColor: "var(--background-color)" }}>
              <TabsTrigger value="smart-contracts" className="data-[state=active]:bg-[var(--button-color)]">
                <Code className="h-4 w-4 mr-2" />
                Smart Contracts
              </TabsTrigger>
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
                  const flowData = {
                    nodes: nodes,
                    edges: edges,
                    type: activeTab,
                    timestamp: new Date().toISOString(),
                  }
                  const dataStr = JSON.stringify(flowData, null, 2)
                  const dataBlob = new Blob([dataStr], { type: "application/json" })
                  const url = URL.createObjectURL(dataBlob)
                  const link = document.createElement("a")
                  link.href = url
                  link.download = `algoflow-${activeTab}-${Date.now()}.json`
                  link.click()
                  URL.revokeObjectURL(url)
                  toast({
                    title: "Flow Exported",
                    description: "Your flow has been exported as JSON file",
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

          <TabsContent value="smart-contracts" className="flex-1 m-0 overflow-hidden">
            <FlowBuilder
              type="smart-contract"
              key="smart-contract"
              onNodesChange={setNodes}
              onEdgesChange={setEdges}
              onNodeSelect={setSelectedNode}
            />
          </TabsContent>

          <TabsContent value="transactions" className="flex-1 m-0 overflow-hidden">
            <FlowBuilder
              type="transaction"
              key="transaction"
              onNodesChange={setNodes}
              onEdgesChange={setEdges}
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
      <TerminalBuild isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
    </div>
  )
}