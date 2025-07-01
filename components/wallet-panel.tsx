"use client"

import { useState, useEffect } from "react"
import { X, Send, RefreshCw, ExternalLink, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WalletPanelProps {
  wallet?: {
    address: string
    balance: number
    privateKey: string
    mnemonic: string
    transactions?: any[]
    algoPrice?: number
  }
  onClose: () => void
}

export function WalletPanel({ wallet, onClose }: WalletPanelProps) {
  const [sendAmount, setSendAmount] = useState("")
  const [sendAddress, setSendAddress] = useState("")
  const [algoPrice, setAlgoPrice] = useState(wallet?.algoPrice || 0)

  useEffect(() => {
    const fetchAlgoPrice = async () => {
      try {
        const response = await fetch("https://mainnet.analytics.tinyman.org/api/v1/assets/0/")
        const data = await response.json()
        setAlgoPrice(Number(data.price_in_usd))
      } catch (error) {
        console.error("Error fetching ALGO price:", error)
      }
    }

    if (!wallet?.algoPrice) {
      fetchAlgoPrice()
    }
  }, [wallet?.algoPrice])

  if (!wallet || !wallet.address) {
    return null
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address)
  }

  const balanceInAlgo = wallet.balance / 1000000 // Convert microAlgos to Algos
  const balanceInUSD = balanceInAlgo * algoPrice

  return (
    <div className="h-full bg-[#252526] flex flex-col">
      {/* Header */}
      <div className="h-8 bg-[#2d2d30] flex items-center justify-between px-3 text-xs font-medium border-b border-[#3e3e42]">
        <span>WALLET</span>
        <Button variant="ghost" size="icon" className="w-4 h-4" onClick={onClose}>
          <X className="w-3 h-3" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {/* Wallet Info */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded"></div>
            <div>
              <div className="text-sm font-medium">Algorand Wallet</div>
              <div className="text-xs text-[#969696] flex items-center gap-1">
                {wallet.address || "Invalid Address"}
                <Button variant="ghost" size="icon" className="w-3 h-3" onClick={copyAddress}>
                  <Copy className="w-2 h-2" />
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center mb-4">
            <div className="text-2xl font-bold">{balanceInAlgo.toFixed(6)} ALGO</div>
            {algoPrice > 0 && <div className="text-sm text-[#969696]">${balanceInUSD.toFixed(2)} USD</div>}
            {algoPrice > 0 && <div className="text-xs text-[#969696]">1 ALGO = ${algoPrice.toFixed(4)}</div>}
          </div>

          {/* Send Button */}
          <Button className="w-full mb-4 bg-[#0e639c] hover:bg-[#1177bb]">
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>

        {/* Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Transactions</h3>
            <Button variant="ghost" size="icon" className="w-4 h-4">
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 text-xs text-[#969696] pb-2 border-b border-[#3e3e42]">
              <span>Type</span>
              <span>Amount</span>
              <span>Time</span>
            </div>

            {wallet.transactions && wallet.transactions.length > 0 ? (
              wallet.transactions.slice(0, 10).map((tx, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 text-xs py-1 hover:bg-[#2a2d2e] rounded">
                  <span className="text-[#569cd6]">{tx["tx-type"] || "pay"}</span>
                  <span>{((tx["payment-transaction"]?.amount || 0) / 1000000).toFixed(6)}</span>
                  <span>{new Date(tx["round-time"] * 1000).toLocaleTimeString()}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-[#969696] text-center py-4">No transactions found</div>
            )}
          </div>

          <div className="mt-4 text-center">
            <Button variant="ghost" className="text-xs text-[#569cd6]">
              <ExternalLink className="w-3 h-3 mr-1" />
              View on AlgoExplorer
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
