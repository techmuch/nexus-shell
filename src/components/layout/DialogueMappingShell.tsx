import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { DialogueMappingWidget } from '../widgets/DialogueMappingWidget';
import { ThemeSwitcher } from '../widgets/ThemeSwitcher';
import { DialogueMapperTitle } from '../widgets/DialogueMapperTitle';
import { useDialogueMappingStore } from '../../core/services/DialogueMappingService';
import { useThemeStore } from '../../core/services/ThemeService';
import { 
  Settings, 
  User, 
  Circle,
  Database,
  Grid
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DialogueMappingShell: React.FC = () => {
  const { theme } = useThemeStore();
  const { nodes, edges, selectedNodeId } = useDialogueMappingStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div className={cn(
      "h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground",
      theme === 'dark' ? 'theme-dark' : theme === 'gt' ? 'theme-gt' : 'theme-light'
    )}>
      
      {/* 1. Header Menubar */}
      <header role="banner" aria-label="Dialogue Mapper Menubar" className="h-12 border-b border-border bg-card/65 flex items-center justify-between px-4 shrink-0 select-none backdrop-blur-sm z-30">
        <DialogueMapperTitle />

        {/* Action Menu Options */}
        <nav role="navigation" aria-label="Shell Menus" className="hidden md:flex items-center space-x-4 text-[11px] font-bold text-muted-foreground">
          {['File', 'Edit', 'Layout', 'Argumentation', 'Help'].map((menu) => (
            <button key={menu} className="hover:text-foreground transition-colors cursor-pointer">
              {menu}
            </button>
          ))}
        </nav>

        {/* Right Menu Controls (Theme selector & Profile) */}
        <div className="flex items-center space-x-3 select-none">
          {/* Theme switcher */}
          <ThemeSwitcher />


          <div className="w-7 h-7 rounded-full bg-secondary/80 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <User size={13} />
          </div>
        </div>
      </header>

      {/* 2. Main Canvas Workspace */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        <ReactFlowProvider>
          <DialogueMappingWidget />
        </ReactFlowProvider>
      </div>

      {/* 3. Bottom Status Bar */}
      <footer role="status" aria-label="Dialogue Mapper Status Bar" className="h-7 border-t border-border bg-card flex items-center justify-between px-4 shrink-0 select-none text-[10px] text-muted-foreground/80 font-mono">
        <div className="flex items-center space-x-4">
          {/* Connection state */}
          <span className="flex items-center gap-1.5 font-semibold">
            <Circle size={8} fill="#22c55e" className="text-emerald-500 animate-pulse" />
            Connected
          </span>

          <span className="h-3 w-px bg-border/40" />

          {/* Graph stats */}
          <span className="flex items-center gap-1">
            <Database size={11} /> Nodes: <strong className="text-foreground">{nodes.length}</strong>
          </span>

          <span className="flex items-center gap-1">
            <Grid size={11} /> Links: <strong className="text-foreground">{edges.length}</strong>
          </span>
        </div>

        {/* Selected element details */}
        <div className="flex items-center space-x-3">
          {selectedNode ? (
            <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md max-w-xs truncate">
              Active Node: <strong className="text-foreground font-mono">{selectedNode.data.title}</strong>
            </span>
          ) : (
            <span className="italic text-muted-foreground/60 text-[9px]">Select a node to inspect argumentation logic</span>
          )}

          <span className="h-3 w-px bg-border/40" />

          <button className="hover:text-foreground transition-colors">
            <Settings size={11} />
          </button>
        </div>
      </footer>
    </div>
  );
};
export default DialogueMappingShell;
