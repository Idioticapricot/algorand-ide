"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"

import { Sidebar } from "@/components/sidebar"
import { CodeEditorDynamic as CodeEditor } from "@/components/code-editor-dynamic"
import { WebContainerTerminal } from "@/components/webcontainer-terminal"
import AIChat from "@/components/ai-chat"
import { BuildToolbar } from "@/components/build-toolbar"
import { BuildPanel } from "@/components/build-panel"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { WalletPanel } from "@/components/wallet-panel"
import { TutorialPanel } from "@/components/tutorial-panel"
import { ArtifactsPanel } from "@/components/artifacts-panel"
import { ProgramsPanel } from "@/components/programs-panel"
import { SettingsPanel } from "@/components/settings-panel"
import { ArtifactFileViewerPanel } from "@/components/artifact-file-viewer-panel"
// import { replacePuyaUrls } from "@/tests/replace.js" // Removed for build compatibility
import { createClient } from '@supabase/supabase-js'

// Placeholder for PyodideCompiler - this should be implemented separately
class PyodideCompiler {
  async init(template: string) {
    console.log(`PyodideCompiler init for ${template} - not implemented`);
  }
  
  async compile(filename: string, content: string) {
    console.log(`PyodideCompiler compile for ${filename} - not implemented`);
    return { error: 'PyodideCompiler not implemented', files: [] };
  }
  
  async readFile(path: string) {
    console.log(`PyodideCompiler readFile for ${path} - not implemented`);
    return { content: '' };
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

import { useToast } from "@/components/ui/use-toast"
import algosdk from "algosdk"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TransactionBuilder } from "@/components/transaction-builder"



interface Wallet {
  address: string
  balance: number
  privateKey: string
  mnemonic: string
  transactions: any[]
  algoPrice: number
}

// Helper function to save project to database
async function saveProjectToDatabase(projectId: string, fileStructure: any, selectedTemplate: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;
    
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ 
        file_structure: fileStructure,
        template: selectedTemplate
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to save project to database:', error);
    return false;
  }
}

// Utility to recursively fetch file structure from WebContainer (excludes node_modules for UI)
async function fetchWebContainerFileTree(fs: any, dir = ".", selectedTemplate: string) {
  console.log(`fetchWebContainerFileTree called for dir: ${dir}, template: ${selectedTemplate}`);
  const tree: any = {};
  let entries = await fs.readdir(dir, { withFileTypes: true });

  // Filter out node_modules and .py files if TealScript is selected
  entries = entries.filter((entry: any) => {
    if (entry.name === "node_modules") {
      console.log(`Ignoring file change in node_modules: ${entry.name}`);
      return false; // Always hide node_modules
    }
    if ((selectedTemplate === "TealScript" || selectedTemplate === "PuyaTs") && entry.isFile() && entry.name.endsWith(".py")) {
      console.log(`Filtering out Python file for ${selectedTemplate}: ${entry.name}`);
      return false; // Hide .py files for TealScript and PuyaTs templates
    }
    if ((selectedTemplate === "Pyteal" || selectedTemplate === "PuyaPy") && entry.isFile() && entry.name.endsWith(".ts")) {
      console.log(`Filtering out TypeScript file for ${selectedTemplate}: ${entry.name}`);
      return false; // Hide .ts files for Pyteal and PuyaPy templates
    }
    return true;
  });

  // Sort: directories first, then files, then by name
  entries = entries.sort((a: any, b: any) => {
    if (a.isDirectory() === b.isDirectory()) return a.name.localeCompare(b.name);
    return a.isDirectory() ? -1 : 1;
  });

  for (const entry of entries) {
    const entryName = entry.name;
    const fullPath = dir === "." ? entryName : `${dir}/${entryName}`;

    if (entry.isDirectory()) {
      tree[entryName] = { directory: await fetchWebContainerFileTree(fs, fullPath,selectedTemplate) };
    } else if (entry.isFile()) {
      tree[entryName] = { file: { contents: await fs.readFile(fullPath, "utf-8") } };
    }
  }
  return tree;
}

// Utility to fetch ALL files including node_modules for snapshot
async function fetchWebContainerFileTreeForSnapshot(fs: any, dir = ".") {
  console.log(`fetchWebContainerFileTreeForSnapshot called for dir: ${dir}`);
  const tree: any = {};
  let entries = await fs.readdir(dir, { withFileTypes: true });

  // Sort: directories first, then files, then by name
  entries = entries.sort((a: any, b: any) => {
    if (a.isDirectory() === b.isDirectory()) return a.name.localeCompare(b.name);
    return a.isDirectory() ? -1 : 1;
  });

  for (const entry of entries) {
    const entryName = entry.name;
    const fullPath = dir === "." ? entryName : `${dir}/${entryName}`;

    if (entry.isDirectory()) {
      tree[entryName] = { directory: await fetchWebContainerFileTreeForSnapshot(fs, fullPath) };
    } else if (entry.isFile()) {
      tree[entryName] = { file: { contents: await fs.readFile(fullPath, "utf-8") } };
    }
  }
  return tree;
}

export default function AlgorandIDE({ initialFiles, selectedTemplate, selectedTemplateName, projectId }: { initialFiles: any, selectedTemplate: string, selectedTemplateName: string, projectId?: string }) {
  const [currentFiles, setCurrentFiles] = useState<any>(initialFiles);

  const getAllFilePaths = (tree: any, currentPath: string = '') => {
    let paths: string[] = [];
    for (const key in tree) {
      const newPath = currentPath ? `${currentPath}/${key}` : key;
      if (tree[key].file) {
        paths.push(newPath);
      } else if (tree[key].directory) {
        paths = paths.concat(getAllFilePaths(tree[key].directory, newPath));
      }
    }
    return paths;
  };

  const [activeFile, setActiveFile] = useState("");
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const getAllFileContents = (tree: any, currentPath: string = '') => {
    let contents: Record<string, string> = {};
    for (const key in tree) {
      const newPath = currentPath ? `${currentPath}/${key}` : key;
      if (tree[key].file) {
        contents[newPath] = tree[key].file.contents;
      } else if (tree[key].directory) {
        contents = { ...contents, ...getAllFileContents(tree[key].directory, newPath) };
      }
    }
    return contents;
  };

  const [fileContents, setFileContents] = useState<Record<string, string>>(() => getAllFileContents(currentFiles));
  const [sidebarSection, setSidebarSection] = useState("explorer")
  const [showWallet, setShowWallet] = useState(false)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [activeArtifactFile, setActiveArtifactFile] = useState<string | null>(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [deployArgs, setDeployArgs] = useState<any[]>([]);
  const [currentDeployFilename, setCurrentDeployFilename] = useState<string | null>(null);
  const [contractArgs, setContractArgs] = useState<any[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isMethodsModalOpen, setIsMethodsModalOpen] = useState(false);
  const [isExecuteModalOpen, setIsExecuteModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [executeArgs, setExecuteArgs] = useState<any[]>([]);

  // Layout state
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [terminalHeight, setTerminalHeight] = useState(300)
  const [walletWidth, setWalletWidth] = useState(320)
  const [showAIChat, setShowAIChat] = useState(false)
  const [showBuildPanel, setShowBuildPanel] = useState(false)

  const [isBuilding, setIsBuilding] = useState(false)
  

  
  // Update PuyaPy file tree with artifacts
  const updatePuyaPyFileTree = async (files: string[]) => {
    if (!pyodideCompiler) return;
    
    // Create artifacts directory in file tree if it doesn't exist
    const updatedFiles = { ...currentFiles };
    if (!updatedFiles.artifacts) {
      updatedFiles.artifacts = { directory: {} };
    }
    
    // Add artifact files to the tree
    const artifactExtensions = ['.teal', '.arc32.json', '.puya.map'];
    const artifactFiles = files.filter(file => 
      artifactExtensions.some(ext => file.endsWith(ext))
    );
    
    const newFileContents = { ...fileContents };
    
    for (const file of artifactFiles) {
      const fileName = file.split('/').pop();
      if (fileName) {
        try {
          // Get file content from Pyodide worker
          const result = await pyodideCompiler.readFile(file);
          const content = result.content || '';
          
          updatedFiles.artifacts.directory[fileName] = {
            file: { contents: content }
          };
          
          // Update file contents cache
          const artifactPath = `artifacts/${fileName}`;
          newFileContents[artifactPath] = content;
          

          
        } catch (error) {
          console.error(`Failed to read ${file}:`, error);
        }
      }
    }
    
    setCurrentFiles({...updatedFiles});
    setFileContents({...newFileContents});
    handleTerminalOutput(`Added ${artifactFiles.length} artifact files to file tree`);
    
    // Delayed file tree refresh
    setTimeout(() => {
      setCurrentFiles({...updatedFiles});
    }, 2000);
  }
  
  const handlePyTealBuild = async () => {
    setIsBuilding(true);
    handleTerminalOutput("Compiling PyTeal contract...");
    
    try {
      const contractFile = fileContents['contract.py'];
      if (!contractFile) {
        handleTerminalOutput("No contract.py file found.");
        return;
      }
      
      console.log(`[BUILD] PyTeal compilation started`);
      
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'pyteal',
          code: btoa(contractFile)
        })
      });
      
      const result = await response.json();
      console.log(`[BUILD] PyTeal compilation result:`, result);
      
      if (result.ok && result.files) {
        const updatedFiles = { ...currentFiles };
        if (!updatedFiles.artifacts) {
          updatedFiles.artifacts = { directory: {} };
        }
        
        const newFileContents = { ...fileContents };
        
        for (const [fileName, fileData] of Object.entries(result.files)) {
          const data = (fileData as any).data;
          const encoding = (fileData as any).encoding;
          const content = encoding === 'base64' ? atob(data) : data;
          
          updatedFiles.artifacts.directory[fileName] = {
            file: { contents: content }
          };
          
          newFileContents[`artifacts/${fileName}`] = content;
        }
        
        setCurrentFiles(updatedFiles);
        setFileContents(newFileContents);
        handleTerminalOutput("PyTeal compilation completed successfully");
      } else {
        handleTerminalOutput(`Compilation failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('[BUILD] PyTeal build error:', error);
      handleTerminalOutput(`Build failed: ${error.message || error}`);
    } finally {
      setIsBuilding(false);
    }
  }
  
  const updatePyTealFileTree = async (files: string[]) => {
    if (!pyodideCompiler) return;
    
    const updatedFiles = { ...currentFiles };
    if (!updatedFiles.artifacts) {
      updatedFiles.artifacts = { directory: {} };
    }
    
    const artifactExtensions = ['.teal', '.json'];
    const artifactFiles = files.filter(file => 
      artifactExtensions.some(ext => file.endsWith(ext))
    );
    
    const newFileContents = { ...fileContents };
    
    for (const file of artifactFiles) {
      const fileName = file.split('/').pop();
      if (fileName) {
        try {
          const result = await pyodideCompiler.readFile(file);
          const content = result.content || '';
          
          updatedFiles.artifacts.directory[fileName] = {
            file: { contents: content }
          };
          
          newFileContents[`artifacts/${fileName}`] = content;
          
        } catch (error) {
          console.error(`Failed to read ${file}:`, error);
        }
      }
    }
    
    setCurrentFiles(updatedFiles);
    setFileContents(newFileContents);
    handleTerminalOutput(`Added ${artifactFiles.length} artifact files to file tree`);
  }

  const [isReady, setIsReady] = useState(true)

  // Resize state
  const [isResizingSidebar, setIsResizingSidebar] = useState(false)
  const [isResizingTerminal, setIsResizingTerminal] = useState(false)
  const [isResizingWallet, setIsResizingWallet] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);


  const { toast } = useToast();
  const [deployedContracts, setDeployedContracts] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("deployedContracts") || "[]");
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (webcontainerRef.current) {
      return;
    }

    webcontainerRef.current = 'pending';

    const initWebContainer = async () => {
      try {
        // Use initial files directly (no IndexedDB)
        const mergedFiles = initialFiles;
        
        // Skip WebContainer for PuyaPy, PyTeal, and PuyaTs templates to save resources
        if (selectedTemplate === 'PuyaPy' || selectedTemplate === 'Pyteal' || selectedTemplate === 'PyTeal' || selectedTemplate === 'PuyaTs') {
          console.log(`Skipping WebContainer for ${selectedTemplate} template`);
          setCurrentFiles(mergedFiles);
          setFileContents(getAllFileContents(mergedFiles));
          setIsWebContainerReady(true);
          return;
        }
        
        const webcontainerInstance = await WebContainer.boot();
        await webcontainerInstance.mount(mergedFiles);
        setWebcontainer(webcontainerInstance);
        setIsWebContainerReady(true);
        webcontainerRef.current = webcontainerInstance;
      } catch (error) {
        console.error("Failed to initialize WebContainer:", error);
        webcontainerRef.current = null;
      }
    };

    initWebContainer();

    const savedWallet = localStorage.getItem("algorand-wallet")
    if (savedWallet) {
      try {
        const parsedWallet = JSON.parse(savedWallet)
        if (parsedWallet && typeof parsedWallet.address === 'string') {
          setWallet(parsedWallet)
        } else {
          console.error("Invalid wallet data in localStorage:", parsedWallet)
          localStorage.removeItem("algorand-wallet") // Clear invalid data
        }
      } catch (error) {
        console.error("Error parsing wallet from localStorage:", error)
        localStorage.removeItem("algorand-wallet") // Clear corrupted data
      }
    }

    return () => {
      if (webcontainerRef.current && webcontainerRef.current !== 'pending') {
        (webcontainerRef.current as WebContainer).teardown();
        webcontainerRef.current = null;
      }

    }
  }, [initialFiles, selectedTemplate]);

  const handleTerminalOutput = useCallback((data: string) => {
    setTerminalOutput((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${data}`]);
  }, []);

  const createWallet = async () => {
    try {
      const algosdk = await import("algosdk")
      const account = algosdk.generateAccount()

      const newWallet = {
        address: account.addr.toString(),
        balance: 0,
        privateKey: algosdk.secretKeyToMnemonic(account.sk),
        mnemonic: algosdk.secretKeyToMnemonic(account.sk),
        transactions: [],
        algoPrice: 0,
      }

      setWallet(newWallet)
      localStorage.setItem("algorand-wallet", JSON.stringify(newWallet))
      
      // Show funding instructions
      console.log("Wallet created! To fund with test ALGO, visit:")
      console.log(`https://testnet.algoexplorer.io/dispenser?addr=${newWallet.address}`)
    } catch (error) {
      console.error("Error creating wallet:", error)
    }
  }

  const fundWallet = async () => {
    if (!wallet?.address) return
    
    try {
      // Use Algorand TestNet faucet
      const response = await fetch("https://testnet-api.algonode.cloud/v2/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          to: wallet.address,
          amount: 100000000, // 100 ALGO in microAlgos
          fee: 1000,
          firstRound: 1,
          lastRound: 1000,
          genesisID: "testnet-v1.0",
          genesisHash: "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
        }),
      })
      
      if (response.ok) {
        console.log("Funding request submitted successfully")
      } else {
        console.error("Failed to fund wallet")
      }
    } catch (error) {
      console.error("Error funding wallet:", error)
    }
  }

  const openFile = (filePath: string) => {
    if (!openFiles.includes(filePath)) {
      setOpenFiles((prev) => [...prev, filePath])
    }
    setActiveFile(filePath)
  }

  const closeFile = (filePath: string) => {
    const newOpenFiles = openFiles.filter((f) => f !== filePath)
    setOpenFiles(newOpenFiles)

    if (activeFile === filePath) {
      const currentIndex = openFiles.indexOf(filePath)
      const nextFile = newOpenFiles[currentIndex] || newOpenFiles[currentIndex - 1] || newOpenFiles[0]
      setActiveFile(nextFile || "")
    }
  }

  // Fetch and update file structure from WebContainer, wrapped in useCallback
  const updateFileStructureFromWebContainer = useCallback(async () => {
    if (!webcontainer) return;
    const tree = await fetchWebContainerFileTree(webcontainer.fs, ".", selectedTemplate);
    setCurrentFiles(tree);

    // This logic can be simplified or memoized if performance becomes an issue
    const getAllFileContents = (tree: any, currentPath: string = '') => {
      let contents: Record<string, string> = {};
      for (const key in tree) {
        const newPath = currentPath ? `${currentPath}/${key}` : key;
        if (tree[key].file) {
          contents[newPath] = tree[key].file.contents;
        } else if (tree[key].directory) {
          contents = { ...contents, ...getAllFileContents(tree[key].directory, newPath) };
        }
      }
      return contents;
    };
    setFileContents(getAllFileContents(tree));
  }, [webcontainer]);

  // Set up file system watcher for real-time updates
  useEffect(() => {
    if (!webcontainer || selectedTemplate === 'PuyaPy' || selectedTemplate === 'Pyteal' || selectedTemplate === 'PyTeal' || selectedTemplate === 'PuyaTs') return;

    console.log("Setting up file system watcher for template:");

    // Initial fetch
    updateFileStructureFromWebContainer();

    const watcher = webcontainer.fs.watch(".", { recursive: true }, async (event, filename) => {
      // Ignore changes within node_modules
      if (filename && typeof filename === 'string' && filename.startsWith("node_modules/")) {
        console.log(`Ignoring file change in node_modules: ${event} on ${filename}`);
        return;
      }
      console.log(`File change detected: ${event} on ${filename}`);
      

      
      updateFileStructureFromWebContainer();
    });

    return () => {
      watcher.close();
    };
  }, [webcontainer, updateFileStructureFromWebContainer, selectedTemplate]);

  // File operations
  const createFile = async (filePath: string) => {
    if (selectedTemplate === 'PuyaPy' || selectedTemplate === 'Pyteal' || selectedTemplate === 'PyTeal' || selectedTemplate === 'PuyaTs') {
      // For these templates, only update local state
      setFileContents((prev) => ({ ...prev, [filePath]: "" }));
      setOpenFiles((prev) => [...prev, filePath]);
      setActiveFile(filePath);
      return;
    }
    
    if (!webcontainer) return;
    
    try {
      await updateFileInWebContainer(webcontainer, filePath, "", selectedTemplate);
      // No need to call updateFileStructureFromWebContainer manually, watcher will pick it up
      setOpenFiles((prev) => [...prev, filePath]);
      setActiveFile(filePath);
    } catch (error) {
      console.error('Failed to create file:', error);
    }
  };

  const renameFile = async (oldPath: string, newPath: string) => {
    if (selectedTemplate === 'PuyaPy' || selectedTemplate === 'Pyteal' || selectedTemplate === 'PyTeal' || selectedTemplate === 'PuyaTs') {
      const content = fileContents[oldPath] || '';
      setFileContents((prev) => {
        const updated = { ...prev };
        updated[newPath] = content;
        delete updated[oldPath];
        return updated;
      });
      setOpenFiles((prev) => prev.map((p) => (p === oldPath ? newPath : p)));
      if (activeFile === oldPath) {
        setActiveFile(newPath);
      }
      return;
    }
    
    if (!webcontainer) return;
    
    try {
      const content = await webcontainer.fs.readFile(oldPath, "utf-8");
      await webcontainer.fs.rm(oldPath);
      await updateFileInWebContainer(webcontainer, newPath, content, selectedTemplate);
      setOpenFiles((prev) => prev.map((p) => (p === oldPath ? newPath : p)));
      if (activeFile === oldPath) {
        setActiveFile(newPath);
      }
    } catch (error) {
      console.error('Failed to rename file:', error);
    }
  };

  const deleteFile = async (filePath: string) => {
    if (selectedTemplate === 'PuyaPy' || selectedTemplate === 'Pyteal' || selectedTemplate === 'PyTeal' || selectedTemplate === 'PuyaTs') {
      setFileContents((prev) => {
        const updated = { ...prev };
        delete updated[filePath];
        return updated;
      });
      closeFile(filePath);
      return;
    }
    
    if (!webcontainer) return;
    await webcontainer.fs.rm(filePath);
    closeFile(filePath);
  };

  const handleInstall = async () => {
    if (selectedTemplate === 'PuyaPy' || selectedTemplate === 'Pyteal' || selectedTemplate === 'PyTeal' || selectedTemplate === 'PuyaTs') {
      handleTerminalOutput("Install not needed for these templates.");
      return;
    }
    
    if (!webcontainer) {
      handleTerminalOutput("WebContainer not ready.");
      return;
    }

    setIsInstalling(true);
    handleTerminalOutput("Installing dependencies...");
    const installProcess = await webcontainer.spawn("npm", ["install"]);
    installProcess.output.pipeTo(new WritableStream({
      write(data) {
        handleTerminalOutput(data);
      },
    }));
    const exitCode = await installProcess.exit;
    handleTerminalOutput(`Install process exited with code: ${exitCode}`);
    
    // Run URL replacement after install for PuyaTs template
    // if (selectedTemplate === 'PuyaTs' && exitCode === 0) {
    //   setTimeout(async () => {
    //     handleTerminalOutput("Replacing puya URLs...");
    //     const success = await replacePuyaUrls(webcontainer);
    //     if (success) {
    //       handleTerminalOutput("Puya URLs replaced successfully");
    //     } else {
    //       handleTerminalOutput("Failed to replace puya URLs");
    //     }
    //   }, 3000);
    // }
    
    setIsInstalling(false);
  };

  const handlePuyaTsBuild = async () => {
    setIsBuilding(true);
    handleTerminalOutput("Compiling PuyaTs contract...");
    
    try {
      const algoFiles = Object.keys(fileContents).filter(path => path.endsWith('.algo.ts'));
      
      if (algoFiles.length === 0) {
        handleTerminalOutput("No .algo.ts files found.");
        return;
      }
      
      for (const filePath of algoFiles) {
        const filename = filePath.split('/').pop();
        const code = fileContents[filePath];
        
        handleTerminalOutput(`Compiling ${filename}...`);
        console.log(`[BUILD] PuyaTs compilation started for ${filename}`);
        
        const response = await fetch('/api/compile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'puyats',
            filename,
            code
          })
        });
        
        const result = await response.json();
        console.log(`[BUILD] PuyaTs compilation result:`, result);
        
        if (result.ok && result.files) {
          const updatedFiles = { ...currentFiles };
          if (!updatedFiles.artifacts) {
            updatedFiles.artifacts = { directory: {} };
          }
          
          const newFileContents = { ...fileContents };
          
          for (const [fileName, fileData] of Object.entries(result.files)) {
            const data = (fileData as any).data;
            const encoding = (fileData as any).encoding;
            const content = encoding === 'base64' ? atob(data) : data;
            
            updatedFiles.artifacts.directory[fileName] = {
              file: { contents: content }
            };
            
            newFileContents[`artifacts/${fileName}`] = content;
          }
          
          setCurrentFiles(updatedFiles);
          setFileContents(newFileContents);
          handleTerminalOutput(`Successfully compiled ${filename}`);
        } else {
          handleTerminalOutput(`Failed to compile ${filename}: ${result.error || 'Unknown error'}`);
        }
      }
    } catch (error: any) {
      console.error('[BUILD] PuyaTs build error:', error);
      handleTerminalOutput(`Build failed: ${error.message || error}`);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleTealScriptBuild = async () => {
    setIsBuilding(true);
    handleTerminalOutput("Compiling TealScript contract...");
    
    try {
      const algoFiles = Object.keys(fileContents).filter(path => path.endsWith('.algo.ts'));
      
      if (algoFiles.length === 0) {
        handleTerminalOutput("No .algo.ts files found.");
        return;
      }
      
      for (const filePath of algoFiles) {
        const filename = filePath.split('/').pop();
        const code = fileContents[filePath];
        
        handleTerminalOutput(`Compiling ${filename}...`);
        console.log(`[BUILD] TealScript compilation started for ${filename}`);
        
        const response = await fetch('/api/compile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'tealscript',
            filename,
            code
          })
        });
        
        const result = await response.json();
        console.log(`[BUILD] TealScript compilation result:`, result);
        
        if (result.ok && result.result) {
          const updatedFiles = { ...currentFiles };
          if (!updatedFiles.artifacts) {
            updatedFiles.artifacts = { directory: {} };
          }
          
          const newFileContents = { ...fileContents };
          
          // Parse the plain text response and extract files
          const sections = result.result.split('=== ');
          for (const section of sections) {
            if (section.trim()) {
              const lines = section.split('\n');
              const fileName = lines[0].replace(' ===', '').trim();
              const content = lines.slice(1).join('\n').trim();
              
              if (fileName && content) {
                updatedFiles.artifacts.directory[fileName] = {
                  file: { contents: content }
                };
                
                newFileContents[`artifacts/${fileName}`] = content;
              }
            }
          }
          
          setCurrentFiles(updatedFiles);
          setFileContents(newFileContents);
          handleTerminalOutput(`Successfully compiled ${filename}`);
        } else {
          handleTerminalOutput(`Failed to compile ${filename}: ${result.error || 'Unknown error'}`);
        }
      }
    } catch (error: any) {
      console.error('[BUILD] TealScript build error:', error);
      handleTerminalOutput(`Build failed: ${error.message || error}`);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleBuild = async () => {
    setShowBuildPanel(true);
    console.log(`[BUILD] Starting build for template: ${selectedTemplate}`);
    
    if (selectedTemplate === 'PuyaTs') {
      await handlePuyaTsBuild();
      return;
    }
    
    if (selectedTemplate === 'PuyaPy') {
      await handlePuyaPyBuild();
      return;
    }
    
    if (selectedTemplate === 'Pyteal' || selectedTemplate === 'PyTeal') {
      await handlePyTealBuild();
      return;
    }
    
    if (selectedTemplate === 'TealScript') {
      await handleTealScriptBuild();
      return;
    }
    
    if (!webcontainer) {
      handleTerminalOutput("WebContainer not ready.");
      return;
    }

    setIsBuilding(true);
    handleTerminalOutput("Building project...");
    const buildProcess = await webcontainer.spawn("npm", ["run", "build"]);
    buildProcess.output.pipeTo(new WritableStream({
      write(data) {
        handleTerminalOutput(data);
      },
    }));
    const exitCode = await buildProcess.exit;
    handleTerminalOutput(`Build process exited with code: ${exitCode}`);
    setIsBuilding(false);
  };
  
  const handlePuyaPyBuild = async () => {
    setIsBuilding(true);
    handleTerminalOutput("Compiling PuyaPy contract...");
    
    try {
      const contractFile = fileContents['contract.py'];
      if (!contractFile) {
        handleTerminalOutput("No contract.py file found.");
        return;
      }
      
      console.log(`[BUILD] PuyaPy compilation started`);
      
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'puyapy',
          code: btoa(contractFile)
        })
      });
      
      const result = await response.json();
      console.log(`[BUILD] PuyaPy compilation result:`, result);
      
      if (result.ok && result.files) {
        const updatedFiles = { ...currentFiles };
        if (!updatedFiles.artifacts) {
          updatedFiles.artifacts = { directory: {} };
        }
        
        const newFileContents = { ...fileContents };
        
        for (const [fileName, fileData] of Object.entries(result.files)) {
          const data = (fileData as any).data;
          const encoding = (fileData as any).encoding;
          const content = encoding === 'base64' ? atob(data) : data;
          
          updatedFiles.artifacts.directory[fileName] = {
            file: { contents: content }
          };
          
          newFileContents[`artifacts/${fileName}`] = content;
        }
        
        setCurrentFiles(updatedFiles);
        setFileContents(newFileContents);
        handleTerminalOutput("PuyaPy compilation completed successfully");
      } else {
        handleTerminalOutput(`Compilation failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('[BUILD] PuyaPy build error:', error);
      handleTerminalOutput(`Build failed: ${error.message || error}`);
    } finally {
      setIsBuilding(false);
    }
  }

  const handleTest = async () => {
    if (selectedTemplate === 'PuyaTs') {
      handleTerminalOutput("Tests not implemented for PuyaTs template yet.");
      return;
    }
    
    if (!webcontainer) {
      handleTerminalOutput("WebContainer not ready.");
      return;
    }

    setIsBuilding(true);
    handleTerminalOutput("Running tests...");
    try {
      const testProcess = await webcontainer.spawn("npm", ["run", "test"]);
      testProcess.output.pipeTo(new WritableStream({
        write(data) {
          handleTerminalOutput(data);
        },
      }));
      const exitCode = await testProcess.exit;
      handleTerminalOutput(`Test process exited with code: ${exitCode}`);
    } catch (error) {
      console.error("Test failed:", error);
      handleTerminalOutput(`Test failed: ${error}`);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleDeploy = async () => {
    if (selectedTemplate === 'PuyaTs') {
      handleTerminalOutput("Use the artifacts panel to deploy contracts for PuyaTs template.");
      return;
    }
    
    if (!webcontainer) {
      handleTerminalOutput("WebContainer not ready.");
      return;
    }

    setIsBuilding(true);
    handleTerminalOutput("Deploying contract...");
    try {
      const deployProcess = await webcontainer.spawn("npm", ["run", "deploy"]);
      deployProcess.output.pipeTo(new WritableStream({
        write(data) {
          console.log("Deploy output:", data);
          handleTerminalOutput(data);
        },
      }));
      const exitCode = await deployProcess.exit;
      handleTerminalOutput(`Deploy process exited with code: ${exitCode}`);
    } catch (error) {
      console.error("Deploy failed:", error);
      handleTerminalOutput(`Deploy failed: ${error}`);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleGenerateClient = async () => {
    if (selectedTemplate === 'PuyaTs') {
      handleTerminalOutput("Client generation not available for PuyaTs template.");
      return;
    }
    
    if (!webcontainer) {
      handleTerminalOutput("WebContainer not ready.");
      return;
    }

    setIsBuilding(true);
    handleTerminalOutput("Generating client...");
    try {
      const generateClientProcess = await webcontainer.spawn("npm", ["run", "generate-client"]);
      generateClientProcess.output.pipeTo(new WritableStream({
        write(data) {
          console.log("Generate Client output:", data);
          handleTerminalOutput(data);
        },
      }));
      const exitCode = await generateClientProcess.exit;
      handleTerminalOutput(`Generate client process exited with code: ${exitCode}`);
    } catch (error) {
      console.error("Generate client failed:", error);
      handleTerminalOutput(`Generate client failed: ${error}`);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleStop = () => {
    setIsBuilding(false)
  }

  const handleClearLogs = () => {
    setTerminalOutput([])
  }

  const handleDownloadSnapshot = async () => {
    if (selectedTemplate === 'PuyaTs') {
      setIsBuilding(true);
      handleTerminalOutput("Creating snapshot...");
      try {
        const jsonData = JSON.stringify(currentFiles, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedTemplate}-snapshot.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        handleTerminalOutput("Snapshot downloaded successfully.");
      } catch (error) {
        console.error("Snapshot failed:", error);
        handleTerminalOutput(`Snapshot failed: ${error}`);
      } finally {
        setIsBuilding(false);
      }
      return;
    }
    
    if (!webcontainer) {
      handleTerminalOutput("WebContainer not ready.");
      return;
    }

    console.log('handleDownloadSnapshot called for template:', selectedTemplate);
    setIsBuilding(true);
    handleTerminalOutput("Creating snapshot with node_modules...");
    try {
      console.log('Reading ALL files from WebContainer including node_modules...');
      const allFiles = await fetchWebContainerFileTreeForSnapshot(webcontainer.fs, ".");
      console.log('Files read successfully');
      
      const jsonData = JSON.stringify(allFiles, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate}-snapshot.json`;
      console.log('Triggering download for:', a.download);
      a.click();
      
      URL.revokeObjectURL(url);
      handleTerminalOutput("Snapshot downloaded successfully.");
      console.log('Download triggered successfully');
    } catch (error) {
      console.error("Snapshot failed:", error);
      handleTerminalOutput(`Snapshot failed: ${error}`);
    } finally {
      setIsBuilding(false);
    }
  }

  

  // Resize handlers
  const handleSidebarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizingSidebar(true)
  }

  const handleTerminalMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizingTerminal(true)
  }

  const handleWalletMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizingWallet(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()

      if (isResizingSidebar) {
        const newWidth = Math.max(200, Math.min(600, e.clientX - containerRect.left))
        setSidebarWidth(newWidth)
      }

      if (isResizingTerminal) {
        const newHeight = Math.max(200, Math.min(600, containerRect.bottom - e.clientY))
        setTerminalHeight(newHeight)
      }

      if (isResizingWallet) {
        const newWidth = Math.max(250, Math.min(500, containerRect.right - e.clientX))
        setWalletWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizingSidebar(false)
      setIsResizingTerminal(false)
      setIsResizingWallet(false)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    if (isResizingSidebar || isResizingTerminal || isResizingWallet) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.userSelect = "none"

      if (isResizingSidebar || isResizingWallet) {
        document.body.style.cursor = "col-resize"
      } else if (isResizingTerminal) {
        document.body.style.cursor = "row-resize"
      }

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isResizingSidebar, isResizingTerminal, isResizingWallet])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const executeDeploy = async (filename: string, args: (string | number)[]) => {
    setIsDeploying(true);
    console.log(`executeDeploy called for ${filename} with args:`, args);
    try {
      const artifactPath = `artifacts/${filename}`;
      let fileContent: string;
      
      if (selectedTemplate === 'PuyaPy' || selectedTemplate === 'Pyteal' || selectedTemplate === 'PuyaTs') {
        fileContent = fileContents[artifactPath] || '';
        if (!fileContent) {
          throw new Error(`Artifact file ${filename} not found`);
        }
      } else {
        if (!webcontainer) return;
        fileContent = await webcontainer.fs.readFile(artifactPath, "utf-8");
      }
      
      const appSpec = JSON.parse(fileContent);

      let contractSpec = appSpec;
      if (filename.endsWith('.arc32.json') && appSpec.contract) {
        contractSpec = appSpec.contract;
      }

      if(!wallet){
        throw new Error("Wallet not connected");
      }
      const account = algosdk.mnemonicToSecretKey(wallet.mnemonic);
      const creator = wallet;

      const { AlgorandClient } = await import("@algorandfoundation/algokit-utils");
      const algorandClient = AlgorandClient.fromConfig({
        algodConfig: { server: "https://testnet-api.algonode.cloud", token: "" },
        indexerConfig: { server: "https://testnet-idx.algonode.cloud", token: "" },
      });

      const appFactory = algorandClient.client.getAppFactory({
        appSpec,
        defaultSender: creator.address,
        defaultSigner: algosdk.makeBasicAccountTransactionSigner(account)
      });

      const deployResult = await appFactory.send.create({
          sender: account.addr,
          signer: algosdk.makeBasicAccountTransactionSigner(account),
          method: "createApplication",
          args: args
      });

      console.log("Deploy result:", deployResult);
      let appId = 'unknown';
      let txId = 'unknown';
      if (deployResult?.result) {
        const resultAny = deployResult.result as any;
        if (resultAny.appId !== undefined && resultAny.appId !== null) {
          appId = String(resultAny.appId);
        }
        if (typeof resultAny.txId === 'string') {
          txId = resultAny.txId;
        } else if (typeof resultAny.transactionId === 'string') {
          txId = resultAny.transactionId;
        }
      }
      console.log("Extracted App ID:", appId, "Transaction ID:", txId);
      const deployed = {
        appId,
        txId,
        artifact: filename,
        time: Date.now(),
        methods: contractSpec.methods,
      };
      const prev = JSON.parse(localStorage.getItem("deployedContracts") || "[]");
      const updated = [deployed, ...prev];
      localStorage.setItem("deployedContracts", JSON.stringify(updated));
      setDeployedContracts(updated);
      toast({ title: "Deployment completed!", description: `App ID: ${deployed.appId}` });
    } catch (error: any) {
      console.error("Deploy artifact failed:", error);
      toast({ title: "Deploy failed", description: error.message || String(error), variant: "destructive" });
    } finally {
      setIsDeploying(false);
      setIsDeployModalOpen(false);
    }
  };

  const deployArtifact = async (filename: string) => {
    console.log("deployArtifact called with filename:", filename);
    try {
      const artifactPath = `artifacts/${filename}`;
      let fileContent: string;
      
      if (selectedTemplate === 'PuyaPy' || selectedTemplate === 'Pyteal' || selectedTemplate === 'PuyaTs') {
        fileContent = fileContents[artifactPath] || '';
        if (!fileContent) {
          throw new Error(`Artifact file ${filename} not found`);
        }
      } else {
        if (!webcontainer) return;
        fileContent = await webcontainer.fs.readFile(artifactPath, "utf-8");
      }
      
      const appSpec = JSON.parse(fileContent);

      let contractSpec = appSpec;
      if (filename.endsWith('.arc32.json') && appSpec.contract) {
        contractSpec = appSpec.contract;
      }

      const createMethod = contractSpec.methods.find((m: any) => m.name === "createApplication");

      if (createMethod && createMethod.args && createMethod.args.length > 0) {
        setCurrentDeployFilename(filename);
        setContractArgs(createMethod.args);
        const initialArgs = createMethod.args.map((arg: any) => {
            if (arg.type.includes('uint')) return 0;
            if (arg.type === 'address') return wallet?.address || '';
            return '';
        });
        setDeployArgs(initialArgs);
        setIsDeployModalOpen(true);
      } else {
        await executeDeploy(filename, []);
      }
    } catch (error: any) {
      console.error("Deploy artifact failed:", error);
      toast({ title: "Deploy failed", description: error.message || String(error), variant: "destructive" });
    }
  };
  const saveProject = async () => {
    if (!projectId) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      // Get current file structure (excluding node_modules)
      let fileStructure = currentFiles;
      if (webcontainer) {
        fileStructure = await fetchWebContainerFileTree(webcontainer.fs, ".", selectedTemplate);
      }
      
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ file_structure: fileStructure })
      });
      
      if (response.ok) {
        handleTerminalOutput('Project saved successfully');
      } else {
        handleTerminalOutput('Failed to save project');
      }
    } catch (error) {
      console.error('Failed to save project:', error);
      handleTerminalOutput('Failed to save project');
    }
  };

  const handleSave = async () => {
    if (!activeFile || !fileContents[activeFile]) return;
    
    const content = fileContents[activeFile];
    
    // For WebContainer templates, ensure file is synced
    if (webcontainer && selectedTemplate !== 'PuyaPy' && selectedTemplate !== 'Pyteal' && selectedTemplate !== 'PyTeal' && selectedTemplate !== 'PuyaTs') {
      try {
        await updateFileInWebContainer(webcontainer, activeFile, content, selectedTemplate);
        handleTerminalOutput(`Saved: ${activeFile}`);
        // Clear unsaved indicator
        if (window && (window as any).clearUnsavedFile) {
          (window as any).clearUnsavedFile(activeFile);
        }
        // Auto-save project if projectId exists
        if (projectId) {
          await saveProject();
        }
      } catch (error) {
        console.error('Failed to save file:', error);
        handleTerminalOutput(`Failed to save: ${activeFile}`);
      }
    } else {
      // For Pyodide templates, just save to database
      try {
        handleTerminalOutput(`Saved: ${activeFile}`);
        // Clear unsaved indicator
        if (window && (window as any).clearUnsavedFile) {
          (window as any).clearUnsavedFile(activeFile);
        }
        // Auto-save project if projectId exists
        if (projectId) {
          await saveProject();
        }
      } catch (error) {
        console.error('Failed to save file:', error);
        handleTerminalOutput(`Failed to save: ${activeFile}`);
      }
    }
  }

  const handleSidebarSectionChange = (section: string) => {
    if (section === 'ai-chat') {
      setShowAIChat(true);
      return;
    }
    if (section === 'build-panel') {
      setShowBuildPanel(true);
      return;
    }
    setSidebarSection(section);
  }
  const executeMethod = async () => {
    if (!selectedContract || !selectedMethod) return;
    setIsDeploying(true);
    try {
      const artifactPath = `artifacts/${selectedContract.artifact}`;
      let fileContent: string;
      
      if (selectedTemplate === 'PuyaPy' || selectedTemplate === 'Pyteal' || selectedTemplate === 'PuyaTs') {
        fileContent = fileContents[artifactPath] || '';
        if (!fileContent) {
          throw new Error(`Artifact file ${selectedContract.artifact} not found`);
        }
      } else {
        if (!webcontainer) return;
        fileContent = await webcontainer.fs.readFile(artifactPath, "utf-8");
      }
      
      const appSpec = JSON.parse(fileContent);

      if(!wallet){
        throw new Error("Wallet not connected");
      }
      const account = algosdk.mnemonicToSecretKey(wallet.mnemonic);
      const creator = wallet;

      const { AlgorandClient } = await import("@algorandfoundation/algokit-utils");
      const algorandClient = AlgorandClient.fromConfig({
        algodConfig: { server: "https://testnet-api.algonode.cloud", token: "" },
        indexerConfig: { server: "https://testnet-idx.algonode.cloud", token: "" },
      });

      const appFactory = algorandClient.client.getAppFactory({
        appSpec,
        defaultSender: creator.address,
        defaultSigner: algosdk.makeBasicAccountTransactionSigner(account)
      });
      console.log(selectedContract.appId)

      const appClient = algorandClient.client.getAppClientById({
        appSpec,
        appId : BigInt(selectedContract.appId),
        defaultSender : creator.address,
        defaultSigner: algosdk.makeBasicAccountTransactionSigner(account)

      });

      console.log(executeArgs)

      // const createAppParams = await appFactory.params.create({
      //   method: selectedMethod.name,
      //   args: executeArgs,
      //   sender: creator.address, 
      //   signer: algosdk.makeBasicAccountTransactionSigner(account)
      // });
      
      const result = await appClient.send.call({method: selectedMethod.name, args: executeArgs,sender: creator.address, signer: algosdk.makeBasicAccountTransactionSigner(account),          populateAppCallResources: true,          staticFee: (2_000).microAlgo(),

      })

      toast({ title: "Method executed successfully!", description: `Result: ${result.return}` });
    } catch (error: any) {
      console.error("Method execution failed:", error);
      toast({ title: "Method execution failed", description: error.message || String(error), variant: "destructive" });
    } finally {
      setIsDeploying(false);
      setIsExecuteModalOpen(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: "var(--background-color)", color: "var(--text-color)" }}>
      {/* Title Bar */}
      <div className="h-9 flex items-center justify-between px-4 text-sm border-b flex-shrink-0" style={{ backgroundColor: "var(--sidebar-color)", borderColor: "var(--border-color)" }}>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#28ca42]"></div>
          </div>
          <span className="font-medium" style={{ color: "var(--text-color)" }}>Algokit IDE</span>
        </div>
        <div className="font-medium text-sm" style={{ color: "var(--text-color)" }}>{selectedTemplateName}</div>
        <div className="flex items-center gap-2">
          {wallet && wallet.address ? (
            <button
              onClick={() => setShowWallet(!showWallet)}
              className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
              style={{ backgroundColor: "var(--button-color)", color: "var(--text-color)" }}
            >
              Wallet: {`${String(wallet.address.substring(0,10))}...` || "Invalid Address"}
            </button>
          ) : (
            <button
              onClick={createWallet}
              className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
              style={{ backgroundColor: "var(--button-color)", color: "var(--text-color)" }}
            >
              Create Wallet
            </button>
          )}
        </div>
      </div>

      {/* Build Toolbar */}
      <BuildToolbar
        onBuild={handleBuild}
        onTest={handleTest}
        onDeploy={handleDeploy}
        onGenerateClient={handleGenerateClient}
        isBuilding={isBuilding}
        onStop={handleStop}
        isWebContainerReady={isWebContainerReady}
        onSave={handleSave}
      />

      {/* Main Layout */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Sidebar */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
          <div className="h-full border-r" style={{ backgroundColor: "var(--sidebar-color)", borderColor: "var(--border-color)" }}>
            <Sidebar
              activeSection={sidebarSection}
              onSectionChange={handleSidebarSectionChange}
              activeFile={activeFile}
              onFileSelect={openFile}
              webcontainer={webcontainer}
              onCreateFile={createFile}
              onRenameFile={renameFile}
              onDeleteFile={deleteFile}
              isWebContainerReady={isWebContainerReady}
              fileStructure={currentFiles}
              onArtifactFileSelect={setActiveArtifactFile}
              deployedContracts={deployedContracts}
              onContractSelect={(contract) => {
                setSelectedContract(contract);
                setIsMethodsModalOpen(true);
              }}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Main Content Area */}
        <ResizablePanel defaultSize={showBuildPanel ? 50 : 80}>
          <ResizablePanelGroup direction="vertical">
            {/* Editor Area */}
            <ResizablePanel defaultSize={70}>
              <ResizablePanelGroup direction="horizontal">
                {/* Code Editor */}
                <ResizablePanel defaultSize={showWallet ? 70 : 100}>
                  {activeArtifactFile ? (
                    <ArtifactFileViewerPanel
                      filePath={activeArtifactFile}
                      webcontainer={webcontainer}
                      fileContents={fileContents}
                      selectedTemplate={selectedTemplate}
                      onDeploy={deployArtifact}
                      onClose={() => setActiveArtifactFile(null)}
                    />
                  ) : sidebarSection === "tutorials" ? (
                    <TutorialPanel />
                  ) : (sidebarSection === "artifacts" || sidebarSection === "build") ? (
                    <ArtifactsPanel webcontainer={webcontainer} onDeploy={deployArtifact} />
                  ) : sidebarSection === "programs" ? (
                    <ProgramsPanel
                      deployedContracts={deployedContracts}
                      onContractSelect={(contract) => {
                        setSelectedContract(contract);
                        setIsMethodsModalOpen(true);
                      }}
                    />
                  ) : sidebarSection === "settings" ? (
                    <SettingsPanel />
                  ) : (
                    <CodeEditor
                      activeFile={activeFile}
                      openFiles={openFiles}
                      fileContents={fileContents}
                      onFileSelect={setActiveFile}
                      onFileClose={closeFile}
                      onFileContentChange={async (filePath, content) => {
                        setFileContents((prev) => ({ ...prev, [filePath]: content }))
                        
                        // For WebContainer templates, update WebContainer
                        if (webcontainer && selectedTemplate !== 'PuyaPy' && selectedTemplate !== 'Pyteal' && selectedTemplate !== 'PyTeal' && selectedTemplate !== 'PuyaTs') {
                          try {
                            await updateFileInWebContainer(webcontainer, filePath, content, selectedTemplate);
                          } catch (error) {
                            console.error('Failed to update file in WebContainer:', error);
                          }
                        }
                      }}
                      onSave={handleSave}
                      webcontainer={webcontainer}
                      template={selectedTemplate.toLowerCase() as 'pyteal' | 'tealscript' | 'puyapy' | 'puyats'}
                    />
                  )}
                </ResizablePanel>

                {/* Wallet Panel */}
                {showWallet && wallet && (
                  <>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
                      <div className="h-full border-l" style={{ backgroundColor: "var(--sidebar-color)", borderColor: "var(--border-color)" }}>
                        <WalletPanel wallet={wallet} onClose={() => setShowWallet(false)} />
                      </div>
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle />

            {/* Bottom Panel - Terminal */}
            <ResizablePanel defaultSize={30} minSize={20}>
              <ResizablePanelGroup direction="horizontal">
                {/* Build Terminal */}
                <ResizablePanel defaultSize={showAIChat ? 50 : 100}>
                  <div className="h-full border-t" style={{ backgroundColor: "var(--background-color)", borderColor: "var(--border-color)" }}>
                    <WebContainerTerminal
                      title="BUILD TERMINAL"
                      webcontainer={webcontainer}
                      output={terminalOutput}
                      onAddOutput={handleTerminalOutput}
                    />
                  </div>
                </ResizablePanel>

                {/* AI Chat Panel */}
                {showAIChat && (
                  <>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={50} minSize={30}>
                      <div className="h-full border-t border-l" style={{ backgroundColor: "var(--background-color)", borderColor: "var(--border-color)" }}>
                        <div className="h-full flex flex-col">
                          <div className="h-9 bg-[#2d2d30] flex items-center justify-between px-3 text-xs font-medium uppercase tracking-wide border-b border-[#3e3e42] flex-shrink-0">
                            <span className="text-[#cccccc]">AI Chat</span>
                            <button
                              onClick={() => setShowAIChat(false)}
                              className="text-[#cccccc] hover:text-white transition-colors"
                            >
                              ×
                            </button>
                          </div>
                          <div className="flex-1">
                            <AIChat 
                              title="" 
                              selectedTemplate={selectedTemplate}
                              activeFile={activeFile}
                              fileContent={activeFile ? fileContents[activeFile] : undefined}
                              onFileUpdate={async (filePath: string, content: string) => {
                                setFileContents((prev) => ({ ...prev, [filePath]: content }));
                                
                                // Update WebContainer for supported templates
                                if (webcontainer && selectedTemplate !== 'PuyaPy' && selectedTemplate !== 'Pyteal' && selectedTemplate !== 'PyTeal' && selectedTemplate !== 'PuyaTs') {
                                  try {
                                    await updateFileInWebContainer(webcontainer, filePath, content, selectedTemplate);
                                  } catch (error) {
                                    console.error('Failed to update file in WebContainer:', error);
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        {/* Build Panel */}
        {showBuildPanel && (
          <>
            <ResizableHandle />
            <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
              <div className="h-full border-l" style={{ backgroundColor: "var(--background-color)", borderColor: "var(--border-color)" }}>
                <div className="h-full flex flex-col">
                  <div className="h-9 bg-[#2d2d30] flex items-center justify-between px-3 text-xs font-medium uppercase tracking-wide border-b border-[#3e3e42] flex-shrink-0">
                    <span className="text-[#cccccc]">Build Panel</span>
                    <button
                      onClick={() => setShowBuildPanel(false)}
                      className="text-[#cccccc] hover:text-white transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex-1">
                    <BuildPanel
                      isBuilding={isBuilding}
                      buildOutput={terminalOutput}
                      onBuild={handleBuild}
                      onTest={handleTest}
                      onDeploy={handleDeploy}
                      onStop={handleStop}
                      onClearLogs={handleClearLogs}
                      artifacts={currentFiles.artifacts ? Object.keys(currentFiles.artifacts.directory).map(name => ({ name, size: 'Unknown' })) : []}
                      onDownloadSnapshot={handleDownloadSnapshot}
                    />
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
      <Dialog open={isDeployModalOpen} onOpenChange={setIsDeployModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deploy Contract: {currentDeployFilename}</DialogTitle>
            <DialogDescription>
              Please provide the arguments for the `createApplication` method.
            </DialogDescription>
          </DialogHeader>
          {isDeploying ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="grid gap-4 py-4">
                {contractArgs.map((arg, index) => (
                  <div className="grid grid-cols-4 items-center gap-4" key={arg.name}>
                    <Label htmlFor={`arg-${index}`} className="text-right">
                      {arg.name} ({arg.type})
                    </Label>
                    <Input
                      id={`arg-${index}`}
                      value={deployArgs[index] || ''}
                      onChange={(e) => {
                        const newArgs = [...deployArgs];
                        const value = arg.type.startsWith('uint') ? Number(e.target.value) : e.target.value;
                        newArgs[index] = value;
                        setDeployArgs(newArgs);
                      }}
                      className="col-span-3"
                      type={arg.type.startsWith('uint') ? 'number' : 'text'}
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button onClick={() => {
                  if (currentDeployFilename) {
                    executeDeploy(currentDeployFilename, deployArgs);
                  }
                }}>
                  Deploy
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isMethodsModalOpen} onOpenChange={setIsMethodsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contract Methods</DialogTitle>
            <DialogDescription>
              Select a method to execute for contract: {selectedContract?.appId}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedContract?.methods.map((method: any) => (
              <div key={method.name} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">{method.name}</span>
                    <Badge className="text-xs border border-input bg-background">
                      {method.args.length} args
                    </Badge>
                  </div>
                  <Button onClick={() => {
                    setSelectedMethod(method);
                    setExecuteArgs(method.args.map(() => ''));
                    setIsExecuteModalOpen(true);
                    setIsMethodsModalOpen(false);
                  }}>
                    Execute
                  </Button>
                </div>
                {method.args.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Arguments:</span>
                    <div className="mt-1 space-y-1">
                      {method.args.map((arg: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="font-mono text-xs">• {arg.name}:</span>
                          <span className="text-xs">{arg.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isExecuteModalOpen} onOpenChange={setIsExecuteModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Builder</DialogTitle>
            <DialogDescription>
              Build and execute transactions for your smart contract
            </DialogDescription>
          </DialogHeader>
          {selectedContract && selectedMethod && (
            <TransactionBuilder
              contract={selectedContract}
              method={selectedMethod}
              args={executeArgs}
              onArgsChange={setExecuteArgs}
              onExecute={executeMethod}
              isExecuting={isDeploying}
              wallet={wallet}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
