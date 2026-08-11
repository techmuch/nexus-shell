import React, { useEffect, useRef, useState } from 'react';
import { ChevronUp, Terminal as TerminalIcon, X } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface TerminalPaneProps {
  /** Lines already written to the terminal, oldest first. */
  history?: string[];
  /**
   * Called with the trimmed command text when the user presses Enter. Empty
   * input is swallowed and never reaches this handler.
   *
   * The component does not echo the command or interpret it — append the echo
   * and any output to `history` yourself. This keeps command semantics
   * (`clear`, `help`, anything app-specific) entirely in your hands.
   */
  onCommand?: (command: string) => void;
  /** Called when the collapse or close button is pressed. */
  onClose?: () => void;
  /** Height of the pane, as a CSS length. Defaults to `"250px"`. */
  height?: string;
  /** Prompt string shown before the input. Defaults to `"$"`. */
  prompt?: string;
  /** Title shown in the pane header. Defaults to `"Terminal"`. */
  title?: string;
  /** Extra classes merged onto the root element. */
  className?: string;
}

/**
 * A bottom-docked terminal pane: a scrolling output log over a single-line
 * input.
 *
 * Presentational and fully controlled — it owns only the in-progress input
 * text. Visibility, history and command execution all belong to the caller.
 * For the store-backed variant with built-in `clear`/`help` handling, see
 * `ConnectedTerminalPane`.
 *
 * @example
 * ```tsx
 * const [history, setHistory] = useState<string[]>([]);
 * <TerminalPane
 *   history={history}
 *   onCommand={(cmd) => setHistory((h) => [...h, `$ ${cmd}`, run(cmd)])}
 *   onClose={() => setOpen(false)}
 * />
 * ```
 */
export const TerminalPane = ({
  history = [],
  onCommand,
  onClose,
  height = '250px',
  prompt = '$',
  title = 'Terminal',
  className,
}: TerminalPaneProps) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    const command = input.trim();
    if (!command) return;
    onCommand?.(command);
    setInput('');
  };

  return (
    <div
      style={{ height }}
      className={cn(
        'bg-card border-t border-border flex flex-col shrink-0 font-mono text-xs',
        className,
      )}
    >
      <div className="h-8 flex items-center justify-between px-3 border-b border-border/50 shrink-0">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <TerminalIcon size={13} />
          <span className="text-[11px] font-bold uppercase tracking-widest">
            {title}
          </span>
        </div>
        {onClose && (
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={onClose}
              aria-label="Collapse Terminal"
              className="p-1 rounded hover:bg-accent hover:text-foreground text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <ChevronUp size={14} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Terminal"
              className="p-1 rounded hover:bg-accent hover:text-foreground text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        role="log"
        aria-label={`${title} output`}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-all text-foreground/90">
            {line}
          </div>
        ))}
      </div>

      <div className="flex items-center px-3 py-2 border-t border-border/50 shrink-0">
        <span className="text-primary mr-2 select-none">{prompt}</span>
        <input
          ref={inputRef}
          type="text"
          aria-label={`${title} input`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
};
