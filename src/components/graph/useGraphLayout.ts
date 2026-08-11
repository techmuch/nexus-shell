import { useCallback, useMemo, useState } from 'react';
import { BUILT_IN_LAYOUTS, type GraphLayout } from '../../lib/layout';
import type { IGraphEdge, IGraphNode, IPoint } from '../../lib/graph';

/**
 * The mode in which positions are hand-held rather than computed.
 *
 * Reserved: a layout may not be registered under this name.
 */
export const FREEFORM = 'freeform' as const;

/** The active layout's name, or {@link FREEFORM}. */
export type LayoutMode = typeof FREEFORM | (string & {});

export interface UseGraphLayoutOptions {
  /** Your nodes. Positions here are the hand-placed ones. */
  nodes: IGraphNode[];
  /** Your edges. Layouts that ignore structure ignore these. */
  edges: IGraphEdge[];
  /**
   * Named layouts to offer. Defaults to the bundled `vertical`, `horizontal`
   * and `grid`. Spread it to add your own.
   */
  layouts?: Record<string, GraphLayout>;
  /** Take control of the mode. */
  mode?: LayoutMode;
  /** Starting mode when uncontrolled. Defaults to {@link FREEFORM}. */
  defaultMode?: LayoutMode;
  /** Called whenever the mode changes, including the escape on drag. */
  onModeChange?: (mode: LayoutMode) => void;
  /**
   * Called when a node is moved by hand, so you can persist the position.
   *
   * Without it, a drag under an auto layout still escapes to freeform but the
   * node snaps back to where it was — the engine no longer places it, and
   * nothing recorded where the pointer left it.
   */
  onNodeMove?: (id: string, position: IPoint) => void;
  /**
   * Dragging a node while an auto layout is active switches to freeform,
   * keeping the arrangement as it stood. Defaults to `true`.
   *
   * Turn it off for a graph whose positions are entirely derived — a
   * visualisation rather than an editor — where a stray drag should be ignored.
   */
  escapeOnDrag?: boolean;
}

export interface UseGraphLayoutResult {
  /**
   * Nodes to render: positioned by the active layout, or exactly your nodes in
   * freeform. Pass these to `GraphNode`, not your originals.
   */
  nodes: IGraphNode[];
  /** The active mode. */
  mode: LayoutMode;
  setMode: (mode: LayoutMode) => void;
  /** Names of the available layouts, for building a picker. */
  available: string[];
  /** Whether a layout is currently placing nodes. */
  isAuto: boolean;
  /**
   * Wire to `GraphNode`'s `onMove`. Records the position and, under an auto
   * layout, escapes to freeform so the drag actually takes effect.
   */
  onMove: (id: string, position: IPoint) => void;
  /**
   * Positions from the active layout, applied to your nodes and returned for
   * you to persist. Use it to "bake in" an arrangement before switching to
   * freeform, so hand editing starts from the laid-out positions rather than
   * from wherever the nodes previously sat.
   */
  bake: () => IGraphNode[];
}

/**
 * Apply a layout engine to a graph, with an escape hatch to hand placement.
 *
 * Two kinds of mode:
 *
 * - **An auto layout** — positions come from the engine. Your nodes' own
 *   positions are ignored while it is active, but never overwritten, so
 *   switching back to freeform restores the arrangement you had.
 * - **`freeform`** — positions are yours, exactly as stored.
 *
 * Dragging a node under an auto layout escapes to freeform rather than fighting
 * the engine. That is the behaviour that makes auto layout usable: you can
 * always grab a node, and the graph stops rearranging itself the moment you do.
 *
 * The hook derives positions and reports intent; it owns no node data and
 * mutates nothing.
 *
 * @example
 * ```tsx
 * const layout = useGraphLayout({
 *   nodes,
 *   edges,
 *   defaultMode: 'vertical',
 *   onNodeMove: (id, position) => setNodes(move(nodes, id, position)),
 * });
 *
 * <GraphCanvas>
 *   {layout.nodes.map((node) => (
 *     <GraphNode key={node.id} node={node} onMove={layout.onMove}>
 *       {label(node)}
 *     </GraphNode>
 *   ))}
 * </GraphCanvas>
 *
 * // A picker is a few lines of your own UI:
 * {[FREEFORM, ...layout.available].map((mode) => (
 *   <button key={mode} onClick={() => layout.setMode(mode)}>{mode}</button>
 * ))}
 * ```
 */
export const useGraphLayout = ({
  nodes,
  edges,
  layouts = BUILT_IN_LAYOUTS,
  mode: controlledMode,
  defaultMode = FREEFORM,
  onModeChange,
  onNodeMove,
  escapeOnDrag = true,
}: UseGraphLayoutOptions): UseGraphLayoutResult => {
  const [internalMode, setInternalMode] = useState<LayoutMode>(defaultMode);
  const mode = controlledMode ?? internalMode;

  const setMode = useCallback(
    (next: LayoutMode) => {
      if (controlledMode === undefined) setInternalMode(next);
      onModeChange?.(next);
    },
    [controlledMode, onModeChange],
  );

  const engine = mode === FREEFORM ? undefined : layouts[mode];
  const isAuto = !!engine;

  /**
   * Recomputed whenever the graph or mode changes. Layouts are pure, so this is
   * safe to memoise on the inputs alone.
   */
  const positioned = useMemo(
    () => (engine ? engine(nodes, edges) : nodes),
    [engine, nodes, edges],
  );

  const onMove = useCallback(
    (id: string, position: IPoint) => {
      // Escape first, so the position we record is the one that survives.
      if (isAuto && escapeOnDrag) setMode(FREEFORM);
      onNodeMove?.(id, position);
    },
    [isAuto, escapeOnDrag, setMode, onNodeMove],
  );

  const bake = useCallback(() => positioned, [positioned]);

  const available = useMemo(
    // `freeform` is a mode, not a layout; registering one under that name would
    // shadow the escape hatch, so it never appears here.
    () => Object.keys(layouts).filter((name) => name !== FREEFORM),
    [layouts],
  );

  return useMemo(
    () => ({ nodes: positioned, mode, setMode, available, isAuto, onMove, bake }),
    [positioned, mode, setMode, available, isAuto, onMove, bake],
  );
};
