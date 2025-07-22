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
} from "./nodes/algorand-nodes"
import { NodePropertiesPanel } from "./node-properties-panel"
import { Button } from "./ui/button"
import { type Edge } from "@xyflow/react"
import { generateCode } from "@/lib/code-generator"

import { type Edge, type Node } from "@xyflow/react"

interface FlowBuilderProps {
  type: "smart-contract" | "transaction"
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
    const smartContractNodes: Node[] = [
      {
        id: "sc-example-1",
        type: "account",
        position: { x: 400, y: 100 },
        data: {
          label: "ACCOUNT",
          nodeType: "account",
          config: { address: null },
        },
      },
      {
        id: "sc-example-2",
        type: "applicationCall",
        position: { x: 650, y: 100 },
        data: {
          label: "APP CALL",
          nodeType: "applicationCall",
          config: { appId: null, method: "call" },
        },
      },
    ]

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

    const initialNodes = type === "smart-contract" ? smartContractNodes : transactionNodes
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
  }
  return configs[nodeType] || {}
}

const generateCode = (nodes: Node[], edges: Edge[]): string => {
  let code = `import algosdk from 'algosdk';\n\n`
  code += `// Connect to Algorand node (TestNet in this example)\n`
  code += `const algodToken = 'YOUR_ALGOD_API_TOKEN';\n`
  code += `const algodServer = 'https://testnet-api.algonode.cloud';\n`
  code += `const algodPort = ''; // Empty for Algonode cloud\n\n`
  code += `const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);\n\n`

  // Generate account setups
  const accountNodes = nodes.filter(node => node.type === 'account');
  accountNodes.forEach(node => {
    const mnemonic = node.data.config.mnemonic || localStorage.getItem("mnemonic") || "PASTE YOUR MNEMONIC HERE";
    code += `// Account from node: ${node.data.label}\n`;
    code += `const ${node.id.replace(/-/g, '_')} = algosdk.mnemonicToSecretKey("${mnemonic}");\n`;
  });
  code += '\n';

  code += `async function main() {\n`;
  code += `    // Get transaction parameters from the network\n`;
  code += `    const params = await algodClient.getTransactionParams().do();\n\n`;

  // Topological sort to process nodes in correct order
  const sortedNodes = topologicalSort(nodes, edges);

  for (const node of sortedNodes) {
    const sourceEdges = edges.filter(edge => edge.target === node.id);
    const sourceNodes = sourceEdges.map(edge => nodes.find(n => n.id === edge.source));

    switch (node.type) {
      case "payment": {
        const senderNode = sourceNodes.find(n => n?.type === 'account');
        if (!senderNode) continue;
        const receiver = node.data.config.receiver || "RECEIVER_ALGORAND_ADDRESS";
        const amount = (node.data.config.amount || 0) * 1000000; // Algos to microAlgos
        code += `    // Payment transaction from ${senderNode.data.label}\n`;
        code += `    const txn_${node.id.replace(/-/g, '_')} = algosdk.makePaymentTxnWithSuggestedParamsFromObject({\n`;
        code += `        from: ${senderNode.id.replace(/-/g, '_')}.addr,\n`;
        code += `        to: "${receiver}",\n`;
        code += `        amount: ${amount}, // ${node.data.config.amount} ALGO\n`;
        code += `        suggestedParams: params\n`;
        code += `    });\n\n`;
        break;
      }
      case "assetTransfer": {
        const senderNode = sourceNodes.find(n => n?.type === 'account');
        if (!senderNode) continue;
        const receiver = node.data.config.receiver || "RECEIVER_ALGORAND_ADDRESS";
        const amount = node.data.config.amount || 0;
        const assetID = node.data.config.assetId || 0;
        code += `    // Asset transfer from ${senderNode.data.label}\n`;
        code += `    const txn_${node.id.replace(/-/g, '_')} = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({\n`;
        code += `        from: ${senderNode.id.replace(/-/g, '_')}.addr,\n`;
        code += `        to: "${receiver}",\n`;
        code += `        assetIndex: ${assetID}, // ASA ID\n`;
        code += `        amount: ${amount},\n`;
        code += `        suggestedParams: params\n`;
        code += `    });\n\n`;
        break;
      }
      case "signTxn": {
        const txnNodes = sourceNodes.filter(n => n?.type === 'payment' || n?.type === 'assetTransfer');
        if (txnNodes.length === 0) continue;
        const senderNode = accountNodes.find(acc => edges.some(edge => edge.source === acc.id && edge.target === txnNodes[0]?.id));
        if (!senderNode) continue;

        code += `    // Signing transaction with ${senderNode.data.label}'s key\n`;
        code += `    const signedTxn_${node.id.replace(/-/g, '_')} = txn_${txnNodes[0]?.id.replace(/-/g, '_')}.signTxn(${senderNode.id.replace(/-/g, '_')}.sk);\n`;
        code += `    console.log("Transaction signed by ${senderNode.data.label}.");\n\n`;
        break;
      }
      case "executeTxn": {
        const signedTxnNodes = sourceNodes.filter(n => n?.type === 'signTxn');
        if (signedTxnNodes.length === 0) continue;

        code += `    // Executing transaction\n`;
        code += `    const { txId } = await algodClient.sendRawTransaction(signedTxn_${signedTxnNodes[0]?.id.replace(/-/g, '_')}).do();\n`;
        code += `    console.log("Transaction sent with ID:", txId);\n`;
        code += `    // Wait for confirmation\n`;
        code += `    const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);\n`;
        code += `    console.log("Transaction confirmed in round", confirmedTxn['confirmed-round']);\n\n`;
        break;
      }
    }
  }

  code += `}\n\n`;
  code += `main().catch(console.error);\n`;

  return code;
}

const topologicalSort = (nodes: Node[], edges: Edge[]): Node[] => {
  const sorted: Node[] = [];
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adj.set(node.id, []);
  }

  for (const edge of edges) {
    adj.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }

  const queue = nodes.filter(node => inDegree.get(node.id) === 0);

  while (queue.length > 0) {
    const u = queue.shift()!;
    sorted.push(u);

    adj.get(u.id)?.forEach(vId => {
      inDegree.set(vId, (inDegree.get(vId) || 0) - 1);
      if (inDegree.get(vId) === 0) {
        const node = nodes.find(n => n.id === vId);
        if (node) queue.push(node);
      }
    });
  }

  return sorted;
};
