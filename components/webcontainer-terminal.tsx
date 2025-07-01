"use client"

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react"
import type { WebContainer } from "@webcontainer/api"

interface WebContainerTerminalProps {
  title: string
  webcontainer: WebContainer | null
}

export interface WebContainerTerminalRef {
  addOutput: (text: string) => void;
}

export const WebContainerTerminal = forwardRef<WebContainerTerminalRef, WebContainerTerminalProps>(
  ({ title, webcontainer }, ref) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [output, setOutput] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState<string>("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const addOutputLine = (line: string) => {
    setOutput((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${line}`]);
  };

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    addOutputLine(`$ ${command}`);
    setCommandHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);
    setCurrentInput("");
    setIsProcessing(true);

    if (!webcontainer) {
      addOutputLine("Error: WebContainer not ready.");
      setIsProcessing(false);
      return;
    }

    try {
      const [cmd, ...args] = command.split(" ");
      const process = await webcontainer.spawn(cmd, args);

      process.output.pipeTo(
        new WritableStream({
          write(data) {
            addOutputLine(data);
          },
        }),
      );

      const exitCode = await process.exit;
      addOutputLine(`Command exited with code: ${exitCode}`);
    } catch (error: any) {
      addOutputLine(`Error executing command: ${error.message}`);
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isProcessing) {
      executeCommand(currentInput);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput("");
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      }
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    if (webcontainer) {
      addOutputLine(`${title} ready`);
    }
  }, [webcontainer, title]);

  return (
    <div className="h-full bg-[#1e1e1e] flex flex-col">
      <div className="h-8 bg-[#2d2d30] flex items-center px-3 text-xs font-medium border-b border-[#3e3e42]">
        {title}
      </div>

      <div
        ref={terminalRef}
        className="flex-1 overflow-auto p-3 font-mono text-sm text-[#cccccc] cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {output.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap">
            {line}
          </div>
        ))}
        <div className="flex items-center mt-1">
          <span className="text-green-400">$ </span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            className="flex-1 bg-transparent outline-none text-gray-300 ml-1"
            autoFocus
          />
          {isProcessing && <span className="text-gray-500 animate-pulse"> ⏳</span>}
        </div>
      </div>
    </div>
  );
});
