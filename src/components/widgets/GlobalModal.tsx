import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, HelpCircle, Info, X } from 'lucide-react';
import { useModalStore } from '../../core/services/ModalStoreService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const GlobalModal: React.FC = () => {
  const { isOpen, type, title, message, defaultValue, close } = useModalStore();
  const [inputValue, setInputValue] = useState(defaultValue || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue || '');
      // Focus input automatically if it's a prompt
      setTimeout(() => {
        if (type === 'prompt' && inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
    }
  }, [isOpen, type, defaultValue]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (type === 'prompt') {
      close(inputValue);
    } else if (type === 'confirm') {
      close(true);
    } else {
      close();
    }
  };

  const handleCancel = () => {
    if (type === 'prompt') {
      close(null);
    } else if (type === 'confirm') {
      close(false);
    } else {
      close();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const Icon = type === 'alert' ? AlertCircle : type === 'confirm' ? HelpCircle : Info;
  const iconColor = type === 'alert' ? 'text-destructive' : type === 'confirm' ? 'text-amber-500' : 'text-blue-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background/80 backdrop-blur-sm transition-all duration-300">
      <div 
        className={cn(
          "relative flex flex-col w-full max-w-md p-6 bg-card border border-border shadow-2xl rounded-2xl animate-in fade-in zoom-in-95",
          "ring-1 ring-white/10"
        )}
        role="dialog"
        aria-modal="true"
        onKeyDown={handleKeyDown}
      >
        <button 
          className="absolute top-4 right-4 p-1 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          onClick={handleCancel}
        >
          <X size={18} />
        </button>

        <div className="flex items-start space-x-4 mb-4">
          <div className={cn("p-2 bg-muted rounded-full shrink-0", iconColor)}>
            <Icon size={24} />
          </div>
          <div className="flex-1 mt-1">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{message}</p>
          </div>
        </div>

        {type === 'prompt' && (
          <div className="mt-2 mb-4">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
              placeholder="Enter value..."
            />
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 mt-4">
          {type !== 'alert' && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleConfirm}
            autoFocus={type !== 'prompt'} // auto focus confirm button if not a prompt
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg text-primary-foreground transition-colors",
              type === 'alert' ? "bg-primary hover:bg-primary/90" : "bg-primary hover:bg-primary/90"
            )}
          >
            {type === 'alert' ? 'OK' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};
