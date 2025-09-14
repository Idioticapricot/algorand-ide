"use client"

import { useEffect, useRef, useState } from "react"
import Editor from "@monaco-editor/react"
import { X, Circle } from "lucide-react"
import type { WebContainer } from "@webcontainer/api"
import dracula from 'monaco-themes/themes/Dracula.json';

interface CodeEditorProps {
  activeFile: string
  openFiles: string[]
  fileContents: Record<string, string>
  onFileSelect: (file: string) => void
  onFileClose: (file: string) => void
  onFileContentChange: (filePath: string, content: string) => Promise<void>
  onSave: () => Promise<void>
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
  onSave,
  webcontainer,
}: CodeEditorProps) {
  const [unsavedFiles, setUnsavedFiles] = useState<Set<string>>(new Set())

  const handleEditorChange = async (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      await onFileContentChange(activeFile, value)
      setUnsavedFiles((prev) => new Set([...prev, activeFile]))
    }
  }

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Define custom theme
    monaco.editor.defineTheme('dracula', {
      ...dracula
    });
    monaco.editor.setTheme('dracula');
  };

  // Update Ctrl+S command when activeFile changes
  useEffect(() => {
    if (editorRef.current && monacoRef.current && activeFile) {
      const editor = editorRef.current;
      const monaco = monacoRef.current;
      
      // Remove existing command and add new one
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
        await onSave();
        setUnsavedFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(activeFile);
          return newSet;
        });
      });
    }
  }, [activeFile, onSave]);
  // Clear unsaved indicator when file is saved externally
  const clearUnsavedFile = (filePath: string) => {
    setUnsavedFiles((prev) => {
      const newSet = new Set(prev);
      newSet.delete(filePath);
      return newSet;
    });
  };
  
  // Block browser Ctrl+S and expose clearUnsavedFile function
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("keydown", handler);
    
    if (window) {
      (window as any).clearUnsavedFile = clearUnsavedFile;
    }
    
    return () => document.removeEventListener("keydown", handler);
  }, []);

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
