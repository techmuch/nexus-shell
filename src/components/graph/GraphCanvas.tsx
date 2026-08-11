import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import {
  IDENTITY_VIEWPORT,
  clampScale,
  fitViewport,
  toGraphSpace,
  zoomAt,
  type IGraphNode,
  type IPoint,
  type IViewport,
} from '../../lib/graph';

export interface GraphCanvasHandle {
  /** Current pan and zoom. */
  getViewport: () => IViewport;
  /** Jump to a viewport. */
  setViewport: (viewport: IViewport) => void;
  /** Frame the given nodes, or clear the viewport when the list is empty. */
  fitTo: (nodes: IGraphNode[], padding?: number) => void;
  /** Multiply the zoom about the centre of the element. */
  zoomBy: (factor: number) => void;
  /** Convert a client (page) point into graph space. */
  clientToGraph: (client: IPoint) => IPoint;
  /** Move keyboard focus to the canvas. */
  focus: () => void;
}

export interface GraphCanvasProps {
  /**
   * Content rendered in graph space. Position children with `GraphNode`, or
   * with your own absolutely-positioned elements in graph coordinates.
   */
  children?: ReactNode;
  /**
   * Content rendered in screen space, above the graph and unaffected by pan or
   * zoom — toolbars, a minimap, a legend.
   */
  overlay?: ReactNode;
  /**
   * Take control of pan and zoom. Omit it and the canvas manages its own,
   * which is what most callers want: you should not have to own a viewport
   * just to draw a graph.
   */
  viewport?: IViewport;
  /** Starting viewport when uncontrolled. Defaults to origin at 1× zoom. */
  defaultViewport?: IViewport;
  /** Called whenever pan or zoom changes, controlled or not. */
  onViewportChange?: (viewport: IViewport) => void;
  /**
   * Called with a graph-space point when empty canvas is clicked. Use it to
   * clear selection, or to place a node at the click.
   */
  onCanvasClick?: (point: IPoint, event: React.MouseEvent) => void;
  /** Called with a graph-space point when empty canvas is double-clicked. */
  onCanvasDoubleClick?: (point: IPoint, event: React.MouseEvent) => void;
  /** Called with a graph-space point on right-click of empty canvas. */
  onCanvasContextMenu?: (point: IPoint, event: React.MouseEvent) => void;
  /**
   * Called when something is dropped on the canvas, with the graph-space point
   * under the cursor. Pair with `NodePalette` for drag-to-create.
   */
  onDrop?: (point: IPoint, event: React.DragEvent) => void;
  /** Show the dot grid. Defaults to `true`. */
  grid?: boolean;
  /** Grid spacing in graph units. Defaults to `24`. */
  gridSize?: number;
  /** Smallest allowed zoom. Defaults to `0.1`. */
  minScale?: number;
  /** Largest allowed zoom. Defaults to `4`. */
  maxScale?: number;
  /** Allow panning by dragging empty canvas. Defaults to `true`. */
  pannable?: boolean;
  /** Allow zooming with the wheel or trackpad pinch. Defaults to `true`. */
  zoomable?: boolean;
  /** Accessible label for the canvas region. Defaults to `"Graph canvas"`. */
  'aria-label'?: string;
  /** Extra classes merged onto the root element. */
  className?: string;
}

/**
 * An infinite, pannable, zoomable field to draw a graph on.
 *
 * The canvas owns exactly one thing: the mapping between screen pixels and
 * graph space. It knows nothing about nodes, edges, or what any of it means —
 * children are rendered inside a transformed layer, so anything positioned in
 * graph coordinates lands in the right place.
 *
 * Pan by dragging empty space or with the middle mouse button; zoom with the
 * wheel or a trackpad pinch, always anchored to the cursor. Space-drag pans
 * from anywhere, including over a node.
 *
 * Viewport state is internal by default. Pass `viewport` to take control.
 *
 * @example
 * ```tsx
 * <GraphCanvas onDrop={(point) => addNodeAt(point)}>
 *   {nodes.map((node) => (
 *     <GraphNode key={node.id} node={node} onMove={move}>
 *       {node.label}
 *     </GraphNode>
 *   ))}
 * </GraphCanvas>
 * ```
 */
export const GraphCanvas = forwardRef<GraphCanvasHandle, GraphCanvasProps>(
  (
    {
      children,
      overlay,
      viewport: controlledViewport,
      defaultViewport = IDENTITY_VIEWPORT,
      onViewportChange,
      onCanvasClick,
      onCanvasDoubleClick,
      onCanvasContextMenu,
      onDrop,
      grid = true,
      gridSize = 24,
      minScale = 0.1,
      maxScale = 4,
      pannable = true,
      zoomable = true,
      'aria-label': ariaLabel = 'Graph canvas',
      className,
    },
    ref,
  ) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const [internalViewport, setInternalViewport] = useState(defaultViewport);
    const [isPanning, setIsPanning] = useState(false);
    const [spaceHeld, setSpaceHeld] = useState(false);

    const viewport = controlledViewport ?? internalViewport;

    // Panning reads the viewport on every pointer move; a ref keeps the move
    // handler stable instead of re-subscribing on each frame.
    const viewportRef = useRef(viewport);
    viewportRef.current = viewport;

    const commit = useCallback(
      (next: IViewport) => {
        if (!controlledViewport) setInternalViewport(next);
        onViewportChange?.(next);
      },
      [controlledViewport, onViewportChange],
    );

    /** A client point relative to the canvas element's top-left. */
    const toLocal = useCallback((client: IPoint): IPoint => {
      const rect = elementRef.current?.getBoundingClientRect();
      return rect ? { x: client.x - rect.left, y: client.y - rect.top } : client;
    }, []);

    /* ---------------------------------------------------------------- zoom */

    useEffect(() => {
      const element = elementRef.current;
      if (!element || !zoomable) return;

      // Registered manually and non-passively: React's onWheel is passive, so
      // preventDefault there is ignored and the page scrolls behind the canvas.
      const onWheel = (event: WheelEvent) => {
        event.preventDefault();

        const current = viewportRef.current;
        const local = toLocal({ x: event.clientX, y: event.clientY });

        // A trackpad pinch arrives as a wheel event with ctrlKey set.
        const intensity = event.ctrlKey ? 0.01 : 0.002;
        const next = clampScale(
          current.scale * Math.exp(-event.deltaY * intensity),
          minScale,
          maxScale,
        );

        commit(zoomAt(current, local, next));
      };

      element.addEventListener('wheel', onWheel, { passive: false });
      return () => element.removeEventListener('wheel', onWheel);
    }, [zoomable, minScale, maxScale, commit, toLocal]);

    /* ----------------------------------------------------------- space-pan */

    useEffect(() => {
      if (!pannable) return;

      const down = (e: KeyboardEvent) => {
        if (e.code !== 'Space') return;
        const target = e.target as HTMLElement | null;
        // Don't hijack the spacebar from a field the user is typing in.
        if (target?.closest('input, textarea, [contenteditable="true"]')) return;
        if (!elementRef.current?.contains(document.activeElement)) return;
        e.preventDefault();
        setSpaceHeld(true);
      };
      const up = (e: KeyboardEvent) => {
        if (e.code === 'Space') setSpaceHeld(false);
      };

      window.addEventListener('keydown', down);
      window.addEventListener('keyup', up);
      return () => {
        window.removeEventListener('keydown', down);
        window.removeEventListener('keyup', up);
      };
    }, [pannable]);

    /* ----------------------------------------------------------------- pan */

    const handlePointerDown = (event: React.PointerEvent) => {
      if (!pannable) return;

      const onEmptyCanvas = event.target === event.currentTarget;
      const middleButton = event.button === 1;
      // Dragging a node must not pan the canvas, unless space is held.
      if (!onEmptyCanvas && !middleButton && !spaceHeld) return;
      if (event.button !== 0 && !middleButton) return;

      event.preventDefault();
      setIsPanning(true);

      const start = { x: event.clientX, y: event.clientY };
      const origin = { ...viewportRef.current };

      const move = (e: PointerEvent) => {
        commit({
          ...origin,
          x: origin.x + (e.clientX - start.x),
          y: origin.y + (e.clientY - start.y),
        });
      };
      const end = () => {
        setIsPanning(false);
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', end);
      };

      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', end);
    };

    /* -------------------------------------------------------------- handle */

    useImperativeHandle(
      ref,
      () => ({
        getViewport: () => viewportRef.current,
        setViewport: commit,
        fitTo: (nodes, padding) => {
          const rect = elementRef.current?.getBoundingClientRect();
          if (!rect) return;
          commit(fitViewport(nodes, { width: rect.width, height: rect.height }, padding));
        },
        zoomBy: (factor) => {
          const rect = elementRef.current?.getBoundingClientRect();
          if (!rect) return;
          const centre = { x: rect.width / 2, y: rect.height / 2 };
          const next = clampScale(
            viewportRef.current.scale * factor,
            minScale,
            maxScale,
          );
          commit(zoomAt(viewportRef.current, centre, next));
        },
        clientToGraph: (client) => toGraphSpace(toLocal(client), viewportRef.current),
        focus: () => elementRef.current?.focus(),
      }),
      [commit, minScale, maxScale, toLocal],
    );

    /* -------------------------------------------------------------- render */

    const graphPointOf = (event: React.MouseEvent | React.DragEvent): IPoint =>
      toGraphSpace(toLocal({ x: event.clientX, y: event.clientY }), viewport);

    const onEmptyCanvas = (event: React.MouseEvent) =>
      event.target === event.currentTarget;

    return (
      <div
        ref={elementRef}
        role="application"
        aria-label={ariaLabel}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onClick={(e) => onEmptyCanvas(e) && onCanvasClick?.(graphPointOf(e), e)}
        onDoubleClick={(e) =>
          onEmptyCanvas(e) && onCanvasDoubleClick?.(graphPointOf(e), e)
        }
        onContextMenu={(e) => {
          if (!onCanvasContextMenu || !onEmptyCanvas(e)) return;
          e.preventDefault();
          onCanvasContextMenu(graphPointOf(e), e);
        }}
        onDragOver={(e) => {
          if (!onDrop) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }}
        onDrop={(e) => {
          if (!onDrop) return;
          e.preventDefault();
          onDrop(graphPointOf(e), e);
        }}
        style={
          grid
            ? {
                // The grid is painted on the element rather than inside the
                // transformed layer, so it can be infinite without needing a
                // giant element behind it.
                backgroundImage:
                  'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
                backgroundSize: `${gridSize * viewport.scale}px ${gridSize * viewport.scale}px`,
                backgroundPosition: `${viewport.x}px ${viewport.y}px`,
              }
            : undefined
        }
        className={cn(
          'relative w-full h-full overflow-hidden bg-background outline-none',
          'focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset',
          spaceHeld || isPanning ? 'cursor-grabbing' : 'cursor-grab',
          className,
        )}
      >
        <div
          // `will-change` keeps the transform on the compositor; without it,
          // panning a large graph repaints every child.
          style={{
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
            transformOrigin: '0 0',
            willChange: 'transform',
          }}
          className="absolute inset-0 pointer-events-none [&>*]:pointer-events-auto"
        >
          {children}
        </div>

        {overlay && <div className="absolute inset-0 pointer-events-none [&>*]:pointer-events-auto">{overlay}</div>}
      </div>
    );
  },
);

GraphCanvas.displayName = 'GraphCanvas';
