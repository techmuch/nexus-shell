import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  ExternalLink,
  FileText,
  Folder,
  HelpCircle,
  Image as ImageIcon,
  Lightbulb,
  Minus,
  Plus,
  User,
} from 'lucide-react';
import sampleDiagram from './sample_diagram.png';
import type { IbisNodeType, IDialogueNodeData } from '../DialogueMappingService';
import { useModalStore } from '../../../../src/core/services/ModalStoreService';
import { cn } from '../../../../src/lib/cn';

/**
 * What an IBIS node looks like.
 *
 * This renders the *contents* of a node and nothing else — placement, dragging,
 * selection, focus and ports all belong to `GraphNode`, which this sits inside.
 * That split is the point: the card knows about IBIS, the library knows about
 * graphs, and neither has to know the other.
 */

export interface IbisNodeProps {
  type: IbisNodeType;
  data: IDialogueNodeData;
  /** Editing the title, driven by the editor's keyboard cursor. */
  editing?: boolean;
  onTitleChange?: (title: string) => void;
  onEditingChange?: (editing: boolean) => void;
}

interface TypeConfig {
  icon: React.ReactNode;
  label: string;
  /** Ring and text colour when the node is the editor's current selection. */
  accent: string;
  badge: string;
}

export const IBIS_CONFIG: Record<IbisNodeType, TypeConfig> = {
  question: {
    icon: <HelpCircle size={16} className="text-sky-400" />,
    label: 'Question',
    accent: 'text-sky-400',
    badge: 'bg-sky-500/10',
  },
  idea: {
    icon: <Lightbulb size={16} className="text-yellow-400" />,
    label: 'Idea',
    accent: 'text-yellow-400',
    badge: 'bg-yellow-500/10',
  },
  pro: {
    icon: <Plus size={16} className="text-emerald-400" />,
    label: 'Pro',
    accent: 'text-emerald-400',
    badge: 'bg-emerald-500/10',
  },
  con: {
    icon: <Minus size={16} className="text-rose-400" />,
    label: 'Con',
    accent: 'text-rose-400',
    badge: 'bg-rose-500/10',
  },
  note: {
    icon: <FileText size={16} className="text-amber-400" />,
    label: 'Note',
    accent: 'text-amber-400',
    badge: 'bg-amber-500/10',
  },
  decision: {
    icon: <Check size={16} className="text-purple-400" />,
    label: 'Decision',
    accent: 'text-purple-400',
    badge: 'bg-purple-500/10',
  },
  link: {
    icon: <ExternalLink size={16} className="text-teal-400" />,
    label: 'Link',
    accent: 'text-teal-400',
    badge: 'bg-teal-500/10',
  },
  image: {
    icon: <ImageIcon size={16} className="text-pink-400" />,
    label: 'Image',
    accent: 'text-pink-400',
    badge: 'bg-pink-500/10',
  },
  map: {
    icon: <Folder size={16} className="text-indigo-400" />,
    label: 'Map',
    accent: 'text-indigo-400',
    badge: 'bg-indigo-500/10',
  },
};

/** Minimap and palette colours, keyed by IBIS type. */
export const IBIS_COLOURS: Record<IbisNodeType, string> = {
  question: '#0ea5e9',
  idea: '#eab308',
  pro: '#10b981',
  con: '#f43f5e',
  note: '#f59e0b',
  decision: '#a855f7',
  link: '#14b8a6',
  image: '#ec4899',
  map: '#6366f1',
};

export const IbisNode: React.FC<IbisNodeProps> = ({
  type,
  data,
  editing = false,
  onTitleChange,
  onEditingChange,
}) => {
  const config = IBIS_CONFIG[type] ?? IBIS_CONFIG.note;
  const [draft, setDraft] = useState(data.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setDraft(data.title), [data.title]);

  useEffect(() => {
    if (!editing) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editing]);

  const commit = () => {
    onEditingChange?.(false);
    const title = draft.trim();
    if (title && title !== data.title) onTitleChange?.(title);
  };

  return (
    <div className="flex h-full flex-col px-4 py-3" data-ibis-type={type}>
      <header className="mb-2 flex shrink-0 items-center justify-between border-b border-border/40 pb-1.5">
        <div
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider',
            config.badge,
            config.accent,
          )}
        >
          {config.icon}
          {config.label}
        </div>

        {data.status && data.status !== 'pending' && (
          <span
            className={cn(
              'rounded border px-1.5 py-0.5 font-mono text-[9px] font-extrabold uppercase',
              data.status === 'accepted'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-400',
            )}
          >
            {data.status}
          </span>
        )}
      </header>

      <div className="flex min-h-[40px] flex-col justify-center">
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            aria-label="Node title"
            className="w-full rounded border border-border bg-secondary px-1.5 py-1 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              // Stop the editor's own shortcuts from firing while typing.
              e.stopPropagation();
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') {
                setDraft(data.title);
                onEditingChange?.(false);
              }
            }}
          />
        ) : (
          <h4
            onDoubleClick={(e) => {
              e.stopPropagation();
              onEditingChange?.(true);
            }}
            className="cursor-text select-text break-words text-xs font-bold leading-relaxed text-foreground"
            title="Double click to edit title"
          >
            {data.title || 'Untitled Node'}
          </h4>
        )}
      </div>

      {type === 'link' && data.url && (
        <div className="mt-2 truncate text-[10px] text-teal-400">
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

      {type === 'image' && (
        <img
          className="pointer-events-none mt-2 h-24 w-full select-none rounded object-cover"
          src={data.imageUrl || sampleDiagram}
          alt={data.title || 'Image embed'}
        />
      )}

      {type === 'map' && (
        <div className="mt-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              useModalStore
                .getState()
                .openAlert(`Navigating to nested dialogue map: "${data.title || 'Sub-Map'}"…`);
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 py-2 text-[10px] font-bold text-indigo-400 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/25 active:scale-[0.98]"
          >
            <Folder size={11} className="text-indigo-400" />
            Open Dialogue Map
          </button>
        </div>
      )}

      {data.tags && data.tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {data.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-border/60 bg-secondary/80 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <footer className="mt-auto flex items-center justify-between border-t border-border/20 pt-1.5 font-mono text-[9px] text-muted-foreground/80">
        <span className="flex items-center gap-1">
          <User size={10} /> {data.author || 'user'}
        </span>
        <span className="text-[8px] opacity-75">{data.timestamp?.split(',')[0] ?? ''}</span>
      </footer>
    </div>
  );
};
