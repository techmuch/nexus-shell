import React, { useState, useEffect, useRef } from 'react';
import { commandRegistry, ICommand } from '../../core/registry/CommandRegistry';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Search } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CommandPaletteProps {
  commands?: ICommand[];
  forcedOpen?: boolean;
}

export const CommandPalette = ({ commands: customCommands, forcedOpen = false }: CommandPaletteProps) => {
  const [isOpen, setIsOpen] = useState(forcedOpen);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const availableCommands = (customCommands || commandRegistry.getCommands()).filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.id.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setIsOpen(forcedOpen);
  }, [forcedOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setQuery('');
        setSelectedIndex(0);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % availableCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + availableCommands.length) % availableCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (availableCommands[selectedIndex]) {
        executeCommand(availableCommands[selectedIndex]);
      }
    }
  };

  const executeCommand = (command: ICommand) => {
    command.execute();
    if (!forcedOpen) setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      "z-[100] flex items-start justify-center pt-[10vh]",
      forcedOpen ? "relative pt-0 w-full max-w-xl" : "fixed inset-0 bg-black/50 backdrop-blur-sm"
    )}>
      <div className="w-full max-w-xl bg-popover text-popover-foreground border shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center px-4 border-b">
          <Search size={18} className="text-muted-foreground mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command to run..."
            className="flex-1 h-12 bg-transparent outline-none text-sm"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto py-2">
          {availableCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No commands found matching "{query}"
            </div>
          ) : (
            availableCommands.map((cmd, index) => (
              <div
                key={cmd.id}
                className={cn(
                  "px-4 py-2 cursor-pointer flex justify-between items-center text-sm",
                  index === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                )}
                onClick={() => executeCommand(cmd)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span>{cmd.label}</span>
                {cmd.keybinding && (
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">
                    {cmd.keybinding}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
        <div className="px-4 py-2 border-t bg-muted/30 flex justify-between items-center text-[10px] text-muted-foreground">
          <div className="flex gap-3">
            <span><kbd className="bg-muted px-1 rounded border">↑↓</kbd> to navigate</span>
            <span><kbd className="bg-muted px-1 rounded border">Enter</kbd> to select</span>
          </div>
          <span><kbd className="bg-muted px-1 rounded border">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};
