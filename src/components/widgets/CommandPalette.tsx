import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../lib/cn';

/** An entry in the {@link CommandPalette} list. */
export interface ICommandItem {
  /** Stable identifier. Also matched against the query. */
  id: string;
  /** Human-readable name shown in the list and matched against the query. */
  label: string;
  /** Optional keybinding hint rendered on the right, e.g. `"⌘K"`. */
  keybinding?: string;
}

export interface CommandPaletteProps<T extends ICommandItem = ICommandItem> {
  /** Whether the palette is showing. */
  open: boolean;
  /** Commands to offer. Filtered against the query by `label` and `id`. */
  commands: T[];
  /** Called with the chosen command on click or Enter. */
  onSelect: (command: T) => void;
  /** Called on Escape and on backdrop click. */
  onClose?: () => void;
  /**
   * Render inline instead of as a fixed overlay. Useful for documenting the
   * palette in Storybook, or embedding it in a page. Defaults to `false`.
   */
  inline?: boolean;
  /** Placeholder for the query input. */
  placeholder?: string;
  /**
   * Custom filter. Receives every command and the current query; return `true`
   * to keep. Defaults to a case-insensitive substring match on `label` and `id`.
   */
  filter?: (command: T, query: string) => boolean;
  /** Extra classes merged onto the palette surface. */
  className?: string;
}

const defaultFilter = (command: ICommandItem, query: string) => {
  const q = query.toLowerCase();
  return (
    command.label.toLowerCase().includes(q) || command.id.toLowerCase().includes(q)
  );
};

/**
 * A VS Code-style command palette: a fuzzy-filtered, keyboard-navigable list of
 * commands over a dimmed backdrop.
 *
 * Fully controlled — it owns only the query text and the highlighted row.
 * Visibility, the command list and execution are the caller's. It also binds no
 * global keyboard shortcut; for the store-backed variant that reads the
 * {@link commandRegistry} and binds `Cmd/Ctrl+Shift+P`, see
 * `ConnectedCommandPalette`.
 *
 * Arrow keys move the highlight, Enter selects, Escape closes.
 *
 * @example
 * ```tsx
 * <CommandPalette
 *   open={open}
 *   commands={[{ id: 'file.save', label: 'Save File', keybinding: '⌘S' }]}
 *   onSelect={(cmd) => { run(cmd.id); setOpen(false); }}
 *   onClose={() => setOpen(false)}
 * />
 * ```
 */
export const CommandPalette = <T extends ICommandItem = ICommandItem>({
  open,
  commands,
  onSelect,
  onClose,
  inline = false,
  placeholder = 'Type a command to run…',
  filter = defaultFilter as (command: T, query: string) => boolean,
  className,
}: CommandPaletteProps<T>) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(
    () => commands.filter((c) => filter(c, query)),
    [commands, query, filter],
  );

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!open) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (matches.length ? (i + 1) % matches.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) =>
        matches.length ? (i - 1 + matches.length) % matches.length : 0,
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (matches[selectedIndex]) onSelect(matches[selectedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose?.();
    }
  };

  return (
    <div
      onClick={inline ? undefined : onClose}
      className={cn(
        'z-[100] flex items-start justify-center',
        inline
          ? 'relative w-full max-w-xl'
          : 'fixed inset-0 pt-[10vh] bg-black/50 backdrop-blur-sm',
      )}
    >
      <div
        role="dialog"
        aria-modal={!inline}
        aria-label="Command Palette"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full max-w-xl bg-popover text-popover-foreground border shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in duration-200',
          className,
        )}
      >
        <div className="flex items-center px-4 border-b">
          <Search size={18} className="text-muted-foreground mr-3" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded
            aria-controls="command-palette-list"
            aria-label="Command"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 h-14 bg-transparent outline-none text-base text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div
          id="command-palette-list"
          role="listbox"
          className="max-h-[300px] overflow-y-auto py-2"
        >
          {matches.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {query ? `No commands found matching "${query}"` : 'No commands available.'}
            </div>
          ) : (
            matches.map((cmd, index) => (
              <div
                key={cmd.id}
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => onSelect(cmd)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  'px-4 py-2 cursor-pointer flex justify-between items-center text-sm',
                  index === selectedIndex
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50',
                )}
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
            <span>
              <kbd className="bg-muted px-1 rounded border">↑↓</kbd> to navigate
            </span>
            <span>
              <kbd className="bg-muted px-1 rounded border">Enter</kbd> to select
            </span>
          </div>
          <span>
            <kbd className="bg-muted px-1 rounded border">Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
};
