import React, { useState, useRef, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getEmbedding, cosineSimilarity } from "@/lib/embed";

interface AIChatProps {
  title: string;
  selectedTemplate?: string;
}

interface Message {
  type: 'user' | 'ai';
  text: string;
  isLoading?: boolean;
}

const AIChat: React.FC<AIChatProps> = ({ title, selectedTemplate = "Pyteal" }) => {
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-pro');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get table name based on selected template
  const getTableName = (template: string) => {
    switch (template) {
      case "PuyaPy":
        return "algopy";
      case "TealScript":
        return "tealscript";
      case "PuyaTs":
        return "puyats";
      case "Pyteal":
      default:
        return "pyteal";
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulated Supabase client (you'll need to replace with actual Supabase client)
  const getTopChunks = async (queryEmbedding: number[], topK: number = 6) => {
    // This is a placeholder - you'll need to implement actual Supabase query
    // For now, returning mock data
    console.log(`Searching in table: ${getTableName(selectedTemplate)}`);
    console.log(`Query embedding length: ${queryEmbedding.length}`);
    
    // Mock response - replace with actual Supabase query
    return [
      { text: "Sample context from " + getTableName(selectedTemplate) + " table", score: 0.95 },
      { text: "Another relevant piece of information", score: 0.87 },
      { text: "Additional context for the query", score: 0.82 }
    ];
  };

  // Simulated OpenRouter API call (you'll need to replace with actual API key)
  const askOpenRouter = async (prompt: string) => {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-0528:free",
          messages: [
            { role: "system", content: `You are a helpful Algorand development assistant specializing in ${selectedTemplate}. Use the provided context to answer questions accurately and helpfully.` },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("OpenRouter API error:", error);
      return "I apologize, but I'm having trouble connecting to the AI service right now. Please try again later.";
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== '' && !isLoading) {
      const userMessage = inputMessage;
      setMessages((prevMessages) => [...prevMessages, { type: 'user', text: userMessage }]);
      setInputMessage('');
      setIsLoading(true);

      try {
        // Step 1: Get embedding for the query
        console.log("Getting embedding for query...");
        const queryEmbedding = await getEmbedding(userMessage);

        // Step 2: Search for similar chunks in the appropriate table
        console.log(`Searching similar chunks in ${getTableName(selectedTemplate)} table...`);
        const topChunks = await getTopChunks(queryEmbedding);

        // Step 3: Build context from top chunks
        const context = topChunks.map((c: any) => c.text).join("\n");

        // Step 4: Generate answer using OpenRouter
        console.log("Generating answer with context...");
        const prompt = `Use the following context to answer the question about ${selectedTemplate} development:\n\nContext:\n${context}\n\nQuestion: ${userMessage}\n\nPlease provide a helpful and accurate answer based on the context provided.`;
        const answer = await askOpenRouter(prompt);

        setMessages((prevMessages) => [...prevMessages, { type: 'ai', text: answer }]);
      } catch (error) {
        console.error("Error processing message:", error);
        setMessages((prevMessages) => [...prevMessages, { 
          type: 'ai', 
          text: "I apologize, but I encountered an error while processing your request. Please try again." 
        }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#d4d4d4]">
      <div className="h-9 bg-[#2d2d30] flex items-center justify-between px-3 text-xs font-medium uppercase tracking-wide border-b border-[#3e3e42] flex-shrink-0">
        <span className="text-[#cccccc]">{title}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs">Template: {selectedTemplate}</span>
          <span className="text-xs">Model:</span>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[180px] h-7 text-xs">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
              <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col space-y-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-[#969696]">
              <h2 className="text-xl mb-2">Welcome back, builder!</h2>
              <p className="mb-1">Ask Questions about {selectedTemplate} development</p>
              <p className="text-sm">I'll search through the {getTableName(selectedTemplate)} knowledge base to help you!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-2 rounded-lg ${message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-white'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[70%] p-2 rounded-lg bg-gray-700 text-white">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Thinking...
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-[#3e3e42] flex items-center gap-2">
        <Input
          type="text"
          placeholder="Ask about Algorand development..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="flex-1 p-2 rounded bg-[#2d2d30] border border-[#3e3e42] text-white"
        />
        <Button onClick={handleSendMessage} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
};

export default AIChat;
