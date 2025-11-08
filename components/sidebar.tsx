"use client"

import type React from "react"

import { useState } from "react"
import {
  FolderOpen,
  Hammer,
  Code,
  BookOpen,
  Settings,
  FilePlus,
  FolderPlus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Folder,
  File,
  MessageSquare,
  Wrench,
} from "lucide-react"
import FileTree from "@/components/file-tree"
import { cn } from "@/lib/utils"
import { FileText } from "lucide-react";

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  activeFile: string
  onFileSelect: (file: string) => void
  webcontainer?: any
  onCreateFile: (filePath: string) => void
  onRenameFile: (oldPath: string, newPath: string) => void
  onDeleteFile: (filePath: string) => void
  isWebContainerReady: boolean
  fileStructure: any
  onArtifactFileSelect: (filePath: string) => void
  deployedContracts?: any[]
  onContractSelect?: (contract: any) => void
}

const sidebarSections = [
  { id: "explorer", icon: FolderOpen, label: "Explorer" },
  { id: "build", icon: Hammer, label: "Build & Deploy" },
  { id: "programs", icon: Code, label: "Programs" },
  { id: "tutorials", icon: BookOpen, label: "Tutorials" },
  { id: "settings", icon: Settings, label: "Settings" },
  { id: "ai-chat", icon: MessageSquare, label: "AI Chat" },
  { id: "build-panel", icon: Wrench, label: "Build Panel" },
]



export function Sidebar({
  activeSection,
  onSectionChange,
  activeFile,
  onFileSelect,
  webcontainer,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
  isWebContainerReady,
  fileStructure: fileStructureProp,
  onArtifactFileSelect,
  deployedContracts = [],
  onContractSelect,
}: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["src", "tests", "scripts"]))
  const [expandedArtifactsFolders, setExpandedArtifactsFolders] = useState<Set<string>>(new Set())
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string } | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState<{ type: "file" | "folder"; path: string } | null>(null)
  const [newItemName, setNewItemName] = useState("")

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedFolders(newExpanded)
  }

  const toggleArtifactsFolder = (path: string) => {
    const newExpanded = new Set(expandedArtifactsFolders)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedArtifactsFolders(newExpanded)
  }

  const handleContextMenu = (e: React.MouseEvent, path: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, path })
  }

  const createFile = async (path: string, name: string) => {
    const fullPath = path ? `${path}/${name}` : name
    await onCreateFile(fullPath)
    setShowCreateDialog(null)
    setNewItemName("")
  }

  const createFolder = async (path: string, name: string) => {
    if (!webcontainer) return
    const fullPath = path ? `${path}/${name}` : name
    await webcontainer.fs.mkdir(fullPath, { recursive: true })
    setShowCreateDialog(null)
    setNewItemName("")
  }

  const deleteItem = (path: string) => {
    onDeleteFile(path)
    setContextMenu(null)
  }

  const renderFileTree = (directory: any, rootPath: string, currentPath: string = "") => {
    const sortedEntries = Object.entries(directory).sort(([nameA, entryA], [nameB, entryB]) => {
      const isDirA = (entryA as any).directory
      const isDirB = (entryB as any).directory

      if (isDirA && !isDirB) return -1
      if (!isDirA && isDirB) return 1
      return nameA.localeCompare(nameB)
    })

    return (
      <div className="text-sm">
        {sortedEntries.map(([name, entry]) => {
          const fullPath = currentPath ? `${currentPath}/${name}` : name
          const isDirectory = (entry as any).directory
          const isFile = (entry as any).file

          return (
            <div key={fullPath}>
              {isDirectory ? (
                <div>
                  <div
                    className="flex items-center gap-2 py-1 px-2 cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleArtifactsFolder(fullPath)}
                  >
                    {expandedArtifactsFolders.has(fullPath) ? (
                      <ChevronDown size={16} className="flex-shrink-0" />
                    ) : (
                      <ChevronRight size={16} className="flex-shrink-0" />
                    )}
                    <Folder size={16} className="flex-shrink-0 text-blue-400" />
                    <span className="truncate">{name}</span>
                  </div>
                  {expandedArtifactsFolders.has(fullPath) && (
                    <div className="ml-4">
                      {renderFileTree((entry as any).directory, rootPath, fullPath)}
                    </div>
                  )}
                </div>
              ) : isFile ? (
                <div
                  className="flex items-center gap-2 py-1 px-2 cursor-pointer hover:bg-muted/50"
                  onClick={() => onArtifactFileSelect(fullPath)}
                >
                  <File size={16} className="flex-shrink-0 text-gray-400" />
                  <span className="truncate">{name}</span>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="h-full flex overflow-hidden relative">
      {/* Activity Bar */}
      <div className="w-12 bg-[#333334] flex flex-col items-center py-2 gap-1 border-r border-[#2d2d30] flex-shrink-0">
        {sidebarSections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded hover:bg-[#37373d] transition-colors relative",
              activeSection === section.id && "bg-[#37373d]",
            )}
            title={section.label}
          >
            <section.icon className="w-5 h-5 text-[#cccccc]" />
            {activeSection === section.id && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#0e639c]"></div>}
          </button>
        ))}
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-9 bg-[#2d2d30] flex items-center justify-between px-3 text-xs font-medium uppercase tracking-wide border-b border-[#3e3e42] flex-shrink-0">
          <span className="text-[#cccccc]">{sidebarSections.find((s) => s.id === activeSection)?.label}</span>
          {activeSection === "explorer" && (
            <div className="flex gap-1">
              <button
                onClick={() => setShowCreateDialog({ type: "file", path: "" })}
                className="p-1 hover:bg-[#37373d] rounded"
                title="New File"
                disabled={!isWebContainerReady}
              >
                <FilePlus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowCreateDialog({ type: "folder", path: "" })}
                className="p-1 hover:bg-[#37373d] rounded"
                title="New Folder"
                disabled={!isWebContainerReady}
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activeSection === "explorer" && (
            <div className="py-2">
              <div className="px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#969696] mb-2">
                Hello Algorand
              </div>
              <FileTree
                fileStructure={fileStructureProp}
                activeFile={activeFile}
                onFileSelect={onFileSelect}
              />
            </div>
          )}

          {activeSection === "build" && (
            <div className="py-2">
              <div className="px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#969696] mb-2">
                Artifacts
              </div>
              {fileStructureProp.artifacts && Object.keys(fileStructureProp.artifacts.directory).length > 0 ? (
                <div>{renderFileTree(fileStructureProp.artifacts.directory, "artifacts")}</div>
              ) : (
                <div className="px-3 py-1 text-xs text-[#969696]">No artifacts found.</div>
              )}
            </div>
          )}

          {activeSection === "programs" && (
            <div className="p-3">
              <div className="space-y-3">
                {deployedContracts.length > 0 ? (
                  deployedContracts.map((contract, index) => (
                    <div
                      key={index}
                      className="p-3 bg-[#2d2d30] rounded border border-[#3e3e42] cursor-pointer hover:bg-[#37373d] transition-colors"
                      onClick={() => onContractSelect && onContractSelect(contract)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="w-4 h-4 text-[#0e639c]" />
                        <span className="text-sm font-medium text-white">App ID: {contract.appId}</span>
                      </div>
                      <div className="text-xs text-[#969696] mb-2">Deployed: {new Date(contract.time).toLocaleString()}</div>
                      <div className="text-xs text-[#569cd6]">Status: Deployed</div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-[#2d2d30] rounded border border-[#3e3e42]">
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="w-4 h-4 text-[#0e639c]" />
                      <span className="text-sm font-medium text-white">No Deployed Contracts</span>
                    </div>
                    <div className="text-xs text-[#969696] mb-2">Build and deploy contracts to see them here</div>
                    <div className="text-xs text-[#569cd6]">Status: Ready to Deploy</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === "tutorials" && (
            <div className="p-3">
              <div className="space-y-1">
                <div className="px-2 py-2 hover:bg-[#2a2d2e] cursor-pointer text-sm rounded transition-colors">
                  📚 Getting Started
                </div>
                <div className="px-2 py-2 hover:bg-[#2a2d2e] cursor-pointer text-sm rounded transition-colors">
                  🔧 Smart Contracts
                </div>
                <div className="px-2 py-2 hover:bg-[#2a2d2e] cursor-pointer text-sm rounded transition-colors">
                  🐍 PyTeal Basics
                </div>
                <div className="px-2 py-2 hover:bg-[#2a2d2e] cursor-pointer text-sm rounded transition-colors">
                  💎 Asset Creation
                </div>
                <div className="px-2 py-2 hover:bg-[#2a2d2e] cursor-pointer text-sm rounded transition-colors">
                  🚀 Deployment Guide
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-[#2d2d30] border border-[#3e3e42] rounded shadow-lg py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseLeave={() => setContextMenu(null)}
        >
          <button
            onClick={() => {
              setShowCreateDialog({ type: "file", path: contextMenu.path })
              setContextMenu(null)
            }}
            className="w-full text-left px-3 py-1 hover:bg-[#37373d] text-sm flex items-center gap-2"
            disabled={!isWebContainerReady}
          >
            <FilePlus className="w-4 h-4" />
            New File
          </button>
          <button
            onClick={() => {
              setShowCreateDialog({ type: "folder", path: contextMenu.path })
              setContextMenu(null)
            }}
            className="w-full text-left px-3 py-1 hover:bg-[#37373d] text-sm flex items-center gap-2"
            disabled={!isWebContainerReady}
          >
            <FolderPlus className="w-4 h-4" />
            New Folder
          </button>
          <button
            onClick={() => deleteItem(contextMenu.path)}
            className="w-full text-left px-3 py-1 hover:bg-[#37373d] text-sm flex items-center gap-2 text-red-400"
            disabled={!isWebContainerReady}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button
            onClick={() => {
              const newName = prompt(`Enter new name for ${contextMenu.path}`)
              if (newName) {
                const newPath = contextMenu.path.split("/").slice(0, -1).join("/") + "/" + newName
                onRenameFile(contextMenu.path, newPath)
              }
              setContextMenu(null)
            }}
            className="w-full text-left px-3 py-1 hover:bg-[#37373d] text-sm flex items-center gap-2"
            disabled={!isWebContainerReady}
          >
            <FilePlus className="w-4 h-4" />
            Rename
          </button>
        </div>
      )}

      {/* Create Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2d2d30] border border-[#3e3e42] rounded p-4 w-80">
            <h3 className="text-lg font-medium mb-3">
              Create New {showCreateDialog.type === "file" ? "File" : "Folder"}
            </h3>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={`Enter ${showCreateDialog.type} name`}
              className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3e3e42] rounded text-white"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (showCreateDialog.type === "file") {
                    createFile(showCreateDialog.path, newItemName)
                  } else {
                    createFolder(showCreateDialog.path, newItemName)
                  }
                } else if (e.key === "Escape") {
                  setShowCreateDialog(null)
                  setNewItemName("")
                }
              }}
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  if (showCreateDialog.type === "file") {
                    createFile(showCreateDialog.path, newItemName)
                  } else {
                    createFolder(showCreateDialog.path, newItemName)
                  }
                }}
                className="px-3 py-1 bg-[#0e639c] hover:bg-[#1177bb] rounded text-sm"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateDialog(null)
                  setNewItemName("")
                }}
                className="px-3 py-1 bg-[#37373d] hover:bg-[#4e4e52] rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
