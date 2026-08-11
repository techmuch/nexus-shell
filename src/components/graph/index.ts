/**
 * The graph layer.
 *
 * A decomposed set of primitives for building node-and-edge editors, in the
 * same spirit as the rest of the library: the canvas knows about coordinates,
 * the node knows about placement and focus, the edge knows about geometry, and
 * the keyboard hook knows about traversal. None of them know what a node
 * *means* — that stays in your application.
 *
 * Compose them yourself, or reach for whichever piece you need on its own.
 */

export { GraphCanvas, type GraphCanvasProps, type GraphCanvasHandle } from './GraphCanvas';
export { GraphNode, type GraphNodeProps } from './GraphNode';
export {
  GraphEdge,
  GraphEdgeLayer,
  edgePath,
  type GraphEdgeProps,
  type GraphEdgeLayerProps,
  type EdgeRouting,
} from './GraphEdge';
export {
  useGraphKeyboard,
  DEFAULT_GRAPH_KEYS,
  type UseGraphKeyboardOptions,
  type UseGraphKeyboardResult,
  type GraphKeyboardActions,
} from './useGraphKeyboard';
export { GraphMiniMap, type GraphMiniMapProps } from './GraphMiniMap';
export {
  useGraphLayout,
  FREEFORM,
  type LayoutMode,
  type UseGraphLayoutOptions,
  type UseGraphLayoutResult,
} from './useGraphLayout';
export {
  NodePalette,
  readPaletteDrag,
  GRAPH_NODE_MIME,
  type NodePaletteProps,
  type INodePaletteItem,
  type PaletteOrientation,
  type ResolvedOrientation,
} from './NodePalette';
