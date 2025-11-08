"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Play, 
  Square, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Download,
  Rocket
} from "lucide-react"

interface BuildPanelProps {
  isBuilding: boolean
  buildOutput: string[]
  onBuild: () => void
  onTest: () => void
  onDeploy: () => void
  onStop: () => void
  artifacts: any[]
  onDownloadSnapshot: () => void
}

export function BuildPanel({
  isBuilding,
  buildOutput,
  onBuild,
  onTest,
  onDeploy,
  onStop,
  artifacts,
  onDownloadSnapshot
}: BuildPanelProps) {
  const [activeTab, setActiveTab] = useState<"output" | "artifacts">("output")

  const hasErrors = buildOutput.some(line => 
    line.toLowerCase().includes('error') || 
    line.toLowerCase().includes('failed')
  )

  const hasWarnings = buildOutput.some(line => 
    line.toLowerCase().includes('warning') || 
    line.toLowerCase().includes('warn')
  )

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-white">
      {/* Header */}
      <div className="h-9 bg-[#2d2d30] flex items-center justify-between px-3 text-xs font-medium uppercase tracking-wide border-b border-[#3e3e42] flex-shrink-0">
        <span className="text-[#cccccc]">Build Panel</span>
        <div className="flex items-center gap-1">
          {isBuilding ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={onStop}
              className="h-6 px-2 text-xs"
            >
              <Square className="w-3 h-3 mr-1" />
              Stop
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={onBuild}
                className="h-6 px-2 text-xs"
              >
                <Play className="w-3 h-3 mr-1" />
                Build
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDownloadSnapshot}
                className="h-6 px-2 text-xs"
              >
                <Download className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-3 border-b border-[#3e3e42]">
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={onBuild}
            disabled={isBuilding}
            className="h-8 text-xs"
          >
            <Play className="w-3 h-3 mr-1" />
            Build
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onTest}
            disabled={isBuilding}
            className="h-8 text-xs"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Test
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDeploy}
            disabled={isBuilding}
            className="h-8 text-xs"
          >
            <Rocket className="w-3 h-3 mr-1" />
            Deploy
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-3 py-2 bg-[#252526] border-b border-[#3e3e42] flex items-center gap-2">
        {isBuilding ? (
          <>
            <Clock className="w-4 h-4 text-yellow-500 animate-spin" />
            <span className="text-sm text-yellow-500">Building...</span>
          </>
        ) : hasErrors ? (
          <>
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-500">Build Failed</span>
          </>
        ) : buildOutput.length > 0 ? (
          <>
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-500">Build Successful</span>
          </>
        ) : (
          <>
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">Ready to Build</span>
          </>
        )}
        
        {hasWarnings && (
          <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500">
            Warnings
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#3e3e42]">
        <button
          onClick={() => setActiveTab("output")}
          className={`px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === "output"
              ? "bg-[#1e1e1e] text-white border-b-2 border-[#0e639c]"
              : "bg-[#2d2d30] text-[#cccccc] hover:bg-[#37373d]"
          }`}
        >
          <FileText className="w-3 h-3 mr-1 inline" />
          Output ({buildOutput.length})
        </button>
        <button
          onClick={() => setActiveTab("artifacts")}
          className={`px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === "artifacts"
              ? "bg-[#1e1e1e] text-white border-b-2 border-[#0e639c]"
              : "bg-[#2d2d30] text-[#cccccc] hover:bg-[#37373d]"
          }`}
        >
          <FileText className="w-3 h-3 mr-1 inline" />
          Artifacts ({artifacts.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "output" ? (
          <ScrollArea className="h-full">
            <div className="p-3">
              {buildOutput.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No build output yet</p>
                  <p className="text-xs mt-1">Click Build to see output here</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {buildOutput.map((line, index) => (
                    <div
                      key={index}
                      className={`text-xs font-mono p-1 rounded ${
                        line.toLowerCase().includes('error') || line.toLowerCase().includes('failed')
                          ? "text-red-400 bg-red-900/20"
                          : line.toLowerCase().includes('warning') || line.toLowerCase().includes('warn')
                          ? "text-yellow-400 bg-yellow-900/20"
                          : line.toLowerCase().includes('success') || line.toLowerCase().includes('completed')
                          ? "text-green-400 bg-green-900/20"
                          : "text-gray-300"
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-3">
              {artifacts.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No artifacts found</p>
                  <p className="text-xs mt-1">Build your project to generate artifacts</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {artifacts.map((artifact, index) => (
                    <div
                      key={index}
                      className="p-3 bg-[#2d2d30] rounded border border-[#3e3e42] hover:bg-[#37373d] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium">{artifact.name}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Size: {artifact.size || 'Unknown'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}