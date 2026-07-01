import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Terminal, 
  File, 
  Folder, 
  HelpCircle, 
  Lightbulb, 
  ThumbsUp, 
  ThumbsDown, 
  FileText, 
  CheckSquare, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Map as MapIcon,
  X
} from 'lucide-react';
import { commandRegistry, ICommand } from '../../core/registry/CommandRegistry';
import { useFileStore } from '../../core/services/FileStoreService';
import { useLayoutStore } from '../../core/services/LayoutService';
import { ITreeNode } from './TreeWidget';

// Custom interface for search result items
export interface IUnifiedSearchResult {
  id: string;
  title: string;
  description?: string;
  category: 'Actions' | 'Files' | 'Map Nodes';
  icon: React.ComponentType<any>;
  originalData: any;
}

export const MenuBarSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<IUnifiedSearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fileNodes = useFileStore((state) => state.nodes);
  const { addTab } = useLayoutStore();

  // Handle clicking outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform search on query change
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const q = query.toLowerCase();
    const tempResults: IUnifiedSearchResult[] = [];

    // 1. Search Actions/Commands
    const commands = commandRegistry.getCommands();
    const matchedCommands = commands.filter(cmd => 
      cmd.label.toLowerCase().includes(q) || cmd.id.toLowerCase().includes(q)
    );
    matchedCommands.forEach(cmd => {
      tempResults.push({
        id: cmd.id,
        title: cmd.label,
        description: cmd.keybinding ? `Shortcut: ${cmd.keybinding}` : cmd.id,
        category: 'Actions',
        icon: Terminal,
        originalData: cmd
      });
    });

    // 2. Search Explorer Files (recursive)
    const searchFilesRecursive = (nodes: ITreeNode[], path = '') => {
      nodes.forEach(node => {
        const currentPath = path ? `${path}/${node.label}` : node.label;
        if (node.label.toLowerCase().includes(q)) {
          tempResults.push({
            id: node.id,
            title: node.label,
            description: currentPath,
            category: 'Files',
            icon: node.type === 'folder' ? Folder : File,
            originalData: node
          });
        }
        if (node.children && node.children.length > 0) {
          searchFilesRecursive(node.children, currentPath);
        }
      });
    };
    searchFilesRecursive(fileNodes);

    // 3. Search Dialogue Nodes (from window store reference if active)
    const useMapStore = (window as any).useDialogueMappingStore;
    if (useMapStore) {
      try {
        const mapNodes = useMapStore.getState().nodes;
        const matchedMapNodes = mapNodes.filter((node: any) => {
          const titleMatch = node.data.title?.toLowerCase().includes(q);
          const descMatch = node.data.description?.toLowerCase().includes(q);
          const tagMatch = node.data.tags?.some((tag: string) => tag.toLowerCase().includes(q));
          return titleMatch || descMatch || tagMatch;
        });

        matchedMapNodes.forEach((node: any) => {
          let nodeIcon = FileText;
          switch (node.data.type) {
            case 'question': nodeIcon = HelpCircle; break;
            case 'idea': nodeIcon = Lightbulb; break;
            case 'pro': nodeIcon = ThumbsUp; break;
            case 'con': nodeIcon = ThumbsDown; break;
            case 'note': nodeIcon = FileText; break;
            case 'decision': nodeIcon = CheckSquare; break;
            case 'link': nodeIcon = LinkIcon; break;
            case 'image': nodeIcon = ImageIcon; break;
            case 'map': nodeIcon = MapIcon; break;
          }

          tempResults.push({
            id: node.id,
            title: node.data.title || 'Untitled Node',
            description: node.data.description || `Type: ${node.data.type}`,
            category: 'Map Nodes',
            icon: nodeIcon,
            originalData: node
          });
        });
      } catch (err) {
        console.error('Error fetching map nodes for search:', err);
      }
    }

    setResults(tempResults);
    setSelectedIndex(0);
  }, [query, fileNodes]);

  const selectResult = (result: IUnifiedSearchResult) => {
    if (result.category === 'Actions') {
      const cmd = result.originalData as ICommand;
      cmd.execute();
    } else if (result.category === 'Files') {
      const node = result.originalData as ITreeNode;
      if (node.type === 'file' && node.label.endsWith('.map')) {
        addTab('dialogue-map', node.label, { mapId: node.id });
      } else if (node.type === 'folder') {
        addTab('project-properties', node.label + ' Properties', { projectId: node.id, projectName: node.label });
      }
    } else if (result.category === 'Map Nodes') {
      const rf = (window as any).reactFlowInstance;
      const useMapStore = (window as any).useDialogueMappingStore;
      if (rf && useMapStore) {
        const node = useMapStore.getState().nodes.find((n: any) => n.id === result.id);
        if (node) {
          useMapStore.getState().setSelectedNodeId(node.id);
          // Highlight and center node
          rf.setCenter(
            node.position.x + (node.width || 240) / 2, 
            node.position.y + (node.height || 182) / 2, 
            { zoom: 1.2, duration: 400 }
          );
        }
      }
    }
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        selectResult(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Group results by category for organized rendering
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, IUnifiedSearchResult[]>);

  // Flattened ordered list to map index to correct result items
  const flatGroupedList: IUnifiedSearchResult[] = [];
  const categories: ('Actions' | 'Files' | 'Map Nodes')[] = ['Actions', 'Files', 'Map Nodes'];
  categories.forEach(cat => {
    if (groupedResults[cat]) {
      flatGroupedList.push(...groupedResults[cat]);
    }
  });

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Container */}
      <div className="relative flex items-center">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className="w-full h-7 pl-8 pr-7 bg-secondary/35 border border-border/40 rounded-md text-xs text-foreground placeholder:text-muted-foreground/75 focus:outline-none focus:ring-1.5 focus:ring-primary/40 focus:bg-background/95 focus:border-primary/50 transition-all font-sans"
        />
        {query && (
          <button 
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={11} />
          </button>
        )}
      </div>

      {/* Search Dropdown Panel */}
      {isOpen && query.trim() && (
        <div className="absolute right-0 md:left-0 mt-1.5 w-80 max-h-[380px] bg-popover text-popover-foreground border border-border shadow-lg rounded-lg overflow-hidden flex flex-col z-[100] animate-in fade-in-50 slide-in-from-top-1 duration-100">
          <div className="flex-1 overflow-y-auto py-1">
            {results.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-muted-foreground italic">
                No results found matching "{query}"
              </div>
            ) : (
              categories.map(categoryName => {
                const categoryItems = groupedResults[categoryName];
                if (!categoryItems || categoryItems.length === 0) return null;

                return (
                  <div key={categoryName} className="flex flex-col">
                    {/* Category Header */}
                    <div className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80 bg-muted/40 border-y border-border/20 first:border-t-0">
                      {categoryName}
                    </div>

                    {/* Category Results */}
                    {categoryItems.map(item => {
                      const IconComponent = item.icon;
                      // Find index of this item in the flattened list to see if it is selected
                      const flatIndex = flatGroupedList.findIndex(f => f.id === item.id && f.category === item.category);
                      const isSelected = flatIndex === selectedIndex;

                      return (
                        <div
                          key={`${item.category}-${item.id}`}
                          onClick={() => selectResult(item)}
                          onMouseEnter={() => setSelectedIndex(flatIndex)}
                          className={`px-3 py-2 cursor-pointer flex items-start space-x-2.5 transition-colors border-l-2 ${
                            isSelected 
                              ? 'bg-accent text-accent-foreground border-primary' 
                              : 'border-transparent hover:bg-accent/40'
                          }`}
                        >
                          <div className={`mt-0.5 p-1 rounded bg-muted/50 ${isSelected ? 'bg-background text-primary' : ''}`}>
                            <IconComponent size={12} />
                          </div>
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
          
          {/* Legend/Footer */}
          {results.length > 0 && (
            <div className="px-3 py-1.5 border-t border-border bg-muted/20 flex items-center justify-between text-[9px] text-muted-foreground select-none shrink-0 font-mono">
              <div className="flex space-x-2">
                <span><kbd className="bg-muted px-1 rounded border border-border/60">↑↓</kbd> navigate</span>
                <span><kbd className="bg-muted px-1 rounded border border-border/60">↵</kbd> select</span>
              </div>
              <span>ESC to close</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
