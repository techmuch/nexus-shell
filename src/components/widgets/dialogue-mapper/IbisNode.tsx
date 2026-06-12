import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  HelpCircle, 
  Lightbulb, 
  Plus, 
  Minus, 
  FileText, 
  Check, 
  User,
  Link2,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import sampleDiagram from './sample_diagram.png';
import { useDialogueMappingStore, IDialogueNodeData, IbisNodeType } from '../../../core/services/DialogueMappingService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const IbisNode: React.FC<NodeProps<IDialogueNodeData>> = ({ data, selected }) => {
  const updateNodeData = useDialogueMappingStore((state) => state.updateNodeData);
  const selectedNodeId = useDialogueMappingStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useDialogueMappingStore((state) => state.setSelectedNodeId);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(data.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditTitle(data.title);
  }, [data.title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editTitle.trim() && editTitle !== data.title) {
      updateNodeData(data.id, { title: editTitle.trim() });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditTitle(data.title);
      setIsEditing(false);
    }
  };

  const handleNodeClick = () => {
    setSelectedNodeId(data.id);
  };

  // Node configurations based on IBIS Type
  const nodeConfigs: Record<IbisNodeType, {
    colorClass: string;
    icon: React.ReactNode;
    bgClass: string;
    label: string;
  }> = {
    question: {
      colorClass: 'border-sky-500 text-sky-400 shadow-sky-500/10',
      icon: <HelpCircle size={16} className="text-sky-400" />,
      bgClass: 'bg-sky-500/5',
      label: 'Question',
    },
    idea: {
      colorClass: 'border-indigo-500 text-indigo-400 shadow-indigo-500/10',
      icon: <Lightbulb size={16} className="text-indigo-400" />,
      bgClass: 'bg-indigo-500/5',
      label: 'Idea',
    },
    pro: {
      colorClass: 'border-emerald-500 text-emerald-400 shadow-emerald-500/10',
      icon: <Plus size={16} className="text-emerald-400" />,
      bgClass: 'bg-emerald-500/5',
      label: 'Pro',
    },
    con: {
      colorClass: 'border-rose-500 text-rose-400 shadow-rose-500/10',
      icon: <Minus size={16} className="text-rose-400" />,
      bgClass: 'bg-rose-500/5',
      label: 'Con',
    },
    note: {
      colorClass: 'border-amber-500 text-amber-400 shadow-amber-500/10',
      icon: <FileText size={16} className="text-amber-400" />,
      bgClass: 'bg-amber-500/5',
      label: 'Note',
    },
    decision: {
      colorClass: 'border-yellow-500 text-yellow-400 shadow-yellow-500/20 ring-1 ring-yellow-500/30',
      icon: <Check size={16} className="text-yellow-400" />,
      bgClass: 'bg-yellow-500/10',
      label: 'Decision',
    },
    link: {
      colorClass: 'border-teal-500 text-teal-400 shadow-teal-500/10',
      icon: <Link2 size={16} className="text-teal-400" />,
      bgClass: 'bg-teal-500/5',
      label: 'Link',
    },
    image: {
      colorClass: 'border-pink-500 text-pink-400 shadow-pink-500/10',
      icon: <ImageIcon size={16} className="text-pink-400" />,
      bgClass: 'bg-pink-500/5',
      label: 'Image',
    },
  };

  const config = nodeConfigs[data.type] || nodeConfigs.note;

  // Active highlighted style if node is selected locally
  const isStoreSelected = selectedNodeId === data.id;

  return (
    <div
      onClick={handleNodeClick}
      className={cn(
        "px-4 py-3 border rounded-xl shadow-lg w-[240px] transition-all select-none bg-card/90 backdrop-blur-sm relative",
        config.colorClass,
        (selected || isStoreSelected) ? "ring-2 ring-primary scale-[1.02] shadow-primary/10 border-primary" : "hover:border-border/80 hover:shadow-xl"
      )}
    >
      {/* Target handle on top */}
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ background: '#64748b', width: 8, height: 8 }} 
      />

      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-border/40 pb-1.5 mb-2 shrink-0">
        <div className={cn("flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded-full", config.bgClass)}>
          {config.icon}
          {config.label}
        </div>
        
        {data.status && data.status !== 'pending' && (
          <span className={cn(
            "text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded font-mono border",
            data.status === 'accepted' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30"
          )}>
            {data.status}
          </span>
        )}
      </div>

      {/* Title / Description Text */}
      <div className="min-h-[40px] flex flex-col justify-center">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-secondary border border-border rounded px-1.5 py-1 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <h4
            onDoubleClick={handleDoubleClick}
            className="text-xs font-bold text-foreground leading-relaxed cursor-text break-words select-text"
            title="Double click to edit title"
          >
            {data.title || 'Untitled Node'}
          </h4>
        )}
      </div>

      {/* Link / Image Content */}
      {data.type === 'link' && data.url && (
        <div className="mt-2 text-[10px] text-teal-400 hover:text-teal-300 truncate">
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 hover:underline"
          >
            <ExternalLink size={10} className="shrink-0" />
            <span className="truncate">{data.url}</span>
          </a>
        </div>
      )}

      {data.type === 'image' && (
        <img
          className="w-full h-24 object-cover rounded mt-2 select-none pointer-events-none"
          src={data.imageUrl || sampleDiagram}
          alt={data.title || 'Image Embed'}
        />
      )}

      {/* Node Metadata Tags */}
      {data.tags && data.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5">
          {data.tags.map((tag) => (
            <span 
              key={tag} 
              className="text-[9px] bg-secondary/80 text-muted-foreground border border-border/60 px-1.5 py-0.5 rounded-md font-mono"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Node Footer Info (Author) */}
      <div className="flex justify-between items-center mt-3 pt-1.5 border-t border-border/20 text-[9px] text-muted-foreground/80 font-mono">
        <span className="flex items-center gap-1">
          <User size={10} /> {data.author || 'user'}
        </span>
        <span className="text-[8px] opacity-75">
          {data.timestamp ? data.timestamp.split(',')[0] : ''}
        </span>
      </div>

      {/* Source handle on bottom */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ background: '#64748b', width: 8, height: 8 }} 
      />
    </div>
  );
};
