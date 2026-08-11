import { nodeRect, type IGraphEdge, type IGraphNode, type IPoint } from './graph';

/**
 * Graph layout engines.
 *
 * A layout is a pure function from a graph to repositioned nodes. It never
 * mutates, never renders, and knows nothing about React — which makes each one
 * testable in isolation and lets an application supply its own.
 *
 * ```ts
 * const positioned = layeredLayout({ direction: 'right' })(nodes, edges);
 * ```
 *
 * See {@link useGraphLayout} for applying one to a live graph, including the
 * freeform mode that lets a hand-placed node escape the engine.
 */

/** Repositions a graph. Must be pure: same input, same output, no mutation. */
export type GraphLayout = (nodes: IGraphNode[], edges: IGraphEdge[]) => IGraphNode[];

/** Which way a layered layout flows. */
export type LayoutDirection = 'down' | 'up' | 'right' | 'left';

export interface LayeredLayoutOptions {
  /** Flow direction. Defaults to `"down"`. */
  direction?: LayoutDirection;
  /** Gap between siblings within a layer, in graph units. Defaults to `48`. */
  nodeSpacing?: number;
  /** Gap between layers, in graph units. Defaults to `96`. */
  layerSpacing?: number;
  /** Top-left of the laid-out block. Defaults to the origin. */
  origin?: IPoint;
  /**
   * How siblings line up across a layer. `center` reads best for trees;
   * `start` keeps a ragged left edge, which suits deep hierarchies.
   * Defaults to `"center"`.
   */
  align?: 'center' | 'start';
}

/**
 * Assign a layer to every node by breadth-first traversal from the roots.
 *
 * A node's layer is one past the deepest predecessor that reaches it, so an
 * edge always points forward. Nodes in a cycle — or in a component with no
 * root — are seeded separately, which is what keeps the algorithm total rather
 * than silently dropping them.
 */
const assignLayers = (
  nodes: IGraphNode[],
  edges: IGraphEdge[],
): Map<string, number> => {
  const ids = new Set(nodes.map((n) => n.id));
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, number>();

  nodes.forEach((node) => {
    outgoing.set(node.id, []);
    incoming.set(node.id, 0);
  });

  edges.forEach((edge) => {
    // Ignore edges pointing at nodes that aren't here.
    if (!ids.has(edge.source) || !ids.has(edge.target)) return;
    outgoing.get(edge.source)!.push(edge.target);
    incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + 1);
  });

  const layers = new Map<string, number>();
  const queue: string[] = [];

  const seed = (id: string) => {
    layers.set(id, 0);
    queue.push(id);
  };

  nodes.forEach((node) => {
    if ((incoming.get(node.id) ?? 0) === 0) seed(node.id);
  });

  // Every node has a predecessor, so the whole graph is cyclic. Seed the first
  // node to give the traversal somewhere to start.
  if (queue.length === 0 && nodes.length > 0) seed(nodes[0].id);

  // Bounded so a cycle can't spin here: each node can be deepened at most
  // `nodes.length` times before we know we are going round.
  let guard = nodes.length * nodes.length + nodes.length;

  while (queue.length > 0 && guard > 0) {
    guard -= 1;
    const id = queue.shift()!;
    const depth = layers.get(id) ?? 0;

    for (const next of outgoing.get(id) ?? []) {
      const known = layers.get(next);
      if (known === undefined || known < depth + 1) {
        layers.set(next, depth + 1);
        queue.push(next);
      }
    }
  }

  // Anything unreached sits in a component with no root, or was cut off by the
  // guard. Give it a layer rather than leaving it at the origin.
  nodes.forEach((node) => {
    if (!layers.has(node.id)) seed(node.id);
  });

  return layers;
};

/**
 * A layered (Sugiyama-style) tree layout.
 *
 * Nodes are grouped into layers by graph depth, then spread along the
 * cross-axis within each layer. Real node sizes are used, so mixed-size nodes
 * don't overlap — a fixed step would.
 *
 * Handles cycles and disconnected components without dropping nodes.
 *
 * @example
 * ```ts
 * const layout = layeredLayout({ direction: 'right', layerSpacing: 140 });
 * setNodes(layout(nodes, edges));
 * ```
 */
export const layeredLayout =
  ({
    direction = 'down',
    nodeSpacing = 48,
    layerSpacing = 96,
    origin = { x: 0, y: 0 },
    align = 'center',
  }: LayeredLayoutOptions = {}): GraphLayout =>
  (nodes, edges) => {
    if (nodes.length === 0) return nodes;

    const layers = assignLayers(nodes, edges);
    const vertical = direction === 'down' || direction === 'up';

    /** Nodes grouped by layer, preserving input order within each. */
    const byLayer = new Map<number, IGraphNode[]>();
    nodes.forEach((node) => {
      const layer = layers.get(node.id) ?? 0;
      const group = byLayer.get(layer) ?? [];
      group.push(node);
      byLayer.set(layer, group);
    });

    const ordered = [...byLayer.keys()].sort((a, b) => a - b);

    /** Thickness of each layer along the flow axis, i.e. its tallest node. */
    const layerExtent = new Map<number, number>();
    ordered.forEach((layer) => {
      const group = byLayer.get(layer)!;
      const extent = Math.max(
        ...group.map((node) => {
          const rect = nodeRect(node);
          return vertical ? rect.height : rect.width;
        }),
      );
      layerExtent.set(layer, extent);
    });

    /** Where each layer starts along the flow axis. */
    const layerOffset = new Map<number, number>();
    let cursor = 0;
    ordered.forEach((layer) => {
      layerOffset.set(layer, cursor);
      cursor += (layerExtent.get(layer) ?? 0) + layerSpacing;
    });

    // The widest layer sets the cross-axis span everything centres against.
    const layerSpan = (layer: number) => {
      const group = byLayer.get(layer)!;
      const sizes = group.map((node) => {
        const rect = nodeRect(node);
        return vertical ? rect.width : rect.height;
      });
      return sizes.reduce((a, b) => a + b, 0) + nodeSpacing * (group.length - 1);
    };

    const widest = Math.max(...ordered.map(layerSpan));

    // `down` and `right` run forwards; `up` and `left` mirror the flow axis.
    const reversed = direction === 'up' || direction === 'left';
    const totalFlow = cursor - layerSpacing;

    const positioned = new Map<string, IPoint>();

    ordered.forEach((layer) => {
      const group = byLayer.get(layer)!;
      const span = layerSpan(layer);
      let cross = align === 'center' ? (widest - span) / 2 : 0;

      const flowStart = layerOffset.get(layer) ?? 0;
      const flow = reversed
        ? totalFlow - flowStart - (layerExtent.get(layer) ?? 0)
        : flowStart;

      group.forEach((node) => {
        const rect = nodeRect(node);
        const crossSize = vertical ? rect.width : rect.height;
        const flowSize = vertical ? rect.height : rect.width;

        // Centre each node within its layer's thickness, so a short node in a
        // tall layer doesn't sit against the top edge.
        const flowCentred = flow + ((layerExtent.get(layer) ?? 0) - flowSize) / 2;

        positioned.set(
          node.id,
          vertical
            ? { x: origin.x + cross, y: origin.y + flowCentred }
            : { x: origin.x + flowCentred, y: origin.y + cross },
        );

        cross += crossSize + nodeSpacing;
      });
    });

    return nodes.map((node) => {
      const position = positioned.get(node.id);
      return position ? { ...node, position } : node;
    });
  };

export interface GridLayoutOptions {
  /**
   * Number of columns. Defaults to a square-ish grid, which keeps a large
   * unstructured set roughly as wide as it is tall.
   */
  columns?: number;
  /** Horizontal gap between cells. Defaults to `48`. */
  spacingX?: number;
  /** Vertical gap between cells. Defaults to `48`. */
  spacingY?: number;
  /** Top-left of the grid. Defaults to the origin. */
  origin?: IPoint;
}

/**
 * A uniform grid, ignoring edges entirely.
 *
 * Useful for a set with no meaningful hierarchy, or as a reset before hand
 * arranging. Column widths and row heights come from the largest node in each,
 * so mixed sizes stay aligned.
 *
 * @example
 * ```ts
 * setNodes(gridLayout({ columns: 4 })(nodes, edges));
 * ```
 */
export const gridLayout =
  ({
    columns,
    spacingX = 48,
    spacingY = 48,
    origin = { x: 0, y: 0 },
  }: GridLayoutOptions = {}): GraphLayout =>
  (nodes) => {
    if (nodes.length === 0) return nodes;

    const cols = Math.max(1, columns ?? Math.ceil(Math.sqrt(nodes.length)));
    const rows = Math.ceil(nodes.length / cols);

    /** Widest node in each column, tallest in each row. */
    const columnWidth = Array.from({ length: cols }, (_, col) =>
      Math.max(
        ...nodes
          .filter((_, i) => i % cols === col)
          .map((node) => nodeRect(node).width),
      ),
    );
    const rowHeight = Array.from({ length: rows }, (_, row) =>
      Math.max(
        ...nodes
          .filter((_, i) => Math.floor(i / cols) === row)
          .map((node) => nodeRect(node).height),
      ),
    );

    const columnOffset: number[] = [];
    columnWidth.reduce((acc, width, i) => {
      columnOffset[i] = acc;
      return acc + width + spacingX;
    }, 0);

    const rowOffset: number[] = [];
    rowHeight.reduce((acc, height, i) => {
      rowOffset[i] = acc;
      return acc + height + spacingY;
    }, 0);

    return nodes.map((node, i) => ({
      ...node,
      position: {
        x: origin.x + columnOffset[i % cols],
        y: origin.y + rowOffset[Math.floor(i / cols)],
      },
    }));
  };

/**
 * The layouts bundled with the library, ready to pass to
 * {@link useGraphLayout}.
 *
 * Spread it and add your own, or ignore it and supply a different set —
 * `useGraphLayout` takes any `Record<string, GraphLayout>`.
 */
export const BUILT_IN_LAYOUTS: Record<string, GraphLayout> = {
  vertical: layeredLayout({ direction: 'down' }),
  horizontal: layeredLayout({ direction: 'right' }),
  grid: gridLayout(),
};
