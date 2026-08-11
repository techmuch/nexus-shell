import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/cn';

/** A single row in the {@link QuickSearch} dropdown. */
export interface IQuickSearchResult {
  /** Identifier, unique within its category. */
  id: string;
  /** Primary line. */
  title: string;
  /** Secondary line, truncated to one line. Often a path or shortcut hint. */
  description?: string;
  /**
   * Group heading this result appears under. Groups render in the order given
   * by the `categories` prop, or in first-seen order when that is omitted.
   */
  category: string;
  /** Icon component rendered at 12px in the row's leading badge. */
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

export interface QuickSearchProps<T extends IQuickSearchResult = IQuickSearchResult> {
  /**
   * Results for the current query. `QuickSearch` does no filtering — it renders
   * exactly what you give it, so you control matching, ranking and async
   * loading.
   */
  results: T[];
  /** Called on every keystroke, debounced by `debounceMs`. */
  onQueryChange?: (query: string) => void;
  /** Called when a row is clicked or chosen with Enter. */
  onSelect: (result: T) => void;
  /**
   * Explicit category order. Categories absent from this list are dropped, so
   * it doubles as a whitelist. Defaults to first-seen order.
   */
  categories?: string[];
  /** Placeholder for the input. Defaults to `"Search…"`. */
  placeholder?: string;
  /** Delay before `onQueryChange` fires, in ms. Defaults to `200`. */
  debounceMs?: number;
  /** Extra classes merged onto the root element. */
  className?: string;
}

/**
 * A compact search field with a grouped results dropdown, sized to sit inside a
 * {@link MenuBar}.
 *
 * Presentational and fully controlled — it owns the query text, the open state
 * and the keyboard highlight, and nothing else. Searching is entirely yours:
 * results are pushed in via `results`, so the same component backs a local
 * array, a registry lookup, or a remote index.
 *
 * Arrow keys move the highlight across groups, Enter selects, Escape closes.
 *
 * @example
 * ```tsx
 * <QuickSearch
 *   results={hits}
 *   categories={['Actions', 'Files']}
 *   onQueryChange={setQuery}
 *   onSelect={(hit) => open(hit.id)}
 * />
 * ```
 */
export const QuickSearch = <T extends IQuickSearchResult = IQuickSearchResult>({
  results,
  onQueryChange,
  onSelect,
  categories,
  placeholder = 'Search…',
  debounceMs = 200,
  className,
}: QuickSearchProps<T>) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const order = useMemo(() => {
    if (categories) return categories;
    return [...new Set(results.map((r) => r.category))];
  }, [categories, results]);

  /** Results in render order, so the highlight index maps to a visible row. */
  const ordered = useMemo(
    () => order.flatMap((cat) => results.filter((r) => r.category === cat)),
    [order, results],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!onQueryChange) return;
    const id = window.setTimeout(() => onQueryChange(query), debounceMs);
    return () => window.clearTimeout(id);
  }, [query, debounceMs, onQueryChange]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const choose = (result: T) => {
    onSelect(result);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') setIsOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (ordered.length ? (i + 1) % ordered.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) =>
        ordered.length ? (i - 1 + ordered.length) % ordered.length : 0,
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (ordered[selectedIndex]) choose(ordered[selectedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="relative flex items-center">
        <Search
          size={13}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-label={placeholder}
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full h-7 pl-8 pr-7 bg-secondary/35 border border-border/40 rounded-md text-xs text-foreground placeholder:text-muted-foreground/75 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-background/95 focus:border-primary/50 transition-all font-sans"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={11} />
          </button>
        )}
      </div>

      {isOpen && query.trim() && (
        <div
          role="listbox"
          className="absolute right-0 md:left-0 mt-1.5 w-80 max-h-[380px] bg-popover text-popover-foreground border border-border shadow-lg rounded-lg overflow-hidden flex flex-col z-[100] animate-in fade-in-50 slide-in-from-top-1 duration-100"
        >
          <div className="flex-1 overflow-y-auto py-1">
            {ordered.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-muted-foreground italic">
                No results found matching "{query}"
              </div>
            ) : (
              order.map((category) => {
                const items = results.filter((r) => r.category === category);
                if (items.length === 0) return null;

                return (
                  <div key={category} className="flex flex-col">
                    <div className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80 bg-muted/40 border-y border-border/20 first:border-t-0">
                      {category}
                    </div>

                    {items.map((item) => {
                      const Icon = item.icon;
                      const flatIndex = ordered.indexOf(item);
                      const isSelected = flatIndex === selectedIndex;

                      return (
                        <div
                          key={`${item.category}-${item.id}`}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => choose(item)}
                          onMouseEnter={() => setSelectedIndex(flatIndex)}
                          className={cn(
                            'px-3 py-2 cursor-pointer flex items-start space-x-2.5 transition-colors border-l-2',
                            isSelected
                              ? 'bg-accent text-accent-foreground border-primary'
                              : 'border-transparent hover:bg-accent/40',
                          )}
                        >
                          {Icon && (
                            <div
                              className={cn(
                                'mt-0.5 p-1 rounded bg-muted/50',
                                isSelected && 'bg-background text-primary',
                              )}
                            >
                              <Icon size={12} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">{item.title}</div>
                            {item.description && (
                              <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          {ordered.length > 0 && (
            <div className="px-3 py-1.5 border-t border-border bg-muted/20 flex items-center justify-between text-[9px] text-muted-foreground select-none shrink-0 font-mono">
              <div className="flex space-x-2">
                <span>
                  <kbd className="bg-muted px-1 rounded border border-border/60">↑↓</kbd>{' '}
                  navigate
                </span>
                <span>
                  <kbd className="bg-muted px-1 rounded border border-border/60">↵</kbd>{' '}
                  select
                </span>
              </div>
              <span>ESC to close</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
