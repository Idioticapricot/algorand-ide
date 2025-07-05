"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Eye, 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  Copy,
  Loader2
} from "lucide-react"

interface TransactionBuilderProps {
  contract: any
  method: any
  args: any[]
  onArgsChange: (args: any[]) => void
  onExecute: () => void
  isExecuting: boolean
  wallet: any
}

interface SimulationResult {
  success: boolean
  logs?: string[]
  error?: string
  returnValue?: any
  gasUsed?: number
  txnId?: string
}

// Helper to parse tuple type string, e.g. (uint64,string,address)
function parseTupleType(type: string): string[] {
  // Remove outer parentheses
  let t = type.trim()
  if (t.startsWith('(') && t.endsWith(')')) t = t.slice(1, -1)
  // Split by comma, but not inside nested parentheses
  const result = []
  let depth = 0, last = 0
  for (let i = 0; i < t.length; i++) {
    if (t[i] === '(') depth++
    if (t[i] === ')') depth--
    if (t[i] === ',' && depth === 0) {
      result.push(t.slice(last, i).trim())
      last = i + 1
    }
  }
  if (last < t.length) result.push(t.slice(last).trim())
  return result
}

// Recursively render argument input(s)
function ArgInput({
  arg,
  value,
  onChange,
  labelPrefix = ""
}: {
  arg: any
  value: any
  onChange: (v: any) => void
  labelPrefix?: string
}) {
  // Tuple type: (type1,type2,...) or tuple
  if (arg.type.startsWith('(') && arg.type.endsWith(')')) {
    const tupleTypes = parseTupleType(arg.type)
    return (
      <div className="border rounded p-2 mb-2 bg-muted/30">
        <div className="font-mono text-xs mb-1">{labelPrefix}{arg.name} (tuple)</div>
        {tupleTypes.map((t, i) => (
          <ArgInput
            key={i}
            arg={{ name: `${arg.name || 'tuple'}[${i}]`, type: t }}
            value={value?.[i] ?? ''}
            onChange={v => {
              const arr = Array.isArray(value) ? [...value] : []
              arr[i] = v
              onChange(arr)
            }}
            labelPrefix={labelPrefix + (arg.name ? arg.name + '.' : '')}
          />
        ))}
      </div>
    )
  }
  // Array of tuples (not handled in this simple version)
  // You can extend this for tuple[]

  // Primitive types
  if (arg.type === 'string') {
    return (
      <div className="space-y-1">
        <Label className="text-sm font-medium">{labelPrefix}{arg.name} <span className="text-muted-foreground">({arg.type})</span></Label>
        <Textarea
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={`Enter ${arg.name}...`}
          className="font-mono text-sm"
        />
      </div>
    )
  }
  if (arg.type.startsWith('uint')) {
    return (
      <div className="space-y-1">
        <Label className="text-sm font-medium">{labelPrefix}{arg.name} <span className="text-muted-foreground">({arg.type})</span></Label>
        <Input
          type="number"
          value={value || ''}
          onChange={e => onChange(Number(e.target.value))}
          placeholder={`Enter ${arg.name}...`}
          className="font-mono text-sm"
        />
      </div>
    )
  }
  if (arg.type === 'address') {
    return (
      <div className="space-y-1">
        <Label className="text-sm font-medium">{labelPrefix}{arg.name} <span className="text-muted-foreground">({arg.type})</span></Label>
        <Input
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="Enter Algorand address..."
          className="font-mono text-sm"
        />
      </div>
    )
  }
  if (arg.type === 'boolean') {
    return (
      <div className="space-y-1">
        <Label className="text-sm font-medium">{labelPrefix}{arg.name} <span className="text-muted-foreground">({arg.type})</span></Label>
        <div className="flex gap-2">
          <Button
            className={value === true ? '' : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'}
            onClick={() => onChange(true)}
          >True</Button>
          <Button
            className={value === false ? '' : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'}
            onClick={() => onChange(false)}
          >False</Button>
        </div>
      </div>
    )
  }
  // Fallback
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium">{labelPrefix}{arg.name} <span className="text-muted-foreground">({arg.type})</span></Label>
      <Input
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={`Enter ${arg.name}...`}
        className="font-mono text-sm"
      />
    </div>
  )
}

export function TransactionBuilder({
  contract,
  method,
  args,
  onArgsChange,
  onExecute,
  isExecuting,
  wallet
}: TransactionBuilderProps) {
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [fee, setFee] = useState(1000)
  const [note, setNote] = useState("")

  const simulateTransaction = async () => {
    if (!wallet || !contract || !method) return
    setIsSimulating(true)
    setSimulationResult(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockResult: SimulationResult = {
        success: Math.random() > 0.3,
        logs: [
          "Application call to app " + contract.appId,
          `Method: ${method.name}`,
          "Args: " + JSON.stringify(args),
          "Gas used: 1000",
          "Success: true"
        ],
        returnValue: "0x1234567890abcdef",
        gasUsed: 1000,
        txnId: "mock-txn-id-" + Date.now()
      }
      setSimulationResult(mockResult)
    } catch (error) {
      setSimulationResult({
        success: false,
        error: error instanceof Error ? error.message : "Simulation failed"
      })
    } finally {
      setIsSimulating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getMethodType = (method: any) => {
    if (method.name === "createApplication") return "create"
    if (method.name === "updateApplication") return "update"
    if (method.name === "deleteApplication") return "delete"
    return "call"
  }

  // Render all method arguments, supporting tuples
  const renderArgs = () => (
    <>
      {method.args.map((arg: any, index: number) => (
        <ArgInput
          key={arg.name || index}
          arg={arg}
          value={args[index]}
          onChange={v => {
            const newArgs = [...args]
            newArgs[index] = v
            onArgsChange(newArgs)
          }}
        />
      ))}
    </>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Transaction Builder</h3>
          <p className="text-sm text-muted-foreground">
            Build and execute transactions for your smart contract
          </p>
        </div>
        <Badge>
          {getMethodType(method).toUpperCase()}
        </Badge>
      </div>

      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-4">
          {/* Contract Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Contract Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">App ID:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{contract.appId}</span>
                  <Button
                    className="h-4 w-4 p-0"
                    onClick={() => copyToClipboard(contract.appId)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Method:</span>
                <span className="font-mono text-sm">{method.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sender:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">
                    {wallet?.address ? `${wallet.address.substring(0, 10)}...${wallet.address.substring(wallet.address.length - 10)}` : "No wallet"}
                  </span>
                  <Button
                    className="h-4 w-4 p-0"
                    onClick={() => wallet?.address && copyToClipboard(wallet.address)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Method Arguments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Method Arguments</CardTitle>
              <CardDescription>
                Provide values for the method parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderArgs()}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={simulateTransaction}
              disabled={isSimulating || !wallet}
              className="flex-1 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            >
              {isSimulating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              Simulate
            </Button>
            <Button
              onClick={onExecute}
              disabled={isExecuting || !wallet}
              className="flex-1"
            >
              {isExecuting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Execute Transaction
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="simulation" className="space-y-4">
          {simulationResult ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {simulationResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                  Simulation Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {simulationResult.success ? (
                  <>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <Badge className="ml-2">Success</Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Gas Used:</span>
                        <span className="ml-2 font-mono">{simulationResult.gasUsed}</span>
                      </div>
                    </div>
                    
                    {simulationResult.returnValue && (
                      <div>
                        <Label className="text-sm font-medium">Return Value:</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="bg-muted px-2 py-1 rounded text-sm">
                            {simulationResult.returnValue}
                          </code>
                          <Button
                            className="h-4 w-4 p-0"
                            onClick={() => copyToClipboard(simulationResult.returnValue!)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {simulationResult.logs && (
                      <div>
                        <Label className="text-sm font-medium">Logs:</Label>
                        <div className="bg-muted p-3 rounded mt-1 max-h-32 overflow-y-auto">
                          {simulationResult.logs.map((log, index) => (
                            <div key={index} className="text-xs font-mono text-muted-foreground">
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {simulationResult.error || "Simulation failed"}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Eye className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click "Simulate" to preview the transaction
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Advanced Options</CardTitle>
              <CardDescription>
                Configure additional transaction parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fee" className="text-sm font-medium">
                  Transaction Fee (microAlgos)
                </Label>
                <Input
                  id="fee"
                  type="number"
                  value={fee}
                  onChange={(e) => setFee(Number(e.target.value))}
                  placeholder="1000"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum fee: 1000 microAlgos (0.001 ALGO)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note" className="text-sm font-medium">
                  Transaction Note (optional)
                </Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note to this transaction..."
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 