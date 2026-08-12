import React from 'react';
import { NodePalette, type PaletteOrientation } from '../../../src/index';
import { IBIS_TYPES, type IbisNodeType } from './DialogueMappingService';
import { IBIS_CONFIG } from './components/IbisNode';
import { cn } from '../../../src/lib/cn';

/**
 * The IBIS node library.
 *
 * The drag-and-drop, the keyboard activation and the layout are all
 * `NodePalette`. What is left here is the part that is actually about IBIS: the
 * nine types, their icons and their shortcut keys.
 */

export interface DialogueMapperLibraryProps {
  onAddNode: (type: IbisNodeType) => void;
  onClose?: () => void;
  className?: string;
  /** Layout axis. Defaults to `"vertical"` — this is a sidebar. */
  orientation?: PaletteOrientation;
}

const SHORTCUTS = new Map(IBIS_TYPES.map(({ value, shortcut }) => [value, shortcut]));

const ITEMS = IBIS_TYPES.map(({ value, label }) => ({
  kind: value,
  label,
  icon: IBIS_CONFIG[value].icon,
  // The tooltip carries the shortcut, so the key is discoverable from the item
  // itself rather than only from documentation.
  description: `${label} — press ${SHORTCUTS.get(value)?.toUpperCase()}`,
}));

export const DialogueMapperLibrary: React.FC<DialogueMapperLibraryProps> = ({
  onAddNode,
  className,
  orientation = 'vertical',
}) => (
  <aside
    className={cn(
      'relative z-10 flex w-64 shrink-0 flex-col overflow-hidden border-r border-border bg-card/45',
      className,
    )}
  >
    <div className="shrink-0 border-b border-border/50 bg-muted/20 p-4">
      <h2 className="text-sm font-semibold tracking-tight">IBIS Node Library</h2>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Drag and drop nodes to build reasoning maps.
      </p>
    </div>

    <div className="min-h-0 flex-1 overflow-y-auto p-3">
      <NodePalette
        items={ITEMS}
        orientation={orientation}
        aria-label="IBIS node library"
        onSelect={(item) => onAddNode(item.kind as IbisNodeType)}
      />
    </div>

    <p className="shrink-0 border-t border-border/40 p-3 text-[10px] leading-relaxed text-muted-foreground/80">
      Click to add at the centre, or drag onto the canvas to place. With a node
      selected, the shortcut key adds a connected child.
    </p>
  </aside>
);

export default DialogueMapperLibrary;
