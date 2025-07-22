"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FlowBuilder } from "@/components/flow-builder"
import { TerminalBuild } from "@/components/terminalbuild"
import { toast } from "@/hooks/use-toast"
import { Code, Zap, Home, Play, Download, Trash2, TerminalIcon } from "lucide-react"
import Link from "next/link"

export default function BuildPage() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("smart-contracts")
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)

  const handleRun = () => {
    toast({
      title: "Running Flow",
      description: "Your Algorand flow is being executed...",
      duration: 3000,
    })
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ backgroundColor: "var(--background-color)", color: "var(--text-color)" }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b z-50" style={{ backgroundColor: "var(--sidebar-color)", borderColor: "var(--border-color)" }}>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="text-[var(--text-color)] hover:bg-[var(--button-hover-color)]">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-color)]">AlgoFLOW Builder</h1>
            <p className="text-sm text-[var(--text-color)]">Create Algorand applications visually</p>
          </div>
        </div>
        <Button onClick={handleRun} className="font-semibold px-6" style={{ backgroundColor: "var(--button-color)", color: "var(--text-color)", "&:hover": { backgroundColor: "var(--button-hover-color)" } }}>
          <Play className="h-4 w-4 mr-2" />
          Run Flow
        </Button>
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
      <div className="fixed bottom-4 right-4 z-50">
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

      {/* Terminal */}
      <TerminalBuild isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
    </div>
  )
}
