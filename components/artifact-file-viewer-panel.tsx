"use client"

import React, { useState, useEffect } from "react"
import { WebContainer } from "@webcontainer/api"

interface ArtifactFileViewerPanelProps {
  filePath: string;
  webcontainer: WebContainer | null;
  onDeploy: () => Promise<void>;
  onClose: () => void;
}

export function ArtifactFileViewerPanel({
  filePath,
  webcontainer,
  onDeploy,
  onClose,
}: ArtifactFileViewerPanelProps) {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const fileName = filePath.split("/").pop();

  useEffect(() => {
    const fetchFileContent = async () => {
      if (!webcontainer || !filePath) {
        setFileContent(null);
        return;
      }
      try {
        const content = await webcontainer.fs.readFile(filePath, "utf-8");
        setFileContent(content);
      } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        setFileContent(`Could not read file: ${error}`);
      }
    };

    fetchFileContent();
  }, [filePath, webcontainer]);

  return (
    <div className="p-4 h-full overflow-auto" style={{ backgroundColor: "var(--background-color)", color: "var(--text-color)" }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{fileName}</h2>
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
          style={{ backgroundColor: "var(--button-color)", color: "var(--text-color)", hover: "var(--button-hover-color)" }}
        >
          Close
        </button>
      </div>

      <div className="mb-4">
        <pre className="bg-[var(--sidebar-color)] p-3 rounded-lg overflow-auto text-sm" style={{ borderColor: "var(--border-color)", border: "1px solid", color: "var(--text-color)" }}>
          {fileContent || "Loading..."}
        </pre>
      </div>

      <button
        onClick={onDeploy}
        className="w-full px-3 py-1.5 rounded text-sm font-medium transition-colors"
        style={{ backgroundColor: "var(--button-color)", color: "var(--text-color)", hover: "var(--button-hover-color)" }}
      >
        Deploy {fileName}
      </button>
    </div>
  );
}
