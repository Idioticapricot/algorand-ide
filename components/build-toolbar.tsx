"use client"
import { Square, Hammer, Rocket, ChevronDown, Download, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Save } from "lucide-react"

interface BuildToolbarProps {
  onBuild: () => void
  onDeploy: () => void
  onInstall: () => void;
  onGenerateClient: () => void;
  onDownloadSnapshot: () => void;
  onPublishPlayground: () => void;
  onSave: () => void;
  isBuilding: boolean
  isInstalling: boolean;
  onStop: () => void
  isWebContainerReady: boolean
}

export function BuildToolbar({ 
  onBuild, 
  onDeploy, 
  onInstall, 
  onGenerateClient, 
  onDownloadSnapshot,
  onPublishPlayground,
  onSave,
  isBuilding, 
  isInstalling, 
  onStop, 
  isWebContainerReady
}: BuildToolbarProps) {
  return (
    <div className="h-12 bg-[#2d2d30] border-b border-[#3e3e42] flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Button
          onClick={onInstall}
          disabled={isBuilding || isInstalling || !isWebContainerReady}
          size="sm"
          className="bg-[#0e639c] hover:bg-[#1177bb] text-white px-4 py-2 h-8"
        >
          <Hammer className="w-4 h-4 mr-2" />
          Install
        </Button>
        <Button
          onClick={onBuild}
          disabled={isBuilding || isInstalling || !isWebContainerReady}
          size="sm"
          className="bg-[#0e639c] hover:bg-[#1177bb] text-white px-4 py-2 h-8"
        >
          <Hammer className="w-4 h-4 mr-2" />
          Build
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

        <Button
          onClick={onGenerateClient}
          disabled={isBuilding || !isWebContainerReady}
          size="sm"
          variant="outline"
          className="border-[#3e3e42] text-[#cccccc] hover:bg-[#37373d] px-4 py-2 h-8 bg-transparent"
        >
          <Square className="w-4 h-4 mr-2" />
          Generate Client
        </Button>

        <Button
          onClick={() => {
            console.log('Download Snapshot button clicked');
            onDownloadSnapshot();
          }}
          disabled={isBuilding}
          size="sm"
          variant="outline"
          className="border-[#3e3e42] text-[#cccccc] hover:bg-[#37373d] px-4 py-2 h-8 bg-transparent"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Code
        </Button>

        <Button
          onClick={onPublishPlayground}
          disabled={isBuilding}
          size="sm"
          className="bg-[#0e639c] hover:bg-[#1177bb] text-white px-4 py-2 h-8"
        >
          <Play className="w-4 h-4 mr-2" />
          Publish on Playground
        </Button>

        <Button
          onClick={onSave}
          disabled={isBuilding}
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 h-8"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
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
