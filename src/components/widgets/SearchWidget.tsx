import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, Clock } from 'lucide-react';
import { cn } from '../../lib/cn';

/** A result row in {@link SearchWidget}. */
export interface ISearchResult {
  /** Stable identifier. Used as the React key. */
  id: string;
  /** Primary line. */
  title: string;
  /** Secondary line, truncated to one line. */
  description?: string;
  /** Icon component rendered at 14px in the leading badge. */
  icon?: React.ComponentType<any>;
  /** Short tag rendered right-aligned on the title row, e.g. `"FILE"`. */
  category?: string;
}

export interface SearchWidgetProps {
  /** Placeholder for the input. Defaults to `"Search..."`. */
  placeholder?: string;
  /**
   * Called with the current query, debounced by 300ms. Do your matching here
   * and feed the outcome back through `results`.
   */
  onSearch: (query: string) => void;
  /** Results for the current query. The widget renders them as given. */
  results: ISearchResult[];
  /** Called with the clicked result. */
  onSelect: (result: ISearchResult) => void;
  /** Past or suggested queries offered as autocomplete below the input. */
  suggestions?: string[];
  /** Swap the search icon for a spinner while a query is in flight. */
  loading?: boolean;
  /** Extra classes merged onto the root element. */
  className?: string;
}

/**
 * A full-height search panel: an input with autocomplete over a scrolling
 * result list. Sized for the sidebar, unlike the compact {@link QuickSearch}
 * that sits in the menu bar.
 *
 * Controlled with respect to results — it owns the query text and debounces it
 * to `onSearch`, but never filters `results` itself. That keeps async and
 * remote search straightforward.
 *
 * @example
 * ```tsx
 * <SearchWidget
 *   onSearch={setQuery}
 *   results={hits}
 *   loading={isFetching}
 *   suggestions={recentQueries}
 *   onSelect={(hit) => open(hit.id)}
 * />
 * ```
 */
export const SearchWidget: React.FC<SearchWidgetProps> = ({
  placeholder = "Search...",
  onSearch,
  results,
  onSelect,
  suggestions = [],
  loading = false,
  className
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const filteredSuggestions = suggestions.filter(s => 
    s.toLowerCase().includes(query.toLowerCase()) && s.toLowerCase() !== query.toLowerCase()
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredSuggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        setQuery(filteredSuggestions[selectedIndex]);
        setShowSuggestions(false);
      }
    }
  };

  return (
    <div ref={containerRef} className={cn("flex flex-col h-full bg-background", className)}>
      <div className="p-3 border-b border-border/50">
        <div className="relative">
          <div className="absolute left-2.5 top-2.5 text-muted-foreground">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          </div>
          <input
            type="text"
            className="w-full bg-secondary/50 border border-border rounded-md pl-9 pr-8 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
          />
          {query && (
            <button 
              onClick={() => { setQuery(''); onSearch(''); }}
              className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Autocomplete Suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute left-3 right-3 mt-1 bg-popover border shadow-lg rounded-md z-50 py-1 overflow-hidden">
            {filteredSuggestions.map((s, i) => (
              <div
                key={s}
                className={cn(
                  "px-3 py-1.5 text-xs cursor-pointer flex items-center space-x-2",
                  i === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                )}
                onClick={() => {
                  setQuery(s);
                  setShowSuggestions(false);
                }}
              >
                <Clock size={12} className="text-muted-foreground" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {results.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground italic">
            {query ? `No results found for "${query}"` : "Type to start searching..."}
          </div>
        ) : (
          <div className="py-2">
            {results.map((result) => {
              const Icon = result.icon;
              return (
                <div
                  key={result.id}
                  onClick={() => onSelect(result)}
                  className="px-4 py-2 hover:bg-accent/50 cursor-pointer group transition-colors border-l-2 border-transparent hover:border-primary"
                >
                  <div className="flex items-start space-x-3">
                    {Icon && (
                      <div className="mt-0.5 p-1 rounded bg-muted group-hover:bg-background transition-colors">
                        <Icon size={14} className="text-muted-foreground group-hover:text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium truncate">{result.title}</span>
                        {result.category && (
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-1.5 py-0.5 bg-muted rounded">
                            {result.category}
                          </span>
                        )}
                      </div>
                      {result.description && (
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {result.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
