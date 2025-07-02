"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"

import { WebContainer } from "@webcontainer/api"
import { Sidebar } from "@/components/sidebar"
import { CodeEditorDynamic as CodeEditor } from "@/components/code-editor-dynamic"
import { WebContainerTerminal } from "@/components/webcontainer-terminal"
import { XTermTerminalDynamic as XTermTerminal } from "@/components/xterm-terminal-dynamic"
import { BuildToolbar } from "@/components/build-toolbar"
import { WalletPanel } from "@/components/wallet-panel"
import { TutorialPanel } from "@/components/tutorial-panel"
import { files } from "@/components/files"
import { tealScriptFiles } from "@/components/tealScriptFiles"



interface Wallet {
  address: string
  balance: number
  privateKey: string
  mnemonic: string
  transactions: any[]
  algoPrice: number
}

// Utility to recursively fetch file structure from WebContainer
async function fetchWebContainerFileTree(fs: any, dir = ".") {
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
      tree[entryName] = { directory: await fetchWebContainerFileTree(fs, fullPath) };
    } else if (entry.isFile()) {
      tree[entryName] = { file: { contents: await fs.readFile(fullPath, "utf-8") } };
    }
  }
  return tree;
}

export default function AlgorandIDE() {
  // Template state
  const [selectedTemplate, setSelectedTemplate] = useState("PyTeal")
  const [currentFiles, setCurrentFiles] = useState<any>(files)

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

  const initialFilePaths = getAllFilePaths(currentFiles);

  const [activeFile, setActiveFile] = useState(initialFilePaths[0] || "");
  const [openFiles, setOpenFiles] = useState<string[]>(initialFilePaths);
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

  // Layout state
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [terminalHeight, setTerminalHeight] = useState(300)
  const [walletWidth, setWalletWidth] = useState(320)

  // WebContainer state - only one instance
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null)
  const [isBuilding, setIsBuilding] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  const [isWebContainerReady, setIsWebContainerReady] = useState(false)

  // Resize state
  const [isResizingSidebar, setIsResizingSidebar] = useState(false)
  const [isResizingTerminal, setIsResizingTerminal] = useState(false)
  const [isResizingWallet, setIsResizingWallet] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);

  const webcontainerRef = useRef<WebContainer | 'pending' | null>(null);
  useEffect(() => {
    if (webcontainerRef.current) {
      return;
    }

    webcontainerRef.current = 'pending';

    const initWebContainer = async () => {
      try {
        const webcontainerInstance = await WebContainer.boot();
        await webcontainerInstance.mount(files);
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
  }, []);

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
    const tree = await fetchWebContainerFileTree(webcontainer.fs);
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
    if (!webcontainer) return;

    // Initial fetch
    updateFileStructureFromWebContainer();

    const watcher = webcontainer.fs.watch(".", { recursive: true }, (event, filename) => {
      // Ignore changes within node_modules
      if (filename && filename.startsWith("node_modules/")) {
        console.log(`Ignoring file change in node_modules: ${event} on ${filename}`);
        return;
      }
      console.log(`File change detected: ${event} on ${filename}`);
      updateFileStructureFromWebContainer();
    });

    return () => {
      watcher.close();
    };
  }, [webcontainer, updateFileStructureFromWebContainer]);

  // File operations
  const createFile = async (filePath: string) => {
    if (!webcontainer) return;
    await webcontainer.fs.writeFile(filePath, "");
    // No need to call updateFileStructureFromWebContainer manually, watcher will pick it up
    setOpenFiles((prev) => [...prev, filePath]);
    setActiveFile(filePath);
  };

  const renameFile = async (oldPath: string, newPath: string) => {
    if (!webcontainer) return;
    const content = await webcontainer.fs.readFile(oldPath, "utf-8");
    await webcontainer.fs.rm(oldPath);
    await webcontainer.fs.writeFile(newPath, content);
    // Watcher will handle the update
    setOpenFiles((prev) => prev.map((p) => (p === oldPath ? newPath : p)));
    if (activeFile === oldPath) {
      setActiveFile(newPath);
    }
  };

  const deleteFile = async (filePath: string) => {
    if (!webcontainer) return;
    await webcontainer.fs.rm(filePath);
    // Watcher will handle the update
    closeFile(filePath);
  };

  const handleInstall = async () => {
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
    setIsInstalling(false);
  };

  const handleBuild = async () => {
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

  const handleTest = async () => {
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

  const handleTemplateChange = async (template: string) => {
    setSelectedTemplate(template)
    
    // Update current files based on template
    const newFiles = template === "PyTeal" ? files : tealScriptFiles
    setCurrentFiles(newFiles)
    
    // Update file paths and contents
    const newFilePaths = getAllFilePaths(newFiles)
    const newFileContents = getAllFileContents(newFiles)
    
    setOpenFiles(newFilePaths)
    setFileContents(newFileContents)
    setActiveFile(newFilePaths[0] || "")
    
    // Reinitialize WebContainer with new files
    if (webcontainer) {
      await webcontainer.mount(newFiles)
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

  return (
    <div className="h-screen bg-[#1e1e1e] text-white flex flex-col overflow-hidden">
      {/* Title Bar */}
      <div className="h-9 bg-[#323233] flex items-center justify-between px-4 text-sm border-b border-[#2d2d30] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#28ca42]"></div>
          </div>
          <span className="text-[#cccccc] font-medium">Algokit IDE</span>
        </div>
        <div className="flex items-center gap-2">
          {wallet && wallet.address ? (
            <button
              onClick={() => setShowWallet(!showWallet)}
              className="px-3 py-1.5 bg-[#0e639c] hover:bg-[#1177bb] rounded text-xs font-medium transition-colors"
            >
              Wallet: {`${String(wallet.address.substring(0,10))}...` || "Invalid Address"}
            </button>
          ) : (
            <button
              onClick={createWallet}
              className="px-3 py-1.5 bg-[#0e639c] hover:bg-[#1177bb] rounded text-xs font-medium transition-colors"
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
        onInstall={handleInstall}
        isBuilding={isBuilding}
        isInstalling={isInstalling}
        onStop={handleStop}
        isWebContainerReady={isWebContainerReady}
        selectedTemplate={selectedTemplate}
        onTemplateChange={handleTemplateChange}
      />

      {/* Main Layout */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className="bg-[#252526] border-r border-[#2d2d30] flex-shrink-0 overflow-hidden"
          style={{ width: `${sidebarWidth}px` }}
        >
          <Sidebar
            activeSection={sidebarSection}
            onSectionChange={setSidebarSection}
            activeFile={activeFile}
            onFileSelect={openFile}
            webcontainer={webcontainer}
            onCreateFile={createFile}
            onRenameFile={renameFile}
            onDeleteFile={deleteFile}
            isWebContainerReady={isWebContainerReady}
            fileStructure={currentFiles}
          />
        </div>

        {/* Sidebar Resize Handle */}
        <div
          className="w-1 bg-transparent hover:bg-[#0e639c] cursor-col-resize transition-colors flex-shrink-0 group"
          onMouseDown={handleSidebarMouseDown}
        >
          <div className="w-full h-full group-hover:bg-[#0e639c] transition-colors"></div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Code Editor */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {sidebarSection === "tutorials" ? (
                <TutorialPanel />
              ) : (
                <CodeEditor
                  activeFile={activeFile}
                  openFiles={openFiles}
                  fileContents={fileContents}
                  onFileSelect={setActiveFile}
                  onFileClose={closeFile}
                  onFileContentChange={(filePath, content) => {
                    setFileContents((prev) => ({ ...prev, [filePath]: content }))
                  }}
                  webcontainer={webcontainer}
                />
              )}
            </div>

            {/* Wallet Panel */}
            {showWallet && wallet && (
              <>
                {/* Wallet Resize Handle */}
                <div
                  className="w-1 bg-transparent hover:bg-[#0e639c] cursor-col-resize transition-colors flex-shrink-0 group"
                  onMouseDown={handleWalletMouseDown}
                >
                  <div className="w-full h-full group-hover:bg-[#0e639c] transition-colors"></div>
                </div>

                <div
                  className="bg-[#252526] border-l border-[#2d2d30] flex-shrink-0 overflow-hidden"
                  style={{ width: `${walletWidth}px` }}
                >
                  <WalletPanel wallet={wallet} onClose={() => setShowWallet(false)} />
                </div>
              </>
            )}
          </div>

          {/* Terminal Resize Handle */}
          <div
            className="h-1 bg-transparent hover:bg-[#0e639c] cursor-row-resize transition-colors flex-shrink-0 group"
            onMouseDown={handleTerminalMouseDown}
          >
            <div className="w-full h-full group-hover:bg-[#0e639c] transition-colors"></div>
          </div>

          {/* Dual Terminals - WebContainer + XTerm */}
          <div
            className="bg-[#1e1e1e] border-t border-[#2d2d30] flex-shrink-0 overflow-hidden flex"
            style={{ height: `${terminalHeight}px` }}
          >
            <div className="flex-1 border-r border-[#2d2d30]">
              <WebContainerTerminal
                title="BUILD TERMINAL"
                webcontainer={webcontainer}
                output={terminalOutput}
                onAddOutput={handleTerminalOutput}
              />
            </div>
            <div className="flex-1">
              <XTermTerminal title="TERMINAL" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
