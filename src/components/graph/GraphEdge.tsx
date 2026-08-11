import React from 'react';
import { cn } from '../../lib/cn';
import {
  nodeRect,
  portPoint,
  resolvePorts,
  type GraphPort,
  type IGraphEdge,
  type IGraphNode,
  type IPoint,
} from '../../lib/graph';

/**
 * How an edge gets from one node to the other.
 *
 * - `bezier` — a smooth curve. The default; reads well for dense graphs.
 * - `smoothstep` — right angles with rounded corners, for flowcharts.
 * - `straight` — a direct line.
 */
export type EdgeRouting = 'bezier' | 'smoothstep' | 'straight';

export interface GraphEdgeProps {
  /** The edge to render. */
  edge: IGraphEdge;
  /** The node the edge leaves. */
  source: IGraphNode;
  /** The node the edge enters. */
  target: IGraphNode;
  /** Path shape. Defaults to `"bezier"`. */
  routing?: EdgeRouting;
  /** Draw as selected. */
  selected?: boolean;
  /** Draw an arrowhead at the target end. Defaults to `true`. */
  arrow?: boolean;
  /** Called on click. The wide invisible hit area makes this practical. */
  onSelect?: (id: string, event: React.MouseEvent) => void;
  /** Called on right-click, with the client point for a context menu. */
  onContextMenu?: (id: string, point: IPoint, event: React.MouseEvent) => void;
  /** Extra classes merged onto the visible path. */
  className?: string;
}

/** The SVG path for a pair of points and the sides they leave from. */
export const edgePath = (
  from: IPoint,
  to: IPoint,
  fromPort: GraphPort,
  routing: EdgeRouting,
): string => {
  if (routing === 'straight') {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }

  const horizontal = fromPort === 'left' || fromPort === 'right';

  if (routing === 'smoothstep') {
    const mid = horizontal ? (from.x + to.x) / 2 : (from.y + to.y) / 2;
    return horizontal
      ? `M ${from.x} ${from.y} L ${mid} ${from.y} L ${mid} ${to.y} L ${to.x} ${to.y}`
      : `M ${from.x} ${from.y} L ${from.x} ${mid} L ${to.x} ${mid} L ${to.x} ${to.y}`;
  }

  // Bezier: control points pushed out along the leaving axis, scaled by the
  // span so short edges don't loop and long ones don't go flat.
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const offset = Math.min(Math.max(distance / 2, 24), 160);

  const c1 = horizontal
    ? { x: from.x + (fromPort === 'right' ? offset : -offset), y: from.y }
    : { x: from.x, y: from.y + (fromPort === 'bottom' ? offset : -offset) };
  const c2 = horizontal
    ? { x: to.x - (fromPort === 'right' ? offset : -offset), y: to.y }
    : { x: to.x, y: to.y - (fromPort === 'bottom' ? offset : -offset) };

  return `M ${from.x} ${from.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${to.x} ${to.y}`;
};

/**
 * A directed edge between two nodes, rendered as an SVG path.
 *
 * Which sides the edge leaves and enters is worked out from the nodes'
 * relative positions, so a node needs no handle configuration to be
 * connectable — move a node and the attachment points follow.
 *
 * Render inside {@link GraphEdgeLayer}, which provides the SVG surface and the
 * arrowhead marker.
 *
 * @example
 * ```tsx
 * <GraphEdgeLayer>
 *   {edges.map((edge) => (
 *     <GraphEdge
 *       key={edge.id}
 *       edge={edge}
 *       source={byId[edge.source]}
 *       target={byId[edge.target]}
 *       onSelect={setSelectedEdge}
 *     />
 *   ))}
 * </GraphEdgeLayer>
 * ```
 */
export const GraphEdge = ({
  edge,
  source,
  target,
  routing = 'bezier',
  selected = false,
  arrow = true,
  onSelect,
  onContextMenu,
  className,
}: GraphEdgeProps) => {
  const fromRect = nodeRect(source);
  const toRect = nodeRect(target);
  const sides = resolvePorts(fromRect, toRect);

  const from = portPoint(fromRect, sides.source);
  const to = portPoint(toRect, sides.target);
  const path = edgePath(from, to, sides.source, routing);

  const midpoint = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const interactive = !!(onSelect || onContextMenu);

  return (
    <g
      data-graph-edge={edge.id}
      className={cn(interactive && 'cursor-pointer')}
      onClick={(e) => {
        if (!onSelect) return;
        e.stopPropagation();
        onSelect(edge.id, e);
      }}
      onContextMenu={(e) => {
        if (!onContextMenu) return;
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(edge.id, { x: e.clientX, y: e.clientY }, e);
      }}
    >
      {/* A wide transparent path so a 2px line is actually clickable. */}
      {interactive && (
        <path d={path} fill="none" stroke="transparent" strokeWidth={16} />
      )}

      <path
        d={path}
        fill="none"
        strokeWidth={selected ? 2.5 : 1.5}
        markerEnd={arrow ? 'url(#nexus-graph-arrow)' : undefined}
        className={cn(
          'transition-[stroke]',
          selected ? 'stroke-primary' : 'stroke-border',
          className,
        )}
      />

      {edge.label && (
        <text
          x={midpoint.x}
          y={midpoint.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-muted-foreground text-[10px] font-medium select-none"
          // Painted over the line; a halo keeps it legible without a rect.
          style={{ paintOrder: 'stroke', stroke: 'hsl(var(--background))', strokeWidth: 4 }}
        >
          {edge.label}
        </text>
      )}
    </g>
  );
};

export interface GraphEdgeLayerProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * The SVG surface edges are drawn on.
 *
 * Sits beneath the nodes inside a {@link GraphCanvas}, spanning an effectively
 * unbounded area so edges remain visible wherever the graph is panned. It also
 * defines the shared arrowhead marker.
 */
export const GraphEdgeLayer = ({ children, className }: GraphEdgeLayerProps) => (
  <svg
    // Offset by half the span so the origin sits at the middle: SVG cannot
    // render negative coordinates outside its viewport, and graph space is
    // unbounded in every direction.
    style={{ position: 'absolute', left: -50000, top: -50000, overflow: 'visible' }}
    width={100000}
    height={100000}
    viewBox="-50000 -50000 100000 100000"
    className={cn('pointer-events-none [&_g]:pointer-events-auto', className)}
  >
    <defs>
      <marker
        id="nexus-graph-arrow"
        viewBox="0 0 10 10"
        refX={9}
        refY={5}
        markerWidth={6}
        markerHeight={6}
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" className="fill-border" />
      </marker>
    </defs>
    {children}
  </svg>
);
