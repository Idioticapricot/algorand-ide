"use client"

import { useEffect, useRef, useState } from "react"
import * as monaco from "monaco-editor"
import { X, Circle } from "lucide-react"
import type { WebContainer } from "@webcontainer/api"

interface CodeEditorProps {
  activeFile: string
  openFiles: string[]
  onFileSelect: (file: string) => void
  onFileClose: (file: string) => void
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
  if (filename.endsWith(".md")) return "markdown"
  if (filename.endsWith(".json")) return "json"
  if (filename.endsWith(".txt")) return "plaintext"
  return "plaintext"
}

export function CodeEditor({ activeFile, openFiles, onFileSelect, onFileClose, webcontainer }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [unsavedFiles, setUnsavedFiles] = useState<Set<string>>(new Set())
  const [fileContents, setFileContents] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editorRef.current && !monacoRef.current) {
      // Clear any existing content first
      editorRef.current.innerHTML = ""

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

      monacoRef.current = monaco.editor.create(editorRef.current, {
        value: "// Loading file...",
        language: getLanguage(activeFile),
        theme: "algorand-dark",
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
      })

      // Handle content changes
      monacoRef.current.onDidChangeModelContent(async () => {
        if (webcontainer && activeFile && monacoRef.current) {
          const content = monacoRef.current.getValue()
          await webcontainer.fs.writeFile(activeFile, content)
          setUnsavedFiles((prev) => new Set([...prev, activeFile]))
        }
      })

      // Load initial file
      loadFileContent()
    }

    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose()
        monacoRef.current = null
      }
    }
  }, [])

  // Load file content from WebContainer
  const loadFileContent = async () => {
    if (webcontainer && activeFile && monacoRef.current) {
      try {
        const content = await webcontainer.fs.readFile(activeFile, "utf-8")
        setFileContents((prev) => ({ ...prev, [activeFile]: content }))
        monacoRef.current.setValue(content)
        monaco.editor.setModelLanguage(monacoRef.current.getModel()!, getLanguage(activeFile))
        // Remove from unsaved files when loading fresh content
        setUnsavedFiles((prev) => {
          const newSet = new Set(prev)
          newSet.delete(activeFile)
          return newSet
        })
      } catch (error) {
        console.error("Error loading file:", error)
        monacoRef.current.setValue(`// Error loading file: ${activeFile}\n// ${error}`)
      }
    }
  }

  useEffect(() => {
    loadFileContent()
  }, [activeFile, webcontainer])

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
      <div
        ref={editorRef}
        className="flex-1 overflow-hidden relative"
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Monaco Editor will be rendered here and contained within this div */}
      </div>
    </div>
  )
}
