"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Settings } from "lucide-react"
import type { Node } from "@xyflow/react"

interface NodePropertiesPanelProps {
  selectedNode: Node | null
  onClose: () => void
  onUpdateNode: (nodeId: string, data: any) => void
}

export function NodePropertiesPanel({ selectedNode, onClose, onUpdateNode }: NodePropertiesPanelProps) {
  const [config, setConfig] = useState(selectedNode?.data?.config || {})

  if (!selectedNode) return null

  const handleSave = () => {
    onUpdateNode(selectedNode.id, {
      ...selectedNode.data,
      config: config,
    })
    onClose()
  }

  const renderConfigFields = () => {
    switch (selectedNode.data.nodeType) {
      case "account":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="address" className="text-white">
                Account Address
              </Label>
              <Input
                id="address"
                value={config.address || ""}
                onChange={(e) => setConfig({ ...config, address: e.target.value })}
                placeholder="Enter Algorand address"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="mnemonic" className="text-white">
                Mnemonic (Optional)
              </Label>
              <Textarea
                id="mnemonic"
                value={config.mnemonic || ""}
                onChange={(e) => setConfig({ ...config, mnemonic: e.target.value })}
                placeholder="Enter 25-word mnemonic phrase"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
        )

      case "payment":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount" className="text-white">
                Amount (ALGO)
              </Label>
              <Input
                id="amount"
                type="number"
                value={config.amount || ""}
                onChange={(e) => setConfig({ ...config, amount: Number.parseFloat(e.target.value) })}
                placeholder="0.0"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="receiver" className="text-white">
                Receiver Address
              </Label>
              <Input
                id="receiver"
                value={config.receiver || ""}
                onChange={(e) => setConfig({ ...config, receiver: e.target.value })}
                placeholder="Enter receiver address"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="note" className="text-white">
                Note (Optional)
              </Label>
              <Input
                id="note"
                value={config.note || ""}
                onChange={(e) => setConfig({ ...config, note: e.target.value })}
                placeholder="Transaction note"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
        )

      case "assetTransfer":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="assetId" className="text-white">
                Asset ID
              </Label>
              <Input
                id="assetId"
                type="number"
                value={config.assetId || ""}
                onChange={(e) => setConfig({ ...config, assetId: Number.parseInt(e.target.value) })}
                placeholder="Enter Asset ID"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="amount" className="text-white">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={config.amount || ""}
                onChange={(e) => setConfig({ ...config, amount: Number.parseInt(e.target.value) })}
                placeholder="0"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="receiver" className="text-white">
                Receiver Address
              </Label>
              <Input
                id="receiver"
                value={config.receiver || ""}
                onChange={(e) => setConfig({ ...config, receiver: e.target.value })}
                placeholder="Enter receiver address"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
        )

      case "assetCreate":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="total" className="text-white">
                Total Supply
              </Label>
              <Input
                id="total"
                type="number"
                value={config.total || ""}
                onChange={(e) => setConfig({ ...config, total: Number.parseInt(e.target.value) })}
                placeholder="1000"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="unitName" className="text-white">
                Unit Name
              </Label>
              <Input
                id="unitName"
                value={config.unitName || ""}
                onChange={(e) => setConfig({ ...config, unitName: e.target.value })}
                placeholder="TOKEN"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="assetName" className="text-white">
                Asset Name
              </Label>
              <Input
                id="assetName"
                value={config.assetName || ""}
                onChange={(e) => setConfig({ ...config, assetName: e.target.value })}
                placeholder="My Token"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="decimals" className="text-white">
                Decimals
              </Label>
              <Input
                id="decimals"
                type="number"
                value={config.decimals || ""}
                onChange={(e) => setConfig({ ...config, decimals: Number.parseInt(e.target.value) })}
                placeholder="0"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
        )

      case "applicationCall":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="appId" className="text-white">
                Application ID
              </Label>
              <Input
                id="appId"
                type="number"
                value={config.appId || ""}
                onChange={(e) => setConfig({ ...config, appId: Number.parseInt(e.target.value) })}
                placeholder="Enter App ID"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="method" className="text-white">
                Method
              </Label>
              <Select
                value={config.method || "call"}
                onValueChange={(value) => setConfig({ ...config, method: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="optin">Opt In</SelectItem>
                  <SelectItem value="closeout">Close Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="args" className="text-white">
                Arguments (JSON)
              </Label>
              <Textarea
                id="args"
                value={config.args || ""}
                onChange={(e) => setConfig({ ...config, args: e.target.value })}
                placeholder='["arg1", "arg2"]'
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
        )

      case "condition":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="condition" className="text-white">
                Condition Type
              </Label>
              <Select
                value={config.condition || "balance"}
                onValueChange={(value) => setConfig({ ...config, condition: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="balance">Balance</SelectItem>
                  <SelectItem value="asset">Asset Amount</SelectItem>
                  <SelectItem value="time">Time</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="operator" className="text-white">
                Operator
              </Label>
              <Select
                value={config.operator || ">"}
                onValueChange={(value) => setConfig({ ...config, operator: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value=">">Greater Than</SelectItem>
                  <SelectItem value="<">Less Than</SelectItem>
                  <SelectItem value="==">Equal To</SelectItem>
                  <SelectItem value="!=">Not Equal To</SelectItem>
                  <SelectItem value=">=">Greater Than or Equal</SelectItem>
                  <SelectItem value="<=">Less Than or Equal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="value" className="text-white">
                Value
              </Label>
              <Input
                id="value"
                value={config.value || ""}
                onChange={(e) => setConfig({ ...config, value: e.target.value })}
                placeholder="Comparison value"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
        )

      case "output":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="format" className="text-white">
                Output Format
              </Label>
              <Select
                value={config.format || "JSON"}
                onValueChange={(value) => setConfig({ ...config, format: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="JSON">JSON</SelectItem>
                  <SelectItem value="TEXT">Text</SelectItem>
                  <SelectItem value="TABLE">Table</SelectItem>
                  <SelectItem value="CHART">Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fields" className="text-white">
                Display Fields
              </Label>
              <Textarea
                id="fields"
                value={config.fields || ""}
                onChange={(e) => setConfig({ ...config, fields: e.target.value })}
                placeholder="txId, amount, sender, receiver"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
        )

      default:
        return (
          <div className="text-gray-400 text-center py-4">No configuration options available for this node type.</div>
        )
    }
  }

  return (
    <div className="fixed right-4 top-20 bottom-4 w-80 bg-gray-900/95 backdrop-blur-lg border border-gray-700 rounded-lg z-50 flex flex-col">
      <Card className="h-full bg-transparent border-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4 text-blue-400" />
            <CardTitle className="text-white text-sm">Node Properties</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            <div>
              <Label className="text-white font-semibold">Node Type</Label>
              <Badge variant="secondary" className="mt-1">
                {selectedNode.data.label}
              </Badge>
            </div>
            <div>
              <Label className="text-white font-semibold">Node ID</Label>
              <div className="text-gray-400 text-sm font-mono">{selectedNode.id}</div>
            </div>
            <div className="border-t border-gray-700 pt-4">
              <Label className="text-white font-semibold mb-3 block">Configuration</Label>
              {renderConfigFields()}
            </div>
          </div>
        </CardContent>
        <div className="p-4 border-t border-gray-700">
          <div className="flex space-x-2">
            <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
