"use client"

import type React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface NodeSidebarProps {
  type: "transaction"
}

const algorandNodes = [
  {
    id: "account",
    label: "ACCOUNT",
    description: "Algorand account",
    color: "bg-blue-600",
    category: "Core",
  },
  {
    id: "payment",
    label: "PAYMENT",
    description: "Send ALGO",
    color: "bg-green-600",
    category: "Transaction",
  },
  {
    id: "assetTransfer",
    label: "ASSET TRANSFER",
    description: "Transfer ASA tokens",
    color: "bg-purple-600",
    category: "Transaction",
  },
  {
    id: "assetCreate",
    label: "CREATE ASSET",
    description: "Create new ASA",
    color: "bg-yellow-600",
    category: "Transaction",
  },
  {
    id: "assetFreeze",
    label: "FREEZE ASSET",
    description: "Freeze/Unfreeze ASA",
    color: "bg-teal-600",
    category: "Transaction",
  },
  {
    id: "keyReg",
    label: "KEY REGISTRATION",
    description: "Participate in consensus",
    color: "bg-red-600",
    category: "Transaction",
  },
  {
    id: "signTxn",
    label: "SIGN TXN",
    description: "Sign transaction",
    color: "bg-indigo-600",
    category: "Transaction",
  },
  {
    id: "executeTxn",
    label: "EXECUTE TXN",
    description: "Execute transaction",
    color: "bg-pink-600",
    category: "Transaction",
  },
  {
    id: "condition",
    label: "CONDITION",
    description: "If/else logic",
    color: "bg-cyan-600",
    category: "Logic",
  },
  {
    id: "output",
    label: "OUTPUT",
    description: "Display results",
    color: "bg-gray-600",
    category: "Utility",
  },
]

const transactionNodes = algorandNodes.filter((node) =>
  ["Core", "Transaction", "Logic", "Utility"].includes(node.category),
)

export function NodeSidebar({ type }: NodeSidebarProps) {
  const nodes = transactionNodes

  const onDragStart = (event: React.DragEvent, nodeType: string, nodeLabel: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.setData("application/reactflow-label", nodeLabel)
    event.dataTransfer.effectAllowed = "move"
  }

  const groupedNodes = nodes.reduce(
    (acc, node) => {
      if (!acc[node.category]) {
        acc[node.category] = []
      }
      acc[node.category].push(node)
      return acc
    },
    {} as Record<string, typeof nodes>,
  )

  return (
    <div className="w-80 h-full bg-gray-900/95 backdrop-blur-lg border-r border-gray-700 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white text-lg font-semibold">
            Transaction Builder
          </h2>
        </div>
        <p className="text-gray-400 text-sm">
          Create and manage Algorand transactions visually
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-sm font-semibold">Algorand Nodes</h3>
            <Badge variant="secondary" className="text-xs">
              Transaction
            </Badge>
          </div>
        </div>

        <ScrollArea className="flex-1 h-full">
          <div className="p-4 space-y-4">
            {Object.entries(groupedNodes).map(([category, categoryNodes]) => (
              <div key={category}>
                <h4 className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">{category}</h4>
                <div className="space-y-2">
                  {categoryNodes.map((node) => (
                    <div
                      key={node.id}
                      className={`${node.color} p-3 rounded-lg cursor-grab active:cursor-grabbing hover:opacity-80 transition-all duration-200 hover:scale-105`}
                      draggable
                      onDragStart={(event) => onDragStart(event, node.id, node.label)}
                    >
                      <div className="text-white font-semibold text-sm">{node.label}</div>
                      <div className="text-white/70 text-xs mt-1">{node.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
