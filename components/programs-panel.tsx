"use client"

import React from "react"

interface ProgramsPanelProps {
  deployedContracts: Array<{
    appId: string | number;
    txId: string;
    artifact: string;
    time: number;
  }>;
}

export function ProgramsPanel({ deployedContracts = [] }: ProgramsPanelProps) {
  return (
    <div className="p-4 h-full overflow-auto bg-[#1e1e1e] text-white">
      <h2 className="text-xl font-bold mb-4">Programs</h2>
      <p className="text-sm text-[#cccccc] mb-4">
        This panel displays your deployed contracts.
      </p>
      {deployedContracts.length === 0 ? (
        <p className="text-sm text-[#969696]">No deployed contracts yet.</p>
      ) : (
        <div className="space-y-3">
          {deployedContracts.map((contract, idx) => (
            <div key={contract.appId + contract.txId + idx} className="bg-[#232326] p-3 rounded-lg border border-[#333]">
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium">App ID: <span className="text-[#0e639c]">{contract.appId}</span></div>
                <div className="text-xs text-[#cccccc]">Artifact: {contract.artifact}</div>
                <div className="text-xs text-[#cccccc]">Tx ID: <span className="break-all">{contract.txId}</span></div>
                <div className="text-xs text-[#969696]">{new Date(contract.time).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
