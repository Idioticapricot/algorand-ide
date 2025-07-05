"use client"

import { useState, useEffect } from "react"
import { X, Send, RefreshCw, ExternalLink, Copy, Loader2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Transaction {
  id: string
  "tx-type": string
  "round-time": number
  "payment-transaction"?: {
    amount: number
    receiver: string
  }
  "asset-transfer-transaction"?: {
    amount: number
    receiver: string
  }
  "application-transaction"?: {
    "application-id": number
  }
  sender: string
  "confirmed-round": number
}

interface WalletPanelProps {
  wallet?: {
    address: string
    balance: number
    privateKey: string
    mnemonic: string
    transactions?: Transaction[]
    algoPrice?: number
  }
  onClose: () => void
}

export function WalletPanel({ wallet, onClose }: WalletPanelProps) {
  const [sendAmount, setSendAmount] = useState("")
  const [sendAddress, setSendAddress] = useState("")
  const [algoPrice, setAlgoPrice] = useState(wallet?.algoPrice || 0)
  const [realBalance, setRealBalance] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet')

  // Algorand Network URLs
  const NETWORK_CONFIG = {
    testnet: {
      indexer: "https://testnet-idx.algonode.cloud",
      algod: "https://testnet-api.algonode.cloud",
      explorer: "https://testnet.algoexplorer.io"
    },
    mainnet: {
      indexer: "https://mainnet-idx.algonode.cloud", 
      algod: "https://mainnet-api.algonode.cloud",
      explorer: "https://algoexplorer.io"
    }
  }

  const currentNetwork = NETWORK_CONFIG[network]

  const fetchAlgoPrice = async () => {
    try {
      const response = await fetch("https://mainnet.analytics.tinyman.org/api/v1/assets/0/")
      const data = await response.json()
      setAlgoPrice(Number(data.price_in_usd))
    } catch (error) {
      console.error("Error fetching ALGO price:", error)
      // Fallback price
      setAlgoPrice(0.15)
    }
  }

  const fetchBalanceAndTransactions = async () => {
    if (!wallet?.address) return

    setIsLoading(true)
    setError(null)

    try {
      // Fetch account info to get balance
      const accountResponse = await fetch(`${currentNetwork.indexer}/v2/accounts/${wallet.address}`)
      if (!accountResponse.ok) {
        throw new Error(`Failed to fetch account info: ${accountResponse.status}`)
      }
      
      const accountData = await accountResponse.json()
      const balance = accountData.account.amount || 0
      setRealBalance(balance)

      // Fetch recent transactions
      const txnsResponse = await fetch(
        `${currentNetwork.indexer}/v2/accounts/${wallet.address}/transactions?limit=20&order=desc`
      )
      
      if (!txnsResponse.ok) {
        throw new Error(`Failed to fetch transactions: ${txnsResponse.status}`)
      }

      const txnsData = await txnsResponse.json()
      const recentTransactions = txnsData.transactions || []
      setTransactions(recentTransactions)

    } catch (error) {
      console.error("Error fetching wallet data:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch wallet data")
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    await fetchBalanceAndTransactions()
    setIsRefreshing(false)
  }

  const handleBackupAccount = () => {
    if (wallet) {
      const walletData = {
        address: wallet.address,
        mnemonic: wallet.mnemonic,
        privateKey: wallet.privateKey,
      };
      const json = JSON.stringify(walletData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `algorand_wallet_${wallet.address.substring(0, 8)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    if (!wallet?.algoPrice) {
      fetchAlgoPrice()
    }
  }, [wallet?.algoPrice])

  useEffect(() => {
    if (wallet?.address) {
      fetchBalanceAndTransactions()
    }
  }, [wallet?.address, network])

  if (!wallet || !wallet.address) {
    return null
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address)
  }

  const getTransactionType = (tx: Transaction) => {
    if (tx["tx-type"] === "pay") return "Payment"
    if (tx["tx-type"] === "axfer") return "Asset Transfer"
    if (tx["tx-type"] === "appl") return "Application"
    return tx["tx-type"] || "Unknown"
  }

  const getTransactionAmount = (tx: Transaction) => {
    if (tx["payment-transaction"]) {
      const amount = tx["payment-transaction"].amount
      return amount > 0 ? `+${(amount / 1000000).toFixed(6)}` : `${(amount / 1000000).toFixed(6)}`
    }
    if (tx["asset-transfer-transaction"]) {
      const amount = tx["asset-transfer-transaction"].amount
      return amount > 0 ? `+${amount}` : `${amount}`
    }
    if (tx["application-transaction"]) {
      return `App ${tx["application-transaction"]["application-id"]}`
    }
    return "N/A"
  }

  const getTransactionDirection = (tx: Transaction) => {
    if (tx.sender === wallet.address) {
      return "out"
    }
    return "in"
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const balanceInAlgo = (realBalance !== null ? realBalance : wallet.balance) / 1000000
  const balanceInUSD = balanceInAlgo * algoPrice

  return (
    <div className="h-full bg-[#252526] flex flex-col">
      {/* Header */}
      <div className="h-8 bg-[#2d2d30] flex items-center justify-between px-3 text-xs font-medium border-b border-[#3e3e42]">
        <div className="flex items-center gap-2">
          <span>WALLET</span>
          <select 
            value={network}
            onChange={(e) => setNetwork(e.target.value as 'testnet' | 'mainnet')}
            className="bg-[#1e1e1e] text-[#cccccc] border border-[#3e3e42] rounded px-1 text-xs"
          >
            <option value="testnet">TestNet</option>
            <option value="mainnet">MainNet</option>
          </select>
        </div>
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
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading balance...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{balanceInAlgo.toFixed(6)} ALGO</div>
                {algoPrice > 0 && <div className="text-sm text-[#969696]">${balanceInUSD.toFixed(2)} USD</div>}
                {algoPrice > 0 && <div className="text-xs text-[#969696]">1 ALGO = ${algoPrice.toFixed(4)}</div>}
                {realBalance !== null && (
                  <div className="text-xs text-green-400 mt-1">✓ Live data</div>
                )}
                {realBalance === null && !isLoading && (
                  <div className="text-xs text-yellow-400 mt-1">⚠ Using cached data</div>
                )}
              </>
            )}
            {error && (
              <div className="text-xs text-red-400 mt-1">{error}</div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-4">
            <Button className="flex-1 bg-[#0e639c] hover:bg-[#1177bb]">
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
            <Button 
              variant="outline" 
              className="border-[#3e3e42] text-[#cccccc] hover:bg-[#37373d]"
              onClick={refreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-[#3e3e42] text-[#cccccc] hover:bg-[#37373d]"
              onClick={handleBackupAccount}
            >
              <Download className="w-4 h-4 mr-2" />
              Backup Account
            </Button>
          </div>
        </div>

        {/* Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Recent Transactions</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-4 h-4" 
              onClick={refreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2 text-xs text-[#969696] pb-2 border-b border-[#3e3e42]">
              <span>Type</span>
              <span>Amount</span>
              <span>Direction</span>
              <span>Time</span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm">Loading transactions...</span>
              </div>
            ) : transactions.length > 0 ? (
              transactions.slice(0, 10).map((tx, index) => {
                const direction = getTransactionDirection(tx)
                return (
                  <div key={tx.id || index} className="grid grid-cols-4 gap-2 text-xs py-2 hover:bg-[#2a2d2e] rounded px-1">
                    <span className="text-[#569cd6]">{getTransactionType(tx)}</span>
                    <span className={direction === 'in' ? 'text-green-400' : 'text-red-400'}>
                      {getTransactionAmount(tx)}
                    </span>
                    <span className={direction === 'in' ? 'text-green-400' : 'text-red-400'}>
                      {direction === 'in' ? '↗' : '↘'}
                    </span>
                    <span>{formatTime(tx["round-time"])}</span>
                  </div>
                )
              })
            ) : (
              <div className="text-xs text-[#969696] text-center py-4">
                {error ? "Failed to load transactions" : "No transactions found"}
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              className="text-xs text-[#569cd6]"
              onClick={() => window.open(`https://lora.algokit.io/testnet/account/${wallet.address}`, '_blank')}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View on AlgoExplorer
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
