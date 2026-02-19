import { useState } from 'react';
import { useRightSidebarStore } from "../../core/services/RightSidebarService";
import { X, Send, User, MessageCircle } from "lucide-react";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: number;
  sender: 'User' | 'Nexus';
  text: string;
}

export const ChatPane = () => {
  const { isChatOpen, setChatOpen } = useRightSidebarStore();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'Nexus', text: 'Welcome to the Nexus Shell chat! How can I help you today?' },
  ]);
  const [input, setInput] = useState('');

  if (!isChatOpen) return null;

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage: Message = { id: Date.now(), sender: 'User', text: input };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    
    // Simulate Nexus response
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'Nexus', text: "I'm a simulated Nexus response. In a real application, I'd be connected to an LLM!" }]);
    }, 1000);
  };

  return (
    <div className="w-[350px] h-full bg-muted border-l flex flex-col select-none animate-in slide-in-from-right duration-300">
      <div className="h-10 flex items-center justify-between px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/50">
        <div className="flex items-center space-x-2">
            <MessageCircle size={14} />
            <span>Chat</span>
        </div>
        <button 
          onClick={() => setChatOpen(false)}
          className="p-1 hover:bg-accent hover:text-foreground rounded transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={cn(
            "flex flex-col space-y-1",
            msg.sender === 'User' ? "items-end" : "items-start"
          )}>
            <div className="flex items-center space-x-1 text-[10px] text-muted-foreground">
              <User size={10} />
              <span>{msg.sender}</span>
            </div>
            <div className={cn(
              "px-3 py-2 rounded-lg text-sm max-w-[90%]",
              msg.sender === 'User' 
                ? "bg-primary text-primary-foreground" 
                : "bg-accent/50 text-foreground"
            )}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border/50">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask Nexus..."
            className="w-full bg-background border rounded-md p-2 text-sm focus:ring-1 focus:ring-primary outline-none resize-none min-h-[80px]"
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 bottom-2 p-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
