"use client"

import React, { useState, useEffect } from "react"
import { WebContainer } from "@webcontainer/api"
import { indexedDBManager } from "@/lib/indexeddb"

interface ArtifactFileViewerPanelProps {
  filePath: string;
  webcontainer: WebContainer | null;
  fileContents?: Record<string, string>;
  selectedTemplate?: string;
  onDeploy: (filename: string) => Promise<void>;
  onClose: () => void;
}

export function ArtifactFileViewerPanel({
  filePath,
  webcontainer,
  fileContents,
  selectedTemplate,
  onDeploy,
  onClose,
}: ArtifactFileViewerPanelProps) {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const fileName = filePath.split("/").pop();
  const isDeployable = fileName?.endsWith('.arc32.json');

  useEffect(() => {
    const fetchFileContent = async () => {
      if (!filePath) {
        setFileContent(null);
        return;
      }

      console.log('Fetching file content for:', `"${filePath}"`);
      console.log('Available fileContents keys:', Object.keys(fileContents || {}));
      console.log('Selected template:', selectedTemplate);
      console.log('Exact match check:', fileContents && filePath in fileContents);

      // Try with artifacts/ prefix for PuyaPy templates
      const fullPath = filePath.startsWith('artifacts/') ? filePath : `artifacts/${filePath}`;
      
      // First try fileContents if available
      if (fileContents && fileContents[fullPath]) {
        console.log('Found in fileContents');
        setFileContent(fileContents[fullPath]);
        return;
      }

      // For PuyaPy/PyTeal templates, try IndexedDB
      if (selectedTemplate === 'PuyaPy' || selectedTemplate === 'Pyteal') {
        try {
          console.log('Trying IndexedDB for:', fullPath);
          const content = await indexedDBManager.getFile(selectedTemplate, fullPath);
          if (content) {
            console.log('Found in IndexedDB');
            setFileContent(content);
            return;
          }
        } catch (error) {
          console.error(`Error reading from IndexedDB:`, error);
        }
      }

      console.log('File not found in any source');
      setFileContent("File not found");
    };

    fetchFileContent();
  }, [filePath, webcontainer, fileContents, selectedTemplate]);

  return (
    <div className="p-4 h-full overflow-auto" style={{ backgroundColor: "var(--background-color)", color: "var(--text-color)" }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{fileName}</h2>
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded text-xs font-medium transition-colors hover:opacity-80"
          style={{ backgroundColor: "var(--button-color)", color: "var(--text-color)" }}
        >
          Close
        </button>
      </div>

      <div className="mb-4">
        <pre className="bg-[var(--sidebar-color)] p-3 rounded-lg overflow-auto text-sm" style={{ borderColor: "var(--border-color)", border: "1px solid", color: "var(--text-color)" }}>
          {fileContent === null ? "Loading..." : fileContent}
        </pre>
      </div>

      {isDeployable && (
        <button
          onClick={() => fileName && onDeploy(fileName)}
          className="w-full px-3 py-1.5 rounded text-sm font-medium transition-colors hover:opacity-80"
          style={{ backgroundColor: "var(--button-color)", color: "var(--text-color)" }}
        >
          Deploy {fileName}
        </button>
      )}
    </div>
  );
}
