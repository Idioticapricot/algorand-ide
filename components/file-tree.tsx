import React from "react";
import { Folder, File, ChevronRight, ChevronDown } from "lucide-react";

interface FileTreeProps {
  fileStructure: any;
  activeFile: string;
  onFileSelect: (filePath: string) => void;
  currentPath?: string;
}

const FileTree: React.FC<FileTreeProps> = ({
  fileStructure,
  activeFile,
  onFileSelect,
  currentPath = "",
}) => {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  const toggleExpand = (name: string) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const sortedEntries = Object.entries(fileStructure).sort(([nameA, entryA], [nameB, entryB]) => {
    const isDirA = (entryA as any).directory;
    const isDirB = (entryB as any).directory;

    if (isDirA && !isDirB) return -1;
    if (!isDirA && isDirB) return 1;
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="text-sm">
      {sortedEntries.map(([name, entry]) => {
        const fullPath = currentPath ? `${currentPath}/${name}` : name;
        const isDirectory = (entry as any).directory;
        const isFile = (entry as any).file;
        const isCurrentlyActive = activeFile === fullPath;

        return (
          <div key={fullPath}>
            {isDirectory ? (
              <div>
                <div
                  className="flex items-center gap-2 py-1 px-2 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleExpand(name)}
                >
                  {expanded[name] ? (
                    <ChevronDown size={16} className="flex-shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="flex-shrink-0" />
                  )}
                  <Folder size={16} className="flex-shrink-0 text-blue-400" />
                  <span className="truncate">{name}</span>
                </div>
                {expanded[name] && (
                  <div className="ml-4">
                    <FileTree
                      fileStructure={(entry as any).directory}
                      activeFile={activeFile}
                      onFileSelect={onFileSelect}
                      currentPath={fullPath}
                    />
                  </div>
                )}
              </div>
            ) : isFile ? (
              <div
                className={`flex items-center gap-2 py-1 px-2 cursor-pointer hover:bg-muted/50 ${
                  isCurrentlyActive ? "bg-blue-600 text-white" : ""
                }`}
                onClick={() => onFileSelect(fullPath)}
              >
                <File size={16} className="flex-shrink-0 text-gray-400" />
                <span className="truncate">{name}</span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default FileTree;
