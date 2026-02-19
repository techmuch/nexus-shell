import React, { useState, useRef, useEffect } from 'react';
import { useTerminalStore } from '../../core/services/TerminalService';
import { X, Terminal as TerminalIcon, ChevronUp } from 'lucide-react';

export const TerminalPane = () => {
  const { isOpen, setOpen, history, addHistory, clearHistory } = useTerminalStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const cmd = input.trim();
      if (!cmd) return;

      addHistory(`$ ${cmd}`);
      
      const lowerCmd = cmd.toLowerCase();
      if (lowerCmd === 'clear') {
        clearHistory();
      } else if (lowerCmd === 'help') {
        addHistory('Available commands: help, clear, echo [text], date, theme');
      } else if (lowerCmd.startsWith('echo ')) {
        addHistory(cmd.slice(5));
      } else if (lowerCmd === 'date') {
        addHistory(new Date().toLocaleString());
      } else {
        addHistory(`Command not found: ${cmd}`);
      }

      setInput('');
    }
  };

  return (
    <div className="h-[250px] bg-background border-t border-border flex flex-col select-text animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="h-9 border-b border-border/50 flex items-center justify-between px-4 bg-muted/30">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest border-b-2 border-primary pb-2.5 pt-2.5 mt-0.5">
            <TerminalIcon size={14} />
            <span>Terminal</span>
          </div>
          <div className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Output</div>
          <div className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Debug Console</div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1 hover:bg-accent rounded text-muted-foreground"><ChevronUp size={14} /></button>
          <button onClick={() => setOpen(false)} className="p-1 hover:bg-accent rounded text-muted-foreground"><X size={14} /></button>
        </div>
      </div>

      {/* Output */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1 bg-black/5 dark:bg-black/20"
      >
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-all opacity-90">{line}</div>
        ))}
        <div className="flex items-center space-x-2 pt-1">
          <span className="text-primary font-bold">$</span>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-xs font-mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleCommand}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
};
