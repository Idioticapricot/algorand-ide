"use client"

import React, { useState, useEffect } from "react"

interface ArtifactsPanelProps {
  webcontainer: any;
  onDeploy: () => Promise<void>;
}

export function ArtifactsPanel({ webcontainer, onDeploy }: ArtifactsPanelProps) {
  const [artifactFiles, setArtifactFiles] = useState<string[]>([]);

  useEffect(() => {
    const fetchArtifacts = async () => {
      if (!webcontainer) return;
      try {
        const files = await webcontainer.fs.readdir("artifacts");
        setArtifactFiles(files.filter((file: string) => file !== "." && file !== ".."));
      } catch (error) {
        console.error("Error reading artifacts directory:", error);
        setArtifactFiles([]);
      }
    };

    fetchArtifacts();

    // Set up a watcher for the artifacts directory
    if (webcontainer) {
      const watcher = webcontainer.fs.watch("artifacts", (event: string, filename: string) => {
        console.log(`Artifacts change detected: ${event} on ${filename}`);
        fetchArtifacts(); // Re-fetch artifacts on change
      });
      return () => watcher.close();
    }
  }, [webcontainer]);

  return (
    <div className="p-4 h-full overflow-auto" style={{ backgroundColor: "var(--background-color)", color: "var(--text-color)" }}>
      <h2 className="text-xl font-bold mb-4">Artifacts</h2>
      <p className="text-sm text-[#cccccc] mb-4">
        This panel displays compiled contracts and other build artifacts.
      </p>

      {artifactFiles.length === 0 ? (
        <p className="text-sm text-[#969696]">No artifacts found. Build your project to generate artifacts.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {artifactFiles.map((file) => (
            <div
              key={file}
              className="bg-[var(--sidebar-color)] p-3 rounded-lg shadow-md flex flex-col justify-between"
              style={{ borderColor: "var(--border-color)", border: "1px solid" }}
            >
              <p className="text-sm font-medium truncate mb-2" title={file}>
                {file}
              </p>
              <button
                onClick={onDeploy}
                className="w-full px-3 py-1.5 rounded text-xs font-medium transition-colors"
                style={{ backgroundColor: "var(--button-color)", color: "var(--text-color)", hover: "var(--button-hover-color)" }}
              >
                Deploy
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}