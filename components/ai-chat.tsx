import React, { useState, useRef, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { createClient } from '@supabase/supabase-js';
import { getEmbedding, cosineSimilarity } from "@/lib/embed";

interface AIChatProps {
  title: string;
  selectedTemplate?: string;
  activeFile?: string;
  fileContent?: string;
  onFileUpdate?: (filePath: string, content: string) => void;
}

interface Message {
  type: 'user' | 'ai';
  text: string;
  isLoading?: boolean;
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://toqvsuthxooqjelcayhm.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Validate environment variables
if (supabaseUrl === "https://toqvsuthxooqjelcayhm.supabase.co") {
  console.warn('⚠️ Supabase environment variables not configured. Using fallback mode.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const AIChat: React.FC<AIChatProps> = ({ title, selectedTemplate = "Pyteal", activeFile, fileContent, onFileUpdate }) => {
  const [selectedModel, setSelectedModel] = useState<string>('deepseek/deepseek-chat:free');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  // Test Supabase connection and show table info on mount
  useEffect(() => {
    const testConnection = async () => {
      const tableName = getTableName(selectedTemplate);
      console.log(`🔌 Testing Supabase connection for table: ${tableName}`);
      
      try {
        // Test connection by fetching table info
        const { data, error } = await supabase
          .from(tableName)
          .select('count')
          .limit(1);
        
        if (error) {
          console.error(`❌ Supabase connection failed for table ${tableName}:`, error);
          console.log(`💡 Make sure you have set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables`);
        } else {
          console.log(`✅ Supabase connection successful for table ${tableName}`);
          
          // Get actual table count
          const { count, error: countError } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
          
          if (countError) {
            console.error(`❌ Error getting table count:`, countError);
          } else {
            console.log(`📊 Table ${tableName} contains ${count} chunks`);
          }
        }
      } catch (error) {
        console.error(`❌ Error testing Supabase connection:`, error);
      }
    };

    testConnection();
    
    // Add a test message to verify markdown rendering
    console.log('🧪 Testing markdown rendering...');
    const testMarkdown = '```typescript\nconst hello = "world";\nconsole.log(hello);\n```';
    console.log('Test markdown:', testMarkdown);
  }, [selectedTemplate]);

  // Real Supabase integration for fetching chunks
  const getTopChunks = async (queryEmbedding: number[], topK: number = 6) => {
    const tableName = getTableName(selectedTemplate);
    console.log(`🔍 Starting vector search in table: ${tableName}`);
    console.log(`📊 Query embedding length: ${queryEmbedding.length}`);
    console.log(`🎯 Looking for top ${topK} most similar chunks`);

    try {
      // Fetch all chunks from the appropriate table
      console.log(`📡 Fetching chunks from Supabase table: ${tableName}`);
      const { data: chunks, error } = await supabase
        .from(tableName)
        .select("id, text, embedding");

      if (error) {
        console.error(`❌ Supabase error:`, error);
        throw error;
      }

      console.log(`✅ Successfully fetched ${chunks?.length || 0} chunks from ${tableName} table`);

      if (!chunks || chunks.length === 0) {
        console.warn(`⚠️ No chunks found in ${tableName} table`);
        return [];
      }

      // Calculate similarity scores for each chunk
      console.log(`🧮 Calculating cosine similarity scores...`);
      const scored = chunks.map((chunk) => {
        try {
          // Parse the embedding string to array of numbers
          const embedding = chunk.embedding.split(",").map(Number);
          const score = cosineSimilarity(queryEmbedding, embedding);
          
          console.log(`📊 Chunk ${chunk.id}: similarity score = ${score.toFixed(4)}`);
          
          return {
            ...chunk,
            score,
            originalEmbedding: chunk.embedding,
            parsedEmbedding: embedding
          };
        } catch (parseError) {
          console.error(`❌ Error parsing embedding for chunk ${chunk.id}:`, parseError);
          console.log(`🔍 Raw embedding data:`, chunk.embedding);
          return {
            ...chunk,
            score: 0,
            error: "Failed to parse embedding"
          };
        }
      });

      // Sort by score and get top K
      scored.sort((a, b) => b.score - a.score);
      const topChunks = scored.slice(0, topK);

      console.log(`🏆 Top ${topChunks.length} chunks by similarity:`);
      topChunks.forEach((chunk, index) => {
        console.log(`${index + 1}. Chunk ${chunk.id}: score = ${chunk.score.toFixed(4)}`);
        console.log(`   Text preview: "${chunk.text.substring(0, 100)}..."`);
      });

      return topChunks;
    } catch (error) {
      console.error(`❌ Error in getTopChunks:`, error);
      // Fallback to mock data if Supabase fails
      console.log(`🔄 Falling back to mock data due to error`);
      return [
        { 
          text: `[FALLBACK] Sample context from ${tableName} table (Supabase connection failed)`, 
          score: 0.95,
          id: 'fallback-1'
        },
        { 
          text: `[FALLBACK] Another relevant piece of information from ${tableName}`, 
          score: 0.87,
          id: 'fallback-2'
        },
        { 
          text: `[FALLBACK] Additional context for the query from ${tableName}`, 
          score: 0.82,
          id: 'fallback-3'
        }
      ];
    }
  };

  // Extract code from AI response using regex
  const extractCodeFromResponse = (response: string): string | null => {
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)\n```/;
    const match = response.match(codeBlockRegex);
    return match ? match[1].trim() : null;
  };

  // Simulated OpenRouter API call (you'll need to replace with actual API key)
  const askOpenRouter = async (prompt: string, isCodeEdit: boolean = false) => {
    try {
      console.log(`🤖 Sending request to OpenRouter API...`);
      console.log(`📝 Prompt length: ${prompt.length} characters`);
      
      const systemPrompt = isCodeEdit 
        ? `You are a coding assistant integrated into an IDE. The user will provide the current code file. Your task is to return the full modified code with the requested changes applied. Do not explain, just return the updated code wrapped in a single code block. Preserve formatting, comments, and structure. Do not remove unrelated code.`
        : `You are a helpful Algorand development assistant specializing in ${selectedTemplate}. Use the provided context to answer questions accurately and helpfully. Always format your responses using markdown for better readability. Use code blocks with appropriate language tags for code examples.`;
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API Error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`API Error: ${data.error.message || 'Unknown error'}`);
      }
      
      console.log(`✅ OpenRouter API response received successfully`);
      console.log(`🤖 AI response length: ${data.choices[0].message.content.length} characters`);
      
      return data.choices[0].message.content;
    } catch (error: any) {
      console.error("❌ OpenRouter API error:", error);
      
      if (error.message?.includes('rate-limited') || error.message?.includes('429')) {
        return "The AI service is currently rate-limited. Please try switching to a different model or wait a moment before trying again.";
      }
      
      return "I apologize, but I'm having trouble connecting to the AI service right now. Please try again later.";
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== '' && !isLoading) {
      const userMessage = inputMessage;
      console.log(`🚀 Starting message processing for: "${userMessage}"`);
      console.log(`🎯 Selected template: ${selectedTemplate}`);
      
      setMessages((prevMessages) => [...prevMessages, { type: 'user', text: userMessage }]);
      setInputMessage('');
      setIsLoading(true);

      try {
        // Step 1: Get embedding for the query
        console.log(`🔤 Step 1: Getting embedding for user query...`);
        const queryEmbedding = await getEmbedding(userMessage);
        console.log(`✅ Query embedding generated successfully`);
        console.log(`📊 Embedding vector length: ${queryEmbedding.length}`);
        console.log(`🔢 First 5 values: [${queryEmbedding.slice(0, 5).join(', ')}...]`);

        // Step 2: Search for similar chunks in the appropriate table
        console.log(`🔍 Step 2: Searching similar chunks in ${getTableName(selectedTemplate)} table...`);
        const topChunks = await getTopChunks(queryEmbedding);

        // Step 3: Build context from top chunks
        console.log(`📚 Step 3: Building context from top chunks...`);
        const context = topChunks.map((c: any) => c.text).join("\n\n");
        console.log(`📖 Context built successfully`);
        console.log(`📊 Context length: ${context.length} characters`);
        console.log(`📝 Context preview: "${context.substring(0, 200)}..."`);
        
        // Log detailed context information
        console.log(`🔍 Detailed context breakdown:`);
        topChunks.forEach((chunk, index) => {
          console.log(`   Chunk ${index + 1} (ID: ${chunk.id}, Score: ${chunk.score.toFixed(4)}):`);
          console.log(`   Text: "${chunk.text}"`);
          console.log(`   ---`);
        });

        // Step 4: Generate answer using OpenRouter
        console.log(`🤖 Step 4: Generating answer with context...`);
        
        // Check if user wants to edit current file
        const isCodeEditRequest = activeFile && fileContent && (
          userMessage.toLowerCase().includes('edit') ||
          userMessage.toLowerCase().includes('modify') ||
          userMessage.toLowerCase().includes('change') ||
          userMessage.toLowerCase().includes('update') ||
          userMessage.toLowerCase().includes('add') ||
          userMessage.toLowerCase().includes('fix')
        );
        
        let prompt: string;
        if (isCodeEditRequest) {
          const filePreview = fileContent.split('\n').slice(0, 5).join('\n');
          prompt = `Current file: ${activeFile}\n\nFile preview (first 5 lines):\n${filePreview}...\n\nFull file content:\n${fileContent}\n\nUser request: ${userMessage}\n\nReturn the complete modified file with the requested changes.`;
        } else {
          prompt = `Use the following context to answer the question about ${selectedTemplate} development:\n\nContext:\n${context}\n\nQuestion: ${userMessage}\n\nPlease provide a helpful and accurate answer based on the context provided. Format your response using markdown for better readability. Use code blocks with appropriate language tags for code examples.`;
        }
        
        console.log(`📝 Final prompt length: ${prompt.length} characters`);
        console.log(`📋 Full prompt being sent to AI:`);
        console.log(`--- START PROMPT ---`);
        console.log(prompt);
        console.log(`--- END PROMPT ---`);
        
        const answer = await askOpenRouter(prompt, isCodeEditRequest);
        
        // If it's a code edit request, extract and apply the code
        if (isCodeEditRequest && activeFile && onFileUpdate) {
          const extractedCode = extractCodeFromResponse(answer);
          if (extractedCode) {
            console.log(`🔧 Extracted code for ${activeFile}:`, extractedCode.substring(0, 100) + '...');
            onFileUpdate(activeFile, extractedCode);
            toast({
              title: "File updated!",
              description: `${activeFile} has been updated with AI suggestions.`,
            });
          }
        }

        console.log(`✅ AI response generated successfully`);
        setMessages((prevMessages) => [...prevMessages, { type: 'ai', text: answer }]);
      } catch (error) {
        console.error("❌ Error processing message:", error);
        setMessages((prevMessages) => [...prevMessages, { 
          type: 'ai', 
          text: "I apologize, but I encountered an error while processing your request. Please try again." 
        }]);
      } finally {
        setIsLoading(false);
        console.log(`🏁 Message processing completed`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  // Custom components for markdown rendering
  const markdownComponents = {
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      console.log('🔍 Code component rendered:', { inline, className, match, children: String(children).substring(0, 50) });
      
      return !inline && match ? (
        <div className="code-block-container relative group">
          <div className="code-language-badge">
            {match[1]}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
              toast({
                title: "Code copied!",
                description: "Code snippet copied to clipboard.",
              });
            }}
            className="copy-button"
            title="Copy code"
          >
            Copy
          </button>
          <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto border border-gray-600">
            <code className={`hljs language-${match[1]}`} {...props}>
              {children}
            </code>
          </pre>
        </div>
      ) : (
        <code className="bg-gray-700 px-1 py-0.5 rounded text-sm border border-gray-600" {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children }: any) => (
      <div className="my-4">
        {children}
      </div>
    ),
    p: ({ children }: any) => (
      <p className="mb-3 leading-relaxed">
        {children}
      </p>
    ),
    h1: ({ children }: any) => (
      <h1 className="text-2xl font-bold mb-4 text-blue-400">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-xl font-semibold mb-3 text-blue-300">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-lg font-medium mb-2 text-blue-200">
        {children}
      </h3>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside mb-3 space-y-1">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside mb-3 space-y-1">
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className="ml-4">
        {children}
      </li>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-300 my-3">
        {children}
      </blockquote>
    ),
    a: ({ href, children }: any) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 underline"
      >
        {children}
      </a>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-white">
        {children}
      </strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-gray-300">
        {children}
      </em>
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border-collapse border border-gray-600">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-gray-700">
        {children}
      </thead>
    ),
    tbody: ({ children }: any) => (
      <tbody>
        {children}
      </tbody>
    ),
    tr: ({ children }: any) => (
      <tr className="border-b border-gray-600 hover:bg-gray-700">
        {children}
      </tr>
    ),
    th: ({ children }: any) => (
      <th className="border border-gray-600 px-3 py-2 text-left font-semibold text-white">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="border border-gray-600 px-3 py-2">
        {children}
      </td>
    ),
    hr: () => (
      <hr className="border-t border-gray-600 my-6" />
    ),
    img: ({ src, alt }: any) => (
      <img 
        src={src} 
        alt={alt} 
        className="max-w-full h-auto rounded-lg my-4 border border-gray-600"
      />
    ),
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#d4d4d4]">
      <div className="h-9 bg-[#2d2d30] flex items-center justify-between px-3 text-xs font-medium uppercase tracking-wide border-b border-[#3e3e42] flex-shrink-0">
        <span className="text-[#cccccc]">{title}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs">Template: {selectedTemplate}</span>
          {activeFile && <span className="text-xs text-blue-400">File: {activeFile.split('/').pop()}</span>}
          <span className="text-xs">Model:</span>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[180px] h-7 text-xs">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="deepseek/deepseek-chat:free">DeepSeek Chat (Free)</SelectItem>
              <SelectItem value="google/gemini-flash-1.5:free">Gemini Flash 1.5 (Free)</SelectItem>
              <SelectItem value="meta-llama/llama-3.2-3b-instruct:free">Llama 3.2 3B (Free)</SelectItem>
              <SelectItem value="microsoft/phi-3-mini-128k-instruct:free">Phi-3 Mini (Free)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col space-y-4">
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
                  className={`max-w-[85%] p-4 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-white border border-gray-700'
                  }`}
                >
                  {message.type === 'user' ? (
                    <div className="whitespace-pre-wrap">{message.text}</div>
                  ) : (
                    <div className="ai-chat-prose">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw, rehypeHighlight]}
                        components={markdownComponents}
                      >
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] p-4 rounded-lg bg-gray-800 text-white border border-gray-700">
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
      <Toaster />
    </div>
  );
};

export default AIChat;
