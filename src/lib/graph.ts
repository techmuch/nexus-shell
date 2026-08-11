/**
 * The graph domain model and its geometry.
 *
 * Kept deliberately small and domain-neutral: the library knows about
 * positioned nodes, edges between them, and a viewport. What a node *means* —
 * an argument, a task, a service, a scene object — belongs to the application,
 * exactly as with {@link ITreeNode}.
 *
 * This lives in `lib/` rather than `core/services/` so the presentational graph
 * components can use it; they are barred from importing stores.
 */

/* -------------------------------------------------------------------------- */
/* Model                                                                      */
/* -------------------------------------------------------------------------- */

/** A point in graph space. Graph space is unbounded in every direction. */
export interface IPoint {
  x: number;
  y: number;
}

/** A rectangle in graph space, anchored at its top-left corner. */
export interface IRect extends IPoint {
  width: number;
  height: number;
}

/**
 * The four sides a node exposes for edge attachment.
 *
 * Ports are sides rather than discrete handles: an edge picks whichever side
 * faces its counterpart, which keeps the model small and means a node needs no
 * per-handle configuration to be connectable.
 */
export type GraphPort = 'top' | 'right' | 'bottom' | 'left';

/** A node in the graph. */
export interface IGraphNode {
  /** Stable identifier, unique across the graph. */
  id: string;
  /** Top-left corner in graph space. */
  position: IPoint;
  /** Rendered size. Defaults to {@link DEFAULT_NODE_SIZE} when omitted. */
  size?: { width: number; height: number };
  /**
   * Your own classification, e.g. `"question"`, `"service"`, `"task"`. Never
   * interpreted by the library — it exists so you can render and validate by
   * type, and so palette entries and edge rules can target it.
   */
  kind?: string;
  /** Free-form payload. The library passes it through untouched. */
  data?: unknown;
}

/** A directed edge between two nodes. */
export interface IGraphEdge {
  /** Stable identifier, unique across the graph. */
  id: string;
  /** Id of the node the edge leaves. */
  source: string;
  /** Id of the node the edge enters. */
  target: string;
  /** Your own classification, e.g. `"supports"`, `"depends-on"`. */
  kind?: string;
  /** Text rendered at the edge's midpoint. */
  label?: string;
  /** Free-form payload. */
  data?: unknown;
}

/** Pan and zoom. `scale` multiplies graph units to screen pixels. */
export interface IViewport {
  x: number;
  y: number;
  scale: number;
}

export const DEFAULT_NODE_SIZE = { width: 180, height: 72 } as const;

export const IDENTITY_VIEWPORT: IViewport = { x: 0, y: 0, scale: 1 };

/* -------------------------------------------------------------------------- */
/* Geometry                                                                   */
/* -------------------------------------------------------------------------- */

/** The rectangle a node occupies, filling in the default size. */
export const nodeRect = (node: IGraphNode): IRect => ({
  x: node.position.x,
  y: node.position.y,
  width: node.size?.width ?? DEFAULT_NODE_SIZE.width,
  height: node.size?.height ?? DEFAULT_NODE_SIZE.height,
});

export const rectCenter = (rect: IRect): IPoint => ({
  x: rect.x + rect.width / 2,
  y: rect.y + rect.height / 2,
});

/** Convert a screen-space point (relative to the canvas element) to graph space. */
export const toGraphSpace = (point: IPoint, viewport: IViewport): IPoint => ({
  x: (point.x - viewport.x) / viewport.scale,
  y: (point.y - viewport.y) / viewport.scale,
});

/** Convert a graph-space point to screen space (relative to the canvas element). */
export const toScreenSpace = (point: IPoint, viewport: IViewport): IPoint => ({
  x: point.x * viewport.scale + viewport.x,
  y: point.y * viewport.scale + viewport.y,
});

/**
 * Zoom about a fixed screen point, so the graph position under the cursor stays
 * under the cursor. Anything else feels wrong to use.
 */
export const zoomAt = (
  viewport: IViewport,
  screenPoint: IPoint,
  nextScale: number,
): IViewport => {
  const graphPoint = toGraphSpace(screenPoint, viewport);
  return {
    scale: nextScale,
    x: screenPoint.x - graphPoint.x * nextScale,
    y: screenPoint.y - graphPoint.y * nextScale,
  };
};

export const clampScale = (scale: number, min = 0.1, max = 4): number =>
  Math.min(max, Math.max(min, scale));

/** The point on a rectangle's edge for a given side. */
export const portPoint = (rect: IRect, port: GraphPort): IPoint => {
  const center = rectCenter(rect);
  switch (port) {
    case 'top':
      return { x: center.x, y: rect.y };
    case 'bottom':
      return { x: center.x, y: rect.y + rect.height };
    case 'left':
      return { x: rect.x, y: center.y };
    case 'right':
      return { x: rect.x + rect.width, y: center.y };
  }
};

/**
 * Choose which sides an edge should leave and enter, based on which direction
 * dominates. Picking automatically is what lets a node be connectable without
 * declaring handles.
 */
export const resolvePorts = (
  from: IRect,
  to: IRect,
): { source: GraphPort; target: GraphPort } => {
  const a = rectCenter(from);
  const b = rectCenter(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? { source: 'right', target: 'left' }
      : { source: 'left', target: 'right' };
  }
  return dy >= 0 ? { source: 'bottom', target: 'top' } : { source: 'top', target: 'bottom' };
};

/**
 * The bounding box of a set of nodes, or `null` when there are none.
 * Used to fit the viewport to the graph.
 */
export const graphBounds = (nodes: IGraphNode[]): IRect | null => {
  if (nodes.length === 0) return null;

  const rects = nodes.map(nodeRect);
  const minX = Math.min(...rects.map((r) => r.x));
  const minY = Math.min(...rects.map((r) => r.y));
  const maxX = Math.max(...rects.map((r) => r.x + r.width));
  const maxY = Math.max(...rects.map((r) => r.y + r.height));

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
};

/**
 * The region of graph space currently visible in an element of the given size.
 *
 * This is what a minimap draws as its viewport indicator, and what a culling
 * pass would test against.
 */
export const viewportRect = (
  viewport: IViewport,
  size: { width: number; height: number },
): IRect => ({
  // Written as a subtraction rather than `-viewport.x / scale` so a pan of zero
  // yields +0 rather than -0, which otherwise leaks into equality checks.
  x: (0 - viewport.x) / viewport.scale,
  y: (0 - viewport.y) / viewport.scale,
  width: size.width / viewport.scale,
  height: size.height / viewport.scale,
});

/**
 * A viewport that puts a graph-space point at the centre of the element,
 * keeping the current zoom. Used for jumping somewhere from a minimap or a
 * search result.
 */
export const centerOn = (
  point: IPoint,
  size: { width: number; height: number },
  scale: number,
): IViewport => ({
  scale,
  x: size.width / 2 - point.x * scale,
  y: size.height / 2 - point.y * scale,
});

/** The smallest rectangle containing both inputs. */
export const unionRect = (a: IRect, b: IRect): IRect => {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    width: Math.max(a.x + a.width, b.x + b.width) - x,
    height: Math.max(a.y + a.height, b.y + b.height) - y,
  };
};

/** A viewport that fits `nodes` inside a element of the given size. */
export const fitViewport = (
  nodes: IGraphNode[],
  size: { width: number; height: number },
  padding = 48,
): IViewport => {
  const bounds = graphBounds(nodes);
  if (!bounds || size.width === 0 || size.height === 0) return IDENTITY_VIEWPORT;

  const scale = clampScale(
    Math.min(
      (size.width - padding * 2) / Math.max(bounds.width, 1),
      (size.height - padding * 2) / Math.max(bounds.height, 1),
    ),
  );
  const center = rectCenter(bounds);

  return {
    scale,
    x: size.width / 2 - center.x * scale,
    y: size.height / 2 - center.y * scale,
  };
};

/* -------------------------------------------------------------------------- */
/* Spatial navigation                                                         */
/* -------------------------------------------------------------------------- */

export type Direction = 'up' | 'down' | 'left' | 'right';

const DIRECTION_VECTOR: Record<Direction, IPoint> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

/**
 * The nearest node in a direction, for arrow-key traversal.
 *
 * Scores candidates by distance along the travel axis, penalised by how far
 * they stray off it. Pure distance would jump to a node that is barely in the
 * right direction but far to the side; requiring perfect alignment would make
 * most of the graph unreachable. The 2× penalty on lateral offset is the
 * compromise, and it matches what feels right when navigating a hand-arranged
 * diagram.
 *
 * Returns `null` when nothing lies in that direction.
 */
export const findNeighbour = (
  nodes: IGraphNode[],
  fromId: string,
  direction: Direction,
): IGraphNode | null => {
  const from = nodes.find((n) => n.id === fromId);
  if (!from) return null;

  const origin = rectCenter(nodeRect(from));
  const vector = DIRECTION_VECTOR[direction];

  let best: { node: IGraphNode; score: number } | null = null;

  for (const node of nodes) {
    if (node.id === fromId) continue;

    const point = rectCenter(nodeRect(node));
    const dx = point.x - origin.x;
    const dy = point.y - origin.y;

    // Distance along the direction of travel; must be positive to count.
    const along = dx * vector.x + dy * vector.y;
    if (along <= 0) continue;

    // Distance perpendicular to it.
    const lateral = Math.abs(dx * vector.y - dy * vector.x);

    // Ignore anything more off-axis than it is ahead — that reads as "beside",
    // not "in that direction".
    if (lateral > along * 2) continue;

    const score = along + lateral * 2;
    if (!best || score < best.score) best = { node, score };
  }

  return best?.node ?? null;
};

/**
 * A free position for a new node placed relative to an existing one, nudged
 * along `direction` and then away from anything it would overlap.
 *
 * Used when creating a node from the keyboard, where there is no cursor to say
 * where it should go.
 */
export const placeRelativeTo = (
  nodes: IGraphNode[],
  fromId: string,
  direction: Direction,
  gap = 64,
): IPoint => {
  const from = nodes.find((n) => n.id === fromId);
  if (!from) return { x: 0, y: 0 };

  const rect = nodeRect(from);
  const vector = DIRECTION_VECTOR[direction];

  const step = {
    x: vector.x * (rect.width + gap),
    y: vector.y * (rect.height + gap),
  };

  let candidate: IPoint = { x: rect.x + step.x, y: rect.y + step.y };

  // Walk further out until the slot is clear. Bounded so a dense graph can't
  // spin here.
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const proposed: IRect = { ...candidate, width: rect.width, height: rect.height };
    const collides = nodes.some((node) => overlaps(nodeRect(node), proposed));
    if (!collides) break;

    // Push along the travel axis, or sideways when travel is vertical.
    candidate =
      vector.x !== 0
        ? { x: candidate.x, y: candidate.y + rect.height + gap }
        : { x: candidate.x + rect.width + gap, y: candidate.y };
  }

  return candidate;
};

const overlaps = (a: IRect, b: IRect): boolean =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;

/* -------------------------------------------------------------------------- */
/* Graph queries                                                              */
/* -------------------------------------------------------------------------- */

/** Edges touching a node, in either direction. */
export const edgesOf = (edges: IGraphEdge[], nodeId: string): IGraphEdge[] =>
  edges.filter((e) => e.source === nodeId || e.target === nodeId);

/** Whether an edge already joins two nodes, in either direction. */
export const isConnected = (
  edges: IGraphEdge[],
  a: string,
  b: string,
): boolean =>
  edges.some(
    (e) => (e.source === a && e.target === b) || (e.source === b && e.target === a),
  );

/** Remove a node and every edge attached to it. */
export const removeNode = (
  nodes: IGraphNode[],
  edges: IGraphEdge[],
  nodeId: string,
): { nodes: IGraphNode[]; edges: IGraphEdge[] } => ({
  nodes: nodes.filter((n) => n.id !== nodeId),
  edges: edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
});

/** Generate an id that is unique within a collection. */
export const nextId = (prefix: string, existing: { id: string }[]): string => {
  let n = existing.length + 1;
  const taken = new Set(existing.map((e) => e.id));
  while (taken.has(`${prefix}-${n}`)) n += 1;
  return `${prefix}-${n}`;
};
