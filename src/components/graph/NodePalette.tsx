import React, { type ReactNode } from 'react';
import { cn } from '../../lib/cn';

/** The MIME type palette entries put their kind on during a drag. */
export const GRAPH_NODE_MIME = 'application/x-nexus-graph-node';

/** An entry in a {@link NodePalette}. */
export interface INodePaletteItem {
  /**
   * The `kind` given to the node this creates. Also the payload carried on the
   * drag, so the drop handler knows what was dragged.
   */
  kind: string;
  /** Label shown in the palette. */
  label: string;
  /** Optional icon or swatch rendered before the label. */
  icon?: ReactNode;
  /** One line explaining what the node is, shown as a tooltip. */
  description?: string;
}

export interface NodePaletteProps {
  /** The node types on offer. */
  items: INodePaletteItem[];
  /**
   * Called when an item is activated by click or Enter, for creating without a
   * drag. Keyboard users need this — a drag-only palette is unreachable.
   */
  onSelect?: (item: INodePaletteItem) => void;
  /** Called when a drag starts, if you want to show a drop hint. */
  onDragStart?: (item: INodePaletteItem) => void;
  /** Stack vertically instead of wrapping horizontally. Defaults to `false`. */
  vertical?: boolean;
  /** Extra classes merged onto the root element. */
  className?: string;
  /** Accessible label for the group. Defaults to `"Node palette"`. */
  'aria-label'?: string;
}

/**
 * A palette of node types that can be dragged onto a {@link GraphCanvas}, or
 * activated with the keyboard.
 *
 * The palette carries only the item's `kind` on the drag; what a node of that
 * kind actually *is* is decided by your drop handler. Pair it with
 * {@link readPaletteDrag} on the canvas.
 *
 * Every item is a real button, so the palette is fully usable without a
 * pointer — `onSelect` fires on click or Enter.
 *
 * @example
 * ```tsx
 * <GraphCanvas
 *   onDrop={(point, event) => {
 *     const kind = readPaletteDrag(event);
 *     if (kind) addNode({ kind, position: point });
 *   }}
 *   overlay={
 *     <NodePalette
 *       items={[{ kind: 'task', label: 'Task' }, { kind: 'gate', label: 'Gate' }]}
 *       onSelect={(item) => addNodeAtCentre(item.kind)}
 *     />
 *   }
 * />
 * ```
 */
export const NodePalette = ({
  items,
  onSelect,
  onDragStart,
  vertical = false,
  className,
  'aria-label': ariaLabel = 'Node palette',
}: NodePaletteProps) => (
  <div
    role="toolbar"
    aria-label={ariaLabel}
    aria-orientation={vertical ? 'vertical' : 'horizontal'}
    className={cn(
      'flex gap-1.5 p-1.5 rounded-lg border border-border bg-card/90 backdrop-blur-sm shadow-sm',
      vertical ? 'flex-col' : 'flex-wrap items-center',
      className,
    )}
  >
    {items.map((item) => (
      <button
        key={item.kind}
        type="button"
        draggable
        title={item.description}
        onDragStart={(event) => {
          event.dataTransfer.setData(GRAPH_NODE_MIME, item.kind);
          // Plain text too, so a drop onto an editor or another app degrades
          // to something meaningful rather than nothing.
          event.dataTransfer.setData('text/plain', item.label);
          event.dataTransfer.effectAllowed = 'copy';
          onDragStart?.(item);
        }}
        onClick={() => onSelect?.(item)}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium',
          'border border-border bg-background text-foreground',
          'hover:bg-accent hover:text-accent-foreground transition-colors',
          'cursor-grab active:cursor-grabbing',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        {item.icon}
        {item.label}
      </button>
    ))}
  </div>
);

/**
 * Read the node kind from a drop on the canvas, or `null` if the drag did not
 * come from a {@link NodePalette}.
 *
 * @example
 * ```tsx
 * <GraphCanvas onDrop={(point, event) => {
 *   const kind = readPaletteDrag(event);
 *   if (kind) createNode(kind, point);
 * }} />
 * ```
 */
export const readPaletteDrag = (event: React.DragEvent): string | null =>
  event.dataTransfer.getData(GRAPH_NODE_MIME) || null;
