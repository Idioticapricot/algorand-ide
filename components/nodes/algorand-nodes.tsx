"use client"

import { Handle, Position } from "@xyflow/react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect } from "react"

interface AlgorandNodeProps {
  data: {
    label: string
    nodeType: string
    config?: any
  }
  selected?: boolean
}

export function AccountNode({ data, selected }: AlgorandNodeProps) {
  useEffect(() => {
    if (!data.config) {
      data.config = {};
    }
    if (!data.config.mnemonic) {
      const storedMnemonic = localStorage.getItem("mnemonic");
      if (storedMnemonic) {
        data.config.mnemonic = storedMnemonic;
      }
    } else {
      localStorage.setItem("mnemonic", data.config.mnemonic);
    }
  }, [data.config]);

  return (
    <div className="relative">
      <Card className={`min-w-[180px] bg-blue-600 border-blue-500 ${selected ? "ring-2 ring-blue-400" : ""}`}>
        <CardContent className="p-3">
          <div className="text-white font-semibold text-sm mb-1">ACCOUNT</div>
          <div className="text-blue-100 text-xs">Algorand Account</div>
          <div className="text-blue-100 text-xs mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
            Mnemonic: {data.config?.mnemonic ? `${data.config.mnemonic.substring(0, 10)}...` : "Not set"}
          </div>
          <Badge variant="secondary" className="mt-2 text-xs">
            {data.config?.address ? "Connected" : "New"}
          </Badge>
        </CardContent>
      </Card>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-400 border-2 border-white" />
    </div>
  )
}

export function PaymentNode({ data, selected }: AlgorandNodeProps) {
  return (
    <div className="relative">
      <Card className={`min-w-[180px] bg-green-600 border-green-500 ${selected ? "ring-2 ring-green-400" : ""}`}>
        <CardContent className="p-3">
          <div className="text-white font-semibold text-sm mb-1">PAYMENT</div>
          <div className="text-green-100 text-xs">Send ALGO</div>
          <div className="text-green-100 text-xs mt-1">Amount: {data.config?.amount || "0"} ALGO</div>
        </CardContent>
      </Card>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-green-400 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-green-400 border-2 border-white" />
    </div>
  )
}

export function AssetTransferNode({ data, selected }: AlgorandNodeProps) {
  return (
    <div className="relative">
      <Card className={`min-w-[180px] bg-purple-600 border-purple-500 ${selected ? "ring-2 ring-purple-400" : ""}`}>
        <CardContent className="p-3">
          <div className="text-white font-semibold text-sm mb-1">ASSET TRANSFER</div>
          <div className="text-purple-100 text-xs">Transfer ASA</div>
          <div className="text-purple-100 text-xs mt-1">Asset ID: {data.config?.assetId || "None"}</div>
        </CardContent>
      </Card>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-400 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-400 border-2 border-white" />
    </div>
  )
}

export function ApplicationCallNode({ data, selected }: AlgorandNodeProps) {
  return (
    <div className="relative">
      <Card className={`min-w-[180px] bg-orange-600 border-orange-500 ${selected ? "ring-2 ring-orange-400" : ""}`}>
        <CardContent className="p-3">
          <div className="text-white font-semibold text-sm mb-1">APP CALL</div>
          <div className="text-orange-100 text-xs">Smart Contract Call</div>
          <div className="text-orange-100 text-xs mt-1">App ID: {data.config?.appId || "None"}</div>
        </CardContent>
      </Card>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-orange-400 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-orange-400 border-2 border-white" />
    </div>
  )
}

export function AssetCreateNode({ data, selected }: AlgorandNodeProps) {
  return (
    <div className="relative">
      <Card className={`min-w-[180px] bg-yellow-600 border-yellow-500 ${selected ? "ring-2 ring-yellow-400" : ""}`}>
        <CardContent className="p-3">
          <div className="text-white font-semibold text-sm mb-1">CREATE ASSET</div>
          <div className="text-yellow-100 text-xs">Create ASA</div>
          <div className="text-yellow-100 text-xs mt-1">Total: {data.config?.total || "1000"}</div>
        </CardContent>
      </Card>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-yellow-400 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-yellow-400 border-2 border-white" />
    </div>
  )
}

export function KeyRegNode({ data, selected }: AlgorandNodeProps) {
  return (
    <div className="relative">
      <Card className={`min-w-[180px] bg-red-600 border-red-500 ${selected ? "ring-2 ring-red-400" : ""}`}>
        <CardContent className="p-3">
          <div className="text-white font-semibold text-sm mb-1">KEY REG</div>
          <div className="text-red-100 text-xs">Key Registration</div>
          <div className="text-red-100 text-xs mt-1">Online: {data.config?.online ? "Yes" : "No"}</div>
        </CardContent>
      </Card>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-red-400 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-red-400 border-2 border-white" />
    </div>
  )
}

export function AssetFreezeNode({ data, selected }: AlgorandNodeProps) {  // Added for flow builder
  return (
    <div className="relative">
      <Card className={`min-w-[180px] bg-teal-600 border-teal-500 ${selected ? "ring-2 ring-teal-400" : ""}`}>
        <CardContent className="p-3">
          <div className="text-white font-semibold text-sm mb-1">ASSET FREEZE</div>
          <div className="text-teal-100 text-xs">Freeze/Unfreeze ASA</div>
          <div className="text-teal-100 text-xs mt-1">Asset ID: {data.config?.assetId || "None"}</div>
        </CardContent>
      </Card>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-teal-400 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-teal-400 border-2 border-white" />
    </div>
  )
}

export function ConditionNode({ data, selected }: AlgorandNodeProps) {
  return (
    <div className="relative">
      <Card className={`min-w-[180px] bg-cyan-600 border-cyan-500 ${selected ? "ring-2 ring-cyan-400" : ""}`}>
        <CardContent className="p-3">
          <div className="text-white font-semibold text-sm mb-1">CONDITION</div>
          <div className="text-cyan-100 text-xs">If/Else Logic</div>
          <div className="text-cyan-100 text-xs mt-1">Type: {data.config?.condition || "Balance"}</div>
        </CardContent>
      </Card>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-cyan-400 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-cyan-400 border-2 border-white" id="true" />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-cyan-400 border-2 border-white"
        id="false"
      />
    </div>
  )
}

export function OutputNode({ data, selected }: AlgorandNodeProps) {
  return (
    <div className="relative">
      <Card className={`min-w-[180px] bg-gray-600 border-gray-500 ${selected ? "ring-2 ring-gray-400" : ""}`}>
        <CardContent className="p-3">
          <div className="text-white font-semibold text-sm mb-1">OUTPUT</div>
          <div className="text-gray-100 text-xs">Display Result</div>
          <div className="text-gray-100 text-xs mt-1">Format: {data.config?.format || "JSON"}</div>
        </CardContent>
      </Card>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-400 border-2 border-white" />
    </div>
  )
}

export function SignTxnNode({ data, selected }: AlgorandNodeProps) {
  return (
    <div className="relative">
      <Card className={`min-w-[180px] bg-indigo-600 border-indigo-500 ${selected ? "ring-2 ring-indigo-400" : ""}`}>
        <CardContent className="p-3">
          <div className="text-white font-semibold text-sm mb-1">SIGN TXN</div>
          <div className="text-indigo-100 text-xs">Sign Transaction</div>
          <div className="text-indigo-100 text-xs mt-1">Method: {data.config?.method || "Private Key"}</div>
        </CardContent>
      </Card>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-indigo-400 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-indigo-400 border-2 border-white" />
    </div>
  )
}

export function ExecuteTxnNode({ data, selected }: AlgorandNodeProps) {
  return (
    <div className="relative">
      <Card className={`min-w-[180px] bg-pink-600 border-pink-500 ${selected ? "ring-2 ring-pink-400" : ""}`}>
        <CardContent className="p-3">
          <div className="text-white font-semibold text-sm mb-1">EXECUTE TXN</div>
          <div className="text-pink-100 text-xs">Execute Transaction</div>
          <div className="text-pink-100 text-xs mt-1">Network: {data.config?.network || "TestNet"}</div>
        </CardContent>
      </Card>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-pink-400 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-pink-400 border-2 border-white" />
    </div>
  )
}
