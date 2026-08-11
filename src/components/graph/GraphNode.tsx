import React, { useRef, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import {
  DEFAULT_NODE_SIZE,
  type GraphPort,
  type IGraphNode,
  type IPoint,
} from '../../lib/graph';

const PORTS: GraphPort[] = ['top', 'right', 'bottom', 'left'];

const PORT_CLASS: Record<GraphPort, string> = {
  top: 'left-1/2 -translate-x-1/2 -top-1.5',
  bottom: 'left-1/2 -translate-x-1/2 -bottom-1.5',
  left: 'top-1/2 -translate-y-1/2 -left-1.5',
  right: 'top-1/2 -translate-y-1/2 -right-1.5',
};

export interface GraphNodeProps {
  /** The node to render. Position and size come from here. */
  node: IGraphNode;
  /** Node body. Anything — a label, a form, a chart. */
  children?: ReactNode;
  /**
   * Called with the new top-left position while dragging, and again on
   * release. The component never mutates the node — you apply the move, which
   * is what lets you snap, constrain or reject it.
   */
  onMove?: (id: string, position: IPoint) => void;
  /** Called when the drag ends, if the node actually moved. */
  onMoveEnd?: (id: string, position: IPoint) => void;
  /** Called on click. */
  onSelect?: (id: string, event: React.MouseEvent) => void;
  /** Called on double-click. Conventionally enters edit mode. */
  onActivate?: (id: string) => void;
  /** Called on right-click, with the client point for a context menu. */
  onContextMenu?: (id: string, point: IPoint, event: React.MouseEvent) => void;
  /**
   * Called when one of the node's ports is dragged, to begin a connection.
   * Providing it is what makes the ports appear.
   */
  onConnectStart?: (id: string, port: GraphPort) => void;
  /**
   * Called when a pointer is released over this node, with its id — the target
   * end of a connection started elsewhere.
   */
  onConnectEnd?: (targetId: string) => void;
  /** Draw as selected. */
  selected?: boolean;
  /**
   * Draw as focused — the keyboard cursor. Distinct from `selected`: focus is
   * where the next keystroke lands, selection is what an action applies to.
   */
  focused?: boolean;
  /** Show connection ports on hover and while focused. Defaults to `true`. */
  ports?: boolean;
  /** Allow dragging. Defaults to `true`. */
  draggable?: boolean;
  /** Extra classes merged onto the node element. */
  className?: string;
}

/**
 * A positioned, focusable node on a {@link GraphCanvas}.
 *
 * Provides placement, dragging, selection and focus affordances, and the four
 * edge ports. What the node *contains* is entirely yours — pass any children.
 *
 * Fully controlled: dragging reports positions through `onMove` but never moves
 * the node itself, so snapping, constraints and undo stay in your hands.
 *
 * @example
 * ```tsx
 * <GraphNode
 *   node={node}
 *   focused={node.id === focusedId}
 *   onMove={(id, position) => setNodes(move(nodes, id, position))}
 *   onActivate={(id) => setEditing(id)}
 * >
 *   <p className="text-xs font-medium">{node.data.label}</p>
 * </GraphNode>
 * ```
 */
export const GraphNode = ({
  node,
  children,
  onMove,
  onMoveEnd,
  onSelect,
  onActivate,
  onContextMenu,
  onConnectStart,
  onConnectEnd,
  selected = false,
  focused = false,
  ports = true,
  draggable = true,
  className,
}: GraphNodeProps) => {
  const moved = useRef(false);

  const width = node.size?.width ?? DEFAULT_NODE_SIZE.width;
  const height = node.size?.height ?? DEFAULT_NODE_SIZE.height;

  const handlePointerDown = (event: React.PointerEvent) => {
    if (!draggable || !onMove || event.button !== 0) return;
    // Space-drag pans the canvas; let it through.
    if ((event.nativeEvent as PointerEvent & { shiftKey: boolean }).shiftKey) return;

    event.stopPropagation();
    moved.current = false;

    const start = { x: event.clientX, y: event.clientY };
    const origin = { ...node.position };
    // Read the canvas scale off the transformed parent so a drag tracks the
    // cursor exactly at any zoom level.
    const scale = readScale(event.currentTarget as HTMLElement);

    let latest = origin;

    const move = (e: PointerEvent) => {
      const dx = (e.clientX - start.x) / scale;
      const dy = (e.clientY - start.y) / scale;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) moved.current = true;
      latest = { x: origin.x + dx, y: origin.y + dy };
      onMove(node.id, latest);
    };

    const end = () => {
      if (moved.current) onMoveEnd?.(node.id, latest);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
  };

  return (
    <div
      data-graph-node={node.id}
      role="button"
      tabIndex={-1}
      aria-pressed={selected}
      style={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
        width,
        height,
      }}
      onPointerDown={handlePointerDown}
      onClick={(e) => {
        e.stopPropagation();
        // Suppress the click that ends a drag.
        if (!moved.current) onSelect?.(node.id, e);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onActivate?.(node.id);
      }}
      onContextMenu={(e) => {
        if (!onContextMenu) return;
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(node.id, { x: e.clientX, y: e.clientY }, e);
      }}
      onPointerUp={() => onConnectEnd?.(node.id)}
      className={cn(
        'group rounded-lg border bg-card text-card-foreground shadow-sm select-none',
        'flex flex-col overflow-hidden transition-shadow',
        draggable && onMove && 'cursor-grab active:cursor-grabbing',
        selected ? 'border-primary shadow-md' : 'border-border',
        // Focus is the keyboard cursor: it must be visible even when the node
        // is also selected, so it gets a ring rather than a border change.
        focused && 'ring-2 ring-ring ring-offset-1 ring-offset-background',
        className,
      )}
    >
      {children}

      {ports &&
        onConnectStart &&
        PORTS.map((port) => (
          <button
            key={port}
            type="button"
            tabIndex={-1}
            aria-label={`Connect from ${port}`}
            onPointerDown={(e) => {
              e.stopPropagation();
              onConnectStart(node.id, port);
            }}
            className={cn(
              'absolute w-3 h-3 rounded-full border-2 border-background bg-primary',
              'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity',
              focused && 'opacity-100',
              PORT_CLASS[port],
            )}
          />
        ))}
    </div>
  );
};

/**
 * Recover the canvas zoom from the nearest ancestor carrying a scale
 * transform. Reading it here keeps `GraphNode` usable without a context, so it
 * can be dropped into any transformed container.
 */
const readScale = (element: HTMLElement): number => {
  let current: HTMLElement | null = element.parentElement;

  while (current) {
    const transform = window.getComputedStyle(current).transform;
    if (transform && transform !== 'none') {
      const match = /matrix\(([^,]+),/.exec(transform);
      const scale = match ? parseFloat(match[1]) : NaN;
      if (Number.isFinite(scale) && scale !== 0) return scale;
    }
    current = current.parentElement;
  }
  return 1;
};
