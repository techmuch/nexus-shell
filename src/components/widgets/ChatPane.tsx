import { useState, useRef, useEffect } from 'react';
import { useRightSidebarStore } from "../../core/services/RightSidebarService";
import { useChatStore, ISlashCommand } from "../../core/services/ChatService";
import { X, Send, User, MessageCircle, Terminal } from "lucide-react";
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
  const { slashCommands } = useChatStore();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'Nexus', text: 'Welcome to the Nexus Shell chat! How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = slashCommands.filter(cmd => 
    `/${cmd.command}`.startsWith(input.toLowerCase())
  );

  useEffect(() => {
    if (input.startsWith('/') && suggestions.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [input, suggestions.length]);

  if (!isChatOpen) return null;

  const handleSend = () => {
    if (!input.trim()) return;

    if (input.startsWith('/')) {
      const parts = input.slice(1).split(' ');
      const commandName = parts[0];
      const args = parts.slice(1);
      const cmd = slashCommands.find(c => c.command === commandName);
      
      if (cmd) {
        cmd.execute(args);
        setMessages(prev => [...prev, { id: Date.now(), sender: 'User', text: input }]);
        setInput('');
        return;
      }
    }

    const newMessage: Message = { id: Date.now(), sender: 'User', text: input };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    
    // Simulate Nexus response
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'Nexus', text: "I'm a simulated Nexus response. In a real application, I'd be connected to an LLM!" }]);
    }, 1000);
  };

  const handleSuggestionClick = (cmd: ISlashCommand) => {
    setInput(`/${cmd.command} `);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSuggestionIndex(prev => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        handleSuggestionClick(suggestions[suggestionIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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

      <div className="p-4 border-t border-border/50 relative">
        {showSuggestions && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-popover border shadow-xl rounded-lg overflow-hidden z-50">
            <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground border-b bg-muted/30">COMMANDS</div>
            {suggestions.map((cmd, index) => (
              <div
                key={cmd.command}
                className={cn(
                  "px-3 py-2 cursor-pointer flex items-center justify-between text-xs",
                  index === suggestionIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                )}
                onClick={() => handleSuggestionClick(cmd)}
                onMouseEnter={() => setSuggestionIndex(index)}
              >
                <div className="flex items-center space-x-2">
                  <Terminal size={12} className="text-primary" />
                  <span className="font-semibold">/{cmd.command}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{cmd.description}</span>
              </div>
            ))}
          </div>
        )}
        
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
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

