import React from 'react';
import { Hand, MousePointer, GitBranch, Workflow, LayoutGrid, RotateCcw, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export interface FlowControlToolbarProps {
  variant?: 'header' | 'floating';
  dragMode?: 'pan' | 'select';
  onDragModeChange?: (mode: 'pan' | 'select') => void;
  onLayoutChange: (direction: 'vertical' | 'horizontal' | 'grid') => void;
  onUndo: () => void;
  canUndo?: boolean;
  title?: string;
  className?: string;
}

export const FlowControlToolbar: React.FC<FlowControlToolbarProps> = ({
  variant = 'header',
  dragMode,
  onDragModeChange,
  onLayoutChange,
  onUndo,
  canUndo = false,
  title = 'Workspace',
  className,
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
          onClick={() => onLayoutChange('horizontal')}
          className="px-2.5 py-1 rounded hover:bg-accent text-foreground text-xs font-semibold border border-transparent flex items-center gap-1.5 transition-all active:scale-95 hover:text-primary"
          title="Horizontal Flow Layout"
        >
          <Workflow size={12} />
          <span>Horizontal</span>
        </button>
        <button
          onClick={() => onLayoutChange('vertical')}
          className="px-2.5 py-1 rounded hover:bg-accent text-foreground text-xs font-semibold border border-transparent flex items-center gap-1.5 transition-all active:scale-95 hover:text-primary"
          title="Vertical Flow Layout"
        >
          <GitBranch size={12} />
          <span>Vertical</span>
        </button>
        <button
          onClick={() => onLayoutChange('grid')}
          className="px-2.5 py-1 rounded hover:bg-accent text-foreground text-xs font-semibold border border-transparent flex items-center gap-1.5 transition-all active:scale-95 hover:text-primary"
          title="Grid Dashboard Layout"
        >
          <LayoutGrid size={12} />
          <span>Grid</span>
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
      {title && (
        <span className="text-xs font-extrabold uppercase font-mono tracking-widest text-primary mr-2">
          {title}
        </span>
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
          onClick={() => onLayoutChange('vertical')}
          className="px-2 py-1 text-[10px] font-bold hover:bg-accent rounded text-muted-foreground hover:text-foreground flex items-center gap-1 transition-all active:scale-95"
          title="Vertical layout"
        >
          <Sparkles size={11} className="text-primary" /> Vertical Tree
        </button>
        <button
          onClick={() => onLayoutChange('horizontal')}
          className="px-2 py-1 text-[10px] font-bold hover:bg-accent rounded text-muted-foreground hover:text-foreground flex items-center gap-1 transition-all active:scale-95"
          title="Horizontal flow layout"
        >
          Horizontal Flow
        </button>
        <button
          onClick={() => onLayoutChange('grid')}
          className="px-2 py-1 text-[10px] font-bold hover:bg-accent rounded text-muted-foreground hover:text-foreground flex items-center gap-1 transition-all active:scale-95"
          title="Grid layout"
        >
          Grid layout
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
    </div>
  );
};
export default FlowControlToolbar;
