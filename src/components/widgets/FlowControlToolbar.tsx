import React from 'react';
import { Hand, MousePointer, GitBranch, Workflow, LayoutGrid, RotateCcw, Sparkles, PanelLeft, PanelRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export interface FlowControlToolbarProps {
  variant?: 'header' | 'floating';
  dragMode?: 'pan' | 'select';
  onDragModeChange?: (mode: 'pan' | 'select') => void;
  autoLayoutMode: 'vertical' | 'horizontal' | 'freeform';
  onAutoLayoutModeChange: (mode: 'vertical' | 'horizontal' | 'freeform') => void;
  onUndo: () => void;
  canUndo?: boolean;
  className?: string;
  isLibraryOpen?: boolean;
  onToggleLibrary?: () => void;
  isInspectorOpen?: boolean;
  onToggleInspector?: () => void;
}

export const FlowControlToolbar: React.FC<FlowControlToolbarProps> = ({
  variant = 'header',
  dragMode,
  onDragModeChange,
  autoLayoutMode,
  onAutoLayoutModeChange,
  onUndo,
  canUndo = false,
  className,
  isLibraryOpen = false,
  onToggleLibrary,
  isInspectorOpen = false,
  onToggleInspector,
}) => {
  if (variant === 'floating') {
    return (
      <div
        className={cn(
          "flex items-center gap-2 bg-card/90 backdrop-blur-sm p-1.5 rounded-lg border border-border shadow-lg select-none text-foreground font-sans",
          className
        )}
      >
        {onDragModeChange && dragMode && (
          <>
            <span className="text-[10px] uppercase font-bold text-muted-foreground px-2 font-mono">Drag Mode:</span>
            <button
              onClick={() => onDragModeChange('pan')}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all border border-transparent active:scale-95",
                dragMode === 'pan'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-accent text-muted-foreground hover:text-foreground"
              )}
              title="Pan Canvas Mode"
            >
              <Hand size={12} />
              <span>Pan</span>
            </button>
            <button
              onClick={() => onDragModeChange('select')}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all border border-transparent active:scale-95",
                dragMode === 'select'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-accent text-muted-foreground hover:text-foreground"
              )}
              title="Box Selection Mode (Drag marquee to multi-select)"
            >
              <MousePointer size={12} />
              <span>Box Select</span>
            </button>
            <div className="w-[1px] h-4 bg-border mx-1" />
          </>
        )}

        <span className="text-[10px] uppercase font-bold text-muted-foreground px-1 font-mono">Layout:</span>
        <button
          onClick={() => onAutoLayoutModeChange('vertical')}
          className={cn(
            "px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all border border-transparent active:scale-95",
            autoLayoutMode === 'vertical'
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-accent text-muted-foreground hover:text-foreground"
          )}
          title="Vertical Flow Layout"
        >
          <GitBranch size={12} />
          <span>Vertical</span>
        </button>
        <button
          onClick={() => onAutoLayoutModeChange('horizontal')}
          className={cn(
            "px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all border border-transparent active:scale-95",
            autoLayoutMode === 'horizontal'
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-accent text-muted-foreground hover:text-foreground"
          )}
          title="Horizontal Flow Layout"
        >
          <Workflow size={12} />
          <span>Horizontal</span>
        </button>
        <button
          onClick={() => onAutoLayoutModeChange('freeform')}
          className={cn(
            "px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all border border-transparent active:scale-95",
            autoLayoutMode === 'freeform'
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-accent text-muted-foreground hover:text-foreground"
          )}
          title="Freeform Layout (Manual)"
        >
          <LayoutGrid size={12} />
          <span>Freeform</span>
        </button>

        <div className="w-[1px] h-4 bg-border mx-1" />
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={cn(
            "p-1.5 rounded border border-transparent transition-all active:scale-95",
            canUndo
              ? "hover:bg-accent text-primary cursor-pointer"
              : "opacity-30 cursor-not-allowed text-muted-foreground"
          )}
          title="Undo Last Move or Layout Action"
        >
          <RotateCcw size={13} />
        </button>
      </div>
    );
  }

  // Header Variant (inline styling for headers)
  return (
    <div className={cn("flex items-center space-x-3 text-foreground font-sans", className)}>
      {onToggleLibrary && (
        <button
          onClick={onToggleLibrary}
          className={cn(
            "p-1.5 rounded flex items-center justify-center transition-colors active:scale-95",
            isLibraryOpen ? "bg-primary/20 text-primary" : "hover:bg-accent text-muted-foreground hover:text-foreground"
          )}
          title="Toggle Node Library"
        >
          <PanelLeft size={16} />
        </button>
      )}


      {onDragModeChange && dragMode && (
        <div className="flex items-center border border-border/80 rounded p-0.5 bg-muted/20">
          <button
            onClick={() => onDragModeChange('pan')}
            className={cn(
              "px-2 py-1 text-[10px] font-bold rounded flex items-center gap-1 transition-all active:scale-95",
              dragMode === 'pan'
                ? "bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-accent text-muted-foreground hover:text-foreground"
            )}
            title="Pan Mode"
          >
            <Hand size={11} /> Pan
          </button>
          <button
            onClick={() => onDragModeChange('select')}
            className={cn(
              "px-2 py-1 text-[10px] font-bold rounded flex items-center gap-1 transition-all active:scale-95",
              dragMode === 'select'
                ? "bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-accent text-muted-foreground hover:text-foreground"
            )}
            title="Box Select Mode"
          >
            <MousePointer size={11} /> Select
          </button>
        </div>
      )}

      <div className="flex items-center border border-border/80 rounded p-0.5 bg-muted/20">
        <button
          onClick={() => onAutoLayoutModeChange('vertical')}
          className={cn(
            "px-2 py-1 text-[10px] font-bold rounded flex items-center gap-1 transition-all active:scale-95",
            autoLayoutMode === 'vertical'
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-accent text-muted-foreground hover:text-foreground"
          )}
          title="Vertical Auto-layout"
        >
          <Sparkles size={11} className={autoLayoutMode === 'vertical' ? "text-primary-foreground" : "text-primary"} /> Vertical
        </button>
        <button
          onClick={() => onAutoLayoutModeChange('horizontal')}
          className={cn(
            "px-2 py-1 text-[10px] font-bold rounded flex items-center gap-1 transition-all active:scale-95",
            autoLayoutMode === 'horizontal'
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-accent text-muted-foreground hover:text-foreground"
          )}
          title="Horizontal Auto-layout"
        >
          Horizontal
        </button>
        <button
          onClick={() => onAutoLayoutModeChange('freeform')}
          className={cn(
            "px-2 py-1 text-[10px] font-bold rounded flex items-center gap-1 transition-all active:scale-95",
            autoLayoutMode === 'freeform'
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-accent text-muted-foreground hover:text-foreground"
          )}
          title="Freeform Manual Layout"
        >
          Freeform
        </button>
      </div>

      {canUndo && (
        <button
          onClick={onUndo}
          className="p-1.5 rounded hover:bg-accent text-foreground border border-border/80 flex items-center gap-1 text-[10px] font-bold transition-all active:scale-95"
          title="Undo Last Move or Layout Action"
        >
          <RotateCcw size={12} /> Undo Layout
        </button>
      )}

      {onToggleInspector && (
        <button
          onClick={onToggleInspector}
          className={cn(
            "p-1.5 rounded flex items-center justify-center transition-colors active:scale-95",
            isInspectorOpen ? "bg-primary/20 text-primary" : "hover:bg-accent text-muted-foreground hover:text-foreground"
          )}
          title="Toggle Argument Inspector"
        >
          <PanelRight size={16} />
        </button>
      )}
    </div>
  );
};
export default FlowControlToolbar;
