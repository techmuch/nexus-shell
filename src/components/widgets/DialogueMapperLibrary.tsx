import React from 'react';
import { 
  HelpCircle, 
  Lightbulb, 
  Plus, 
  Minus, 
  FileText, 
  Check, 
  Link2, 
  Image as ImageIcon, 
  Folder,
  ChevronLeft
} from 'lucide-react';
import { IbisNodeType } from '../../core/services/DialogueMappingService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface DialogueMapperLibraryProps {
  onAddNode: (type: IbisNodeType) => void;
  onClose?: () => void;
  className?: string;
  onDragStart?: (event: React.DragEvent<HTMLButtonElement>, type: IbisNodeType) => void;
}

export const DialogueMapperLibrary: React.FC<DialogueMapperLibraryProps> = ({
  onAddNode,
  onClose,
  className,
  onDragStart,
}) => {
  const libraryItems = [
    { type: 'question', label: 'Question / Issue', shortcut: 'Q', desc: 'Define a problem, decision, or query', color: 'bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/15', icon: <HelpCircle size={14} /> },
    { type: 'idea', label: 'Idea / Position', shortcut: 'A', desc: 'Propose a response or solution', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/15', icon: <Lightbulb size={14} /> },
    { type: 'pro', label: 'Pro Argument', shortcut: 'P', desc: 'Supporting argument for an idea', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/15', icon: <Plus size={14} /> },
    { type: 'con', label: 'Con Argument', shortcut: 'C', desc: 'Argument opposing an idea', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/15', icon: <Minus size={14} /> },
    { type: 'note', label: 'Note / Evidence', shortcut: 'N', desc: 'Background fact, URL, or note', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/15', icon: <FileText size={14} /> },
    { type: 'decision', label: 'Decision / Resolve', shortcut: 'D', desc: 'The resolved position / choice', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/15', icon: <Check size={14} /> },
    { type: 'link', label: 'Link / Reference', shortcut: 'L', desc: 'Clickable URL reference card', color: 'bg-teal-500/10 text-teal-400 border-teal-500/30 hover:bg-teal-500/15', icon: <Link2 size={14} /> },
    { type: 'image', label: 'Image / Diagram', shortcut: 'I', desc: 'Embedded image thumbnail card', color: 'bg-pink-500/10 text-pink-400 border-pink-500/30 hover:bg-pink-500/15', icon: <ImageIcon size={14} /> },
    { type: 'map', label: 'Map / Sub-Map', shortcut: 'M', desc: 'Link to another dialogue map', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/15', icon: <Folder size={14} /> },
  ] as const;

  return (
    <aside className={cn("w-64 border-r border-border bg-card/45 flex flex-col shrink-0 overflow-hidden relative z-10 animate-slide-in-left", className)}>
      <div className="p-4 border-b border-border bg-muted/15 flex justify-between items-center shrink-0">
        <span className="text-xs font-extrabold uppercase tracking-wider text-primary font-mono">IBIS Node Library</span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-secondary text-muted-foreground transition-colors"
            title="Hide Sidebar"
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
          Click elements below to add them to your map, then drag handles to link reasoning.
        </p>

        <div className="space-y-2.5">
          {libraryItems.map((item) => (
            <button
              key={item.type}
              draggable
              onDragStart={(e) => onDragStart?.(e, item.type as IbisNodeType)}
              onClick={() => onAddNode(item.type as IbisNodeType)}
              className={cn(
                "w-full text-left p-3 border rounded-xl flex items-start gap-3 transition-all hover:scale-[1.02] shadow-sm hover:shadow-md cursor-pointer",
                item.color
              )}
            >
              <div className="mt-0.5 shrink-0">{item.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-xs font-bold font-mono truncate">{item.label}</h5>
                  <kbd className="px-1.5 py-0.5 text-[9px] font-extrabold bg-background/50 border border-foreground/10 rounded shadow-sm text-foreground/80 font-mono shrink-0">
                    {item.shortcut}
                  </kbd>
                </div>
                <p className="text-[10px] opacity-75 mt-0.5 leading-normal">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default DialogueMapperLibrary;
