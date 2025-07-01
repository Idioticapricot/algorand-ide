"use client"
import { Square, Hammer, TestTube, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BuildToolbarProps {
  onBuild: () => void
  onTest: () => void
  onDeploy: () => void
  isBuilding: boolean
  onStop: () => void
  isWebContainerReady: boolean
}

export function BuildToolbar({ onBuild, onTest, onDeploy, isBuilding, onStop, isWebContainerReady }: BuildToolbarProps) {
  return (
    <div className="h-12 bg-[#2d2d30] border-b border-[#3e3e42] flex items-center justify-center px-4">
      <div className="flex items-center gap-2">
        <Button
          onClick={onBuild}
          disabled={isBuilding || !isWebContainerReady}
          size="sm"
          className="bg-[#0e639c] hover:bg-[#1177bb] text-white px-4 py-2 h-8"
        >
          <Hammer className="w-4 h-4 mr-2" />
          Build
        </Button>

        <Button
          onClick={onTest}
          disabled={isBuilding || !isWebContainerReady}
          size="sm"
          variant="outline"
          className="border-[#3e3e42] text-[#cccccc] hover:bg-[#37373d] px-4 py-2 h-8 bg-transparent"
        >
          <TestTube className="w-4 h-4 mr-2" />
          Test
        </Button>

        <Button
          onClick={onDeploy}
          disabled={isBuilding || !isWebContainerReady}
          size="sm"
          variant="outline"
          className="border-[#3e3e42] text-[#cccccc] hover:bg-[#37373d] px-4 py-2 h-8 bg-transparent"
        >
          <Rocket className="w-4 h-4 mr-2" />
          Deploy
        </Button>

        {isBuilding && (
          <Button onClick={onStop} size="sm" variant="destructive" className="px-4 py-2 h-8">
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        )}

        <div className="ml-4 flex items-center gap-2">
          {isBuilding && (
            <>
              <div className="w-2 h-2 bg-[#0e639c] rounded-full animate-pulse"></div>
              <span className="text-sm text-[#cccccc]">Building...</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
