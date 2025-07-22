"use client"

import { useEffect, useRef, useState } from "react"
import Editor from "@monaco-editor/react"
import { X, Circle } from "lucide-react"
import type { WebContainer } from "@webcontainer/api"

interface CodeEditorProps {
  activeFile: string
  openFiles: string[]
  fileContents: Record<string, string>
  onFileSelect: (file: string) => void
  onFileClose: (file: string) => void
  onFileContentChange: (filePath: string, content: string) => void
  webcontainer: WebContainer | null
}

const getFileIcon = (filename: string) => {
  if (filename.endsWith(".py")) return "🐍"
  if (filename.endsWith(".md")) return "📝"
  if (filename.endsWith(".json")) return "⚙️"
  if (filename.endsWith(".txt")) return "📄"
  return "📄"
}

const getLanguage = (filename: string) => {
  if (filename.endsWith(".py")) return "python"
  if (filename.endsWith(".ts")) return "typescript"
  if (filename.endsWith(".tsx")) return "typescript"
  if (filename.endsWith(".js")) return "javascript"
  if (filename.endsWith(".jsx")) return "javascript"
  if (filename.endsWith(".md")) return "markdown"
  if (filename.endsWith(".json")) return "json"
  if (filename.endsWith(".txt")) return "plaintext"
  return "plaintext"
}

export function CodeEditor({
  activeFile,
  openFiles,
  fileContents,
  onFileSelect,
  onFileClose,
  onFileContentChange,
  webcontainer,
}: CodeEditorProps) {
  const [unsavedFiles, setUnsavedFiles] = useState<Set<string>>(new Set())

  const handleEditorChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      onFileContentChange(activeFile, value)
      setUnsavedFiles((prev) => new Set([...prev, activeFile]))
    }
  }

  const handleEditorDidMount = (editor: any, monaco: any) => {
    // Define custom theme
    monaco.editor.defineTheme("algorand-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A9955" },
        { token: "keyword", foreground: "569CD6" },
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
        { token: "type", foreground: "4EC9B0" },
        { token: "function", foreground: "DCDCAA" },
      ],
      colors: {
        "editor.background": "#1e1e1e",
        "editor.foreground": "#d4d4d4",
        "editorLineNumber.foreground": "#858585",
        "editor.selectionBackground": "#264f78",
        "editor.inactiveSelectionBackground": "#3a3d41",
        "editorCursor.foreground": "#ffffff",
      },
    })
    // editor.setTheme("algorand-dark")
  }

  useEffect(() => {
    setUnsavedFiles((prev) => {
      const newSet = new Set(prev)
      newSet.delete(activeFile)
      return newSet
    })
  }, [activeFile])

  if (openFiles.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1e1e1e] text-[#969696]">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl mb-2">No files open</h2>
          <p>Select a file from the explorer to start editing</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] overflow-hidden">
      {/* Tab Bar */}
      <div className="h-9 bg-[#2d2d30] flex items-center border-b border-[#3e3e42] flex-shrink-0 overflow-x-auto">
        <div className="flex items-center min-w-0">
          {openFiles.map((file) => (
            <div
              key={file}
              className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer border-r border-[#3e3e42] min-w-0 group hover:bg-[#37373d] transition-colors ${
                activeFile === file
                  ? "bg-[#1e1e1e] text-white border-t-2 border-t-[#0e639c]"
                  : "bg-[#2d2d30] text-[#cccccc]"
              }`}
              onClick={() => onFileSelect(file)}
            >
              <span className="text-xs">{getFileIcon(file.split("/").pop() || "")}</span>
              <span className="truncate max-w-32">{file.split("/").pop()}</span>
              {unsavedFiles.has(file) && <Circle className="w-2 h-2 fill-current text-[#0e639c]" />}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onFileClose(file)
                }}
                className="ml-1 hover:bg-[#4e4e52] rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <Editor
        height="100%"
        language={getLanguage(activeFile)}
        value={fileContents[activeFile]}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: "on",
          lineNumbers: "on",
          renderWhitespace: "selection",
          bracketPairColorization: { enabled: true },
          guides: {
            indentation: true,
            bracketPairs: true,
          },
        }}
      />
    </div>
  )
}
