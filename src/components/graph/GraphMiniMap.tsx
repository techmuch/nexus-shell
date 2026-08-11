import React, { useCallback, useMemo, useRef } from 'react';
import { cn } from '../../lib/cn';
import {
  centerOn,
  graphBounds,
  nodeRect,
  rectCenter,
  unionRect,
  viewportRect,
  type IGraphNode,
  type IPoint,
  type IRect,
  type IViewport,
} from '../../lib/graph';

export interface GraphMiniMapProps {
  /** The nodes to plot. Only position and size are read. */
  nodes: IGraphNode[];
  /** The canvas's current pan and zoom. */
  viewport: IViewport;
  /**
   * Pixel size of the canvas the minimap mirrors. Get it from `GraphCanvas`'s
   * `onSizeChange`; without it the viewport indicator can't be drawn.
   */
  canvasSize: { width: number; height: number };
  /**
   * Called with a viewport that recentres the canvas. Omit it and the minimap
   * becomes a read-only overview.
   */
  onViewportChange?: (viewport: IViewport) => void;
  /** Minimap width in pixels. Defaults to `180`. */
  width?: number;
  /** Minimap height in pixels. Defaults to `120`. */
  height?: number;
  /**
   * Fill colour for a node, as a CSS colour or Tailwind class. Receives the
   * node, so you can colour by `kind`. Defaults to the muted foreground.
   */
  nodeColor?: (node: IGraphNode) => string;
  /**
   * Highlight these node ids — a selection, or search results. Drawn in the
   * primary colour above the rest.
   */
  highlightIds?: string[];
  /** Padding around the plotted content, in minimap pixels. Defaults to `8`. */
  padding?: number;
  /** How far an arrow key pans, in graph units. Defaults to `80`. */
  panDistance?: number;
  /** Accessible label. Defaults to `"Graph minimap"`. */
  'aria-label'?: string;
  /** Extra classes merged onto the root element. */
  className?: string;
}

/**
 * A scaled overview of the whole graph, with an indicator showing what the
 * canvas is currently looking at.
 *
 * Click anywhere to jump there, drag to pan continuously, or focus it and use
 * the arrow keys. The zoom level is never changed — a minimap answers "where am
 * I", and changing scale on a click makes that answer harder to trust.
 *
 * The plotted extent is the union of the graph's bounds and the current
 * viewport, so the indicator stays visible even when you have panned far away
 * from every node. Without that, panning into empty space makes the minimap
 * appear broken.
 *
 * Fully controlled: it reads `viewport` and reports where you want to go, but
 * never moves the canvas itself.
 *
 * @example
 * ```tsx
 * const [viewport, setViewport] = useState(IDENTITY_VIEWPORT);
 * const [size, setSize] = useState({ width: 0, height: 0 });
 *
 * <GraphCanvas
 *   viewport={viewport}
 *   onViewportChange={setViewport}
 *   onSizeChange={setSize}
 *   overlay={
 *     <GraphMiniMap
 *       nodes={nodes}
 *       viewport={viewport}
 *       canvasSize={size}
 *       onViewportChange={setViewport}
 *       className="absolute bottom-3 right-3"
 *     />
 *   }
 * >
 *   …
 * </GraphCanvas>
 * ```
 */
export const GraphMiniMap = ({
  nodes,
  viewport,
  canvasSize,
  onViewportChange,
  width = 180,
  height = 120,
  nodeColor,
  highlightIds,
  padding = 8,
  panDistance = 80,
  'aria-label': ariaLabel = 'Graph minimap',
  className,
}: GraphMiniMapProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const highlighted = useMemo(() => new Set(highlightIds ?? []), [highlightIds]);

  const visible = viewportRect(viewport, canvasSize);

  /**
   * The extent to plot. Including the viewport keeps the indicator on screen
   * when the canvas has been panned away from every node.
   */
  const extent = useMemo((): IRect => {
    const bounds = graphBounds(nodes);
    if (!bounds) return visible;
    return unionRect(bounds, visible);
    // `visible` is derived from viewport and canvasSize, which are the real
    // inputs; depending on the object identity would recompute every render.
  }, [nodes, visible.x, visible.y, visible.width, visible.height]);

  /** Graph units per minimap pixel, with the same scale on both axes. */
  const scale = Math.min(
    (width - padding * 2) / Math.max(extent.width, 1),
    (height - padding * 2) / Math.max(extent.height, 1),
  );

  // Centre the plotted extent inside the minimap.
  const offset = {
    x: (width - extent.width * scale) / 2 - extent.x * scale,
    y: (height - extent.height * scale) / 2 - extent.y * scale,
  };

  const toMini = (point: IPoint): IPoint => ({
    x: point.x * scale + offset.x,
    y: point.y * scale + offset.y,
  });

  const toGraph = (mini: IPoint): IPoint => ({
    x: (mini.x - offset.x) / scale,
    y: (mini.y - offset.y) / scale,
  });

  const jumpTo = useCallback(
    (client: IPoint) => {
      if (!onViewportChange) return;
      const rect = elementRef.current?.getBoundingClientRect();
      if (!rect) return;

      const point = toGraph({ x: client.x - rect.left, y: client.y - rect.top });
      // Zoom is deliberately preserved: a minimap answers "where", not "how close".
      onViewportChange(centerOn(point, canvasSize, viewport.scale));
    },
    [onViewportChange, canvasSize, viewport.scale, scale, offset.x, offset.y],
  );

  const handlePointerDown = (event: React.PointerEvent) => {
    if (!onViewportChange || event.button !== 0) return;
    event.preventDefault();
    elementRef.current?.focus();

    jumpTo({ x: event.clientX, y: event.clientY });

    const move = (e: PointerEvent) => jumpTo({ x: e.clientX, y: e.clientY });
    const end = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!onViewportChange) return;

    const delta = {
      ArrowUp: { x: 0, y: -panDistance },
      ArrowDown: { x: 0, y: panDistance },
      ArrowLeft: { x: -panDistance, y: 0 },
      ArrowRight: { x: panDistance, y: 0 },
    }[event.key];
    if (!delta) return;

    event.preventDefault();
    const centre = rectCenter(visible);
    onViewportChange(
      centerOn({ x: centre.x + delta.x, y: centre.y + delta.y }, canvasSize, viewport.scale),
    );
  };

  const indicator = {
    x: toMini(visible).x,
    y: toMini(visible).y,
    width: visible.width * scale,
    height: visible.height * scale,
  };

  const interactive = !!onViewportChange;

  return (
    <div
      ref={elementRef}
      role={interactive ? 'slider' : 'img'}
      aria-label={ariaLabel}
      aria-valuetext={
        nodes.length === 0
          ? 'Empty graph'
          : `${nodes.length} nodes, viewing around ${Math.round(rectCenter(visible).x)}, ${Math.round(rectCenter(visible).y)}`
      }
      tabIndex={interactive ? 0 : undefined}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      style={{ width, height }}
      className={cn(
        'rounded-lg border border-border bg-card/90 backdrop-blur-sm shadow-sm overflow-hidden',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        interactive && 'cursor-pointer',
        className,
      )}
    >
      <svg width={width} height={height} className="block">
        {nodes.map((node) => {
          const rect = nodeRect(node);
          const topLeft = toMini(rect);
          const isHighlighted = highlighted.has(node.id);

          return (
            <rect
              key={node.id}
              x={topLeft.x}
              y={topLeft.y}
              // Keep tiny nodes visible when zoomed far out.
              width={Math.max(rect.width * scale, 2)}
              height={Math.max(rect.height * scale, 2)}
              rx={1}
              fill={isHighlighted ? undefined : nodeColor?.(node)}
              className={cn(
                !nodeColor && !isHighlighted && 'fill-muted-foreground/50',
                isHighlighted && 'fill-primary',
              )}
            />
          );
        })}

        {/* The viewport indicator, drawn last so it sits above the nodes. */}
        {canvasSize.width > 0 && (
          <rect
            x={indicator.x}
            y={indicator.y}
            width={Math.max(indicator.width, 4)}
            height={Math.max(indicator.height, 4)}
            rx={2}
            className="fill-primary/10 stroke-primary"
            strokeWidth={1.5}
          />
        )}
      </svg>
    </div>
  );
};
