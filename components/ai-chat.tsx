import React, { useState, useRef, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AIChatProps {
  title: string;
}

interface Message {
  type: 'user' | 'ai';
  text: string;
}

const AIChat: React.FC<AIChatProps> = ({ title }) => {
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-pro');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() !== '') {
      setMessages((prevMessages) => [...prevMessages, { type: 'user', text: inputMessage }]);
      setInputMessage('');
      // Simulate AI response
      setTimeout(() => {
        setMessages((prevMessages) => [...prevMessages, { type: 'ai', text: `AI response to: "${inputMessage}"` }]);
      }, 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#d4d4d4]">
      <div className="h-9 bg-[#2d2d30] flex items-center justify-between px-3 text-xs font-medium uppercase tracking-wide border-b border-[#3e3e42] flex-shrink-0">
        <span className="text-[#cccccc]">{title}</span>
        <div className="flex items-center gap-2">
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
          {messages.map((message, index) => (
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
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-[#3e3e42] flex items-center gap-2">
        <Input
          type="text"
          placeholder="Type your message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 p-2 rounded bg-[#2d2d30] border border-[#3e3e42] text-white"
        />
        <Button onClick={handleSendMessage}>Send</Button>
      </div>
    </div>
  );
};

export default AIChat;
