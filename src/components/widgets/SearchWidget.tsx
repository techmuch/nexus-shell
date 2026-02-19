import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ISearchResult {
  id: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<any>;
  category?: string;
}

export interface SearchWidgetProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  results: ISearchResult[];
  onSelect: (result: ISearchResult) => void;
  suggestions?: string[];
  loading?: boolean;
  className?: string;
}

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
            className="w-full bg-muted/50 border rounded-md pl-9 pr-8 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
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
