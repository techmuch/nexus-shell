import React from 'react';
import { 
  MousePointer, 
  Pencil, 
  Square, 
  Circle, 
  MoveRight, 
  MessageSquare, 
  Eraser, 
  Trash2, 
  Undo 
} from 'lucide-react';
import { useMockupReviewStore } from '../../../core/services/MockupReviewService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ReviewToolbarProps {
  tool: 'select' | 'pen' | 'rect' | 'circle' | 'arrow' | 'comment' | 'eraser';
  setTool: (t: 'select' | 'pen' | 'rect' | 'circle' | 'arrow' | 'comment' | 'eraser') => void;
  color: string;
  setColor: (c: string) => void;
  selectedAnnotationId: string | null;
  setSelectedAnnotationId: (id: string | null) => void;
}

export const ReviewToolbar: React.FC<ReviewToolbarProps> = ({
  tool,
  setTool,
  color,
  setColor,
  selectedAnnotationId,
  setSelectedAnnotationId,
}) => {
  const {
    views,
    activeViewId,
    deleteAnnotation,
    undoAnnotation,
  } = useMockupReviewStore();

  const activeView = views.find((v) => v.id === activeViewId) || null;
  const activeVersion = activeView
    ? activeView.versions.find((v) => v.id === activeView.activeVersionId) || null
    : null;

  return (
    <div className="flex items-center justify-between p-2.5 border-b border-border bg-card shrink-0 select-none">
      <div className="flex items-center space-x-1.5">
        {[
          { id: 'select', icon: <MousePointer size={14} />, label: 'Interact' },
          { id: 'pen', icon: <Pencil size={14} />, label: 'Draw' },
          { id: 'rect', icon: <Square size={14} />, label: 'Box' },
          { id: 'circle', icon: <Circle size={14} />, label: 'Circle' },
          { id: 'arrow', icon: <MoveRight size={14} />, label: 'Arrow' },
          { id: 'comment', icon: <MessageSquare size={14} />, label: 'Comment' },
          { id: 'eraser', icon: <Eraser size={14} />, label: 'Eraser' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTool(item.id as any)}
            className={cn(
              "px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 border border-transparent transition-all",
              tool === item.id 
                ? "bg-primary text-primary-foreground shadow" 
                : "hover:bg-accent text-muted-foreground hover:text-foreground"
            )}
            title={item.label}
          >
            {item.icon} <span className="hidden sm:inline">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Color Picker & Draw States */}
      <div className="flex items-center space-x-3">
        {tool !== 'select' && tool !== 'eraser' && (
          <div className="flex items-center space-x-1 border rounded px-1.5 py-1 bg-muted/10">
            {['#ef4444', '#eab308', '#22c55e', '#3b82f6'].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  "w-4 h-4 rounded-full border border-black/10 transition-transform",
                  color === c ? "scale-125 ring-1 ring-ring" : "opacity-80 hover:opacity-100"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}
        {activeView && activeVersion && (
          <>
            {/* Clear Canvas */}
            <button
              onClick={() => {
                if (window.confirm("Clear all drawings from this revision?")) {
                  activeVersion.annotations
                    .filter((a) => a.type !== 'comment')
                    .forEach((a) => deleteAnnotation(activeView.id, activeVersion.id, a.id));
                  setSelectedAnnotationId(null);
                }
              }}
              className="p-1 rounded hover:bg-destructive/10 text-destructive text-[11px] font-semibold border border-transparent"
            >
              Clear Canvas
            </button>

            {/* Selection and Undo tools */}
            <div className="flex items-center space-x-1 border-l pl-3 border-border">
              {selectedAnnotationId && (
                <button
                  onClick={() => {
                    deleteAnnotation(activeView.id, activeVersion.id, selectedAnnotationId);
                    setSelectedAnnotationId(null);
                  }}
                  className="p-1.5 rounded hover:bg-destructive/10 text-destructive text-[11px] font-semibold flex items-center gap-1 border border-transparent transition-colors"
                  title="Delete selected markup (Delete / Backspace)"
                >
                  <Trash2 size={13} />
                  <span className="hidden sm:inline">Delete Markup</span>
                </button>
              )}

              <button
                onClick={() => {
                  undoAnnotation(activeView.id, activeVersion.id);
                  setSelectedAnnotationId(null);
                }}
                disabled={activeVersion.annotations.length === 0}
                className={cn(
                  "p-1.5 rounded text-[11px] font-semibold flex items-center gap-1 border border-transparent transition-colors",
                  activeVersion.annotations.length === 0
                    ? "opacity-40 cursor-not-allowed text-muted-foreground"
                    : "hover:bg-accent text-foreground"
                )}
                title="Undo last annotation (Control+Z)"
              >
                <Undo size={13} />
                <span className="hidden sm:inline">Undo</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
