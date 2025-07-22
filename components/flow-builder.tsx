"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Background,
  type NodeTypes,
  type Node,
  type Connection,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { NodeSidebar } from "./node-sidebar"
import {
  AccountNode,
  PaymentNode,
  AssetTransferNode,
  ApplicationCallNode,
  AssetCreateNode,
  KeyRegNode,
  ConditionNode,
  OutputNode,
  SignTxnNode,
  ExecuteTxnNode,
  AssetFreezeNode,
} from "./nodes/algorand-nodes"
import { NodePropertiesPanel } from "./node-properties-panel"
import { Button } from "./ui/button"
import { type Edge } from "@xyflow/react"
// Temporary comment to force re-compilation


interface FlowBuilderProps {
  type: "transaction"
  onFlowChange?: (nodes: Node[], edges: Edge[]) => void
}

const snapGrid: [number, number] = [20, 20]
const defaultViewport = { x: 0, y: 0, zoom: 1 }

const nodeTypes: NodeTypes = {
  account: AccountNode,
  payment: PaymentNode,
  assetTransfer: AssetTransferNode,
  applicationCall: ApplicationCallNode,
  assetCreate: AssetCreateNode,
  keyReg: KeyRegNode,
  condition: ConditionNode,
  output: OutputNode,
  signTxn: SignTxnNode,
  executeTxn: ExecuteTxnNode,
  assetFreeze: AssetFreezeNode,
}

export function FlowBuilder({ type, onFlowChange }: FlowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const nodeType = event.dataTransfer.getData("application/reactflow")
      const nodeLabel = event.dataTransfer.getData("application/reactflow-label")

      if (typeof nodeType === "undefined" || !nodeType) {
        return
      }

      // Get the position relative to the ReactFlow canvas
      const position = reactFlowInstance?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      if (!position) return

      let config = getDefaultConfig(nodeType)
      if (nodeType === "account") {
        const savedWallet = localStorage.getItem("algorand-wallet")
        if (savedWallet) {
          try {
            const parsedWallet = JSON.parse(savedWallet)
            if (parsedWallet && parsedWallet.mnemonic) {
              config = { ...config, mnemonic: parsedWallet.mnemonic }
            }
          } catch (error) {
            console.error("Error parsing wallet from localStorage:", error)
          }
        }
      }

      const newNode: Node = {
        id: `${nodeType}-${Date.now()}`,
        type: nodeType,
        position,
        data: {
          label: nodeLabel || nodeType.toUpperCase(),
          nodeType: nodeType,
          config: config,
        },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, setNodes],
  )

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const onUpdateNode = useCallback(
    (nodeId: string, data: any) => {
      setNodes((nds) => nds.map((node) => (node.id === nodeId ? { ...node, data } : node)))
    },
    [setNodes],
  )

  

  // Initialize with different example nodes based on type
  useEffect(() => {
    const transactionNodes: Node[] = [
      {
        id: "tx-example-1",
        type: "account",
        position: { x: 400, y: 100 },
        data: {
          label: "ACCOUNT",
          nodeType: "account",
          config: { address: null },
        },
      },
      {
        id: "tx-example-2",
        type: "payment",
        position: { x: 650, y: 100 },
        data: {
          label: "PAYMENT",
          nodeType: "payment",
          config: { amount: 1.0, receiver: null },
        },
      },
    ]

    const initialNodes = transactionNodes
    setNodes(initialNodes)
  }, [type, setNodes])

  useEffect(() => {
    if (onFlowChange) {
      onFlowChange(nodes, edges)
    }
  }, [nodes, edges, onFlowChange])

  return (
    <div className="h-full w-full relative flex overflow-hidden">
      <NodeSidebar type={type} />
      <div className="flex-1 overflow-hidden relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onInit={setReactFlowInstance}
          nodeTypes={nodeTypes}
          snapToGrid={true}
          snapGrid={snapGrid}
          defaultViewport={defaultViewport}
          fitView
          style={{ background: "#000000" }}
          connectionLineStyle={{ stroke: "#3B82F6", strokeWidth: 2 }}
          defaultEdgeOptions={{ style: { stroke: "#3B82F6", strokeWidth: 2 }, animated: true }}
        >
          <Controls className="bg-gray-900 border-gray-700" />
          <MiniMap
            className="bg-gray-900 border-gray-700"
            nodeStrokeColor={(n) => {
              if (n.type === "account") return "#3B82F6"
              if (n.type === "payment") return "#10B981"
              if (n.type === "assetTransfer") return "#8B5CF6"
              return "#6B7280"
            }}
            nodeColor={(n) => {
              if (n.type === "account") return "#3B82F6"
              if (n.type === "payment") return "#10B981"
              if (n.type === "assetTransfer") return "#8B5CF6"
              return "#6B7280"
            }}
            maskColor="rgba(0, 0, 0, 0.8)"
          />
          <Background color="#374151" gap={20} size={1} />
        </ReactFlow>
      </div>
      {selectedNode && (
        <NodePropertiesPanel
          selectedNode={selectedNode}
          onClose={() => setSelectedNode(null)}
          onUpdateNode={onUpdateNode}
        />
      )}
    </div>
  )
}

function getDefaultConfig(nodeType: string) {
  const configs: Record<string, any> = {
    account: { address: null, mnemonic: "" },
    payment: { amount: 1.0, receiver: null },
    assetTransfer: { assetId: null, amount: 1, receiver: null },
    applicationCall: { appId: null, method: "call" },
    assetCreate: { total: 1000, decimals: 0, unitName: "TOKEN" },
    keyReg: { online: true },
    condition: { condition: "balance", operator: ">", value: 0 },
    output: { format: "JSON" },
    signTxn: { method: "Private Key" },
    executeTxn: { network: "TestNet" },
    assetFreeze: { assetId: null, freezeTarget: null, freezeState: true },
  }
  return configs[nodeType] || {}
}


