import { create, StoreApi, UseBoundStore } from 'zustand';
import {
  BUILT_IN_LAYOUTS,
  edgesOf,
  nextId,
  removeNode,
  type IGraphEdge,
  type IGraphNode,
  type IPoint,
} from '../../../src/index';

/**
 * The dialogue map's state.
 *
 * Nodes and edges are the library's own `IGraphNode` / `IGraphEdge`, so this
 * store holds nothing but the map itself — geometry, layout and rendering all
 * live in the graph components. What is left here is the part no library can
 * supply: IBIS semantics, and which connections they permit.
 */

export type IbisNodeType =
  | 'question'
  | 'idea'
  | 'pro'
  | 'con'
  | 'note'
  | 'decision'
  | 'link'
  | 'image'
  | 'map';

export const IBIS_TYPES: { value: IbisNodeType; label: string; shortcut: string }[] = [
  { value: 'question', label: 'Question / Issue', shortcut: 'q' },
  { value: 'idea', label: 'Idea / Position', shortcut: 'a' },
  { value: 'pro', label: 'Pro Argument', shortcut: 'p' },
  { value: 'con', label: 'Con Argument', shortcut: 'c' },
  { value: 'note', label: 'Note / Evidence', shortcut: 'n' },
  { value: 'decision', label: 'Decision / Resolve', shortcut: 'd' },
  { value: 'link', label: 'Link / Reference', shortcut: 'l' },
  { value: 'image', label: 'Image / Diagram', shortcut: 'i' },
  { value: 'map', label: 'Map / Sub-Map', shortcut: 'm' },
];

export type IbisStatus = 'pending' | 'accepted' | 'rejected';

/** Everything about a node that is not its identity or position. */
export interface IDialogueNodeData {
  title: string;
  description?: string;
  tags?: string[];
  author?: string;
  timestamp: string;
  status?: IbisStatus;
  url?: string;
  imageUrl?: string;
  /** Open the title for editing as soon as the node appears. */
  autoEdit?: boolean;
}

/** A node in a dialogue map: a library graph node whose `kind` is its IBIS type. */
export type DialogueNode = IGraphNode & {
  kind: IbisNodeType;
  data: IDialogueNodeData;
};

export const NODE_SIZE = { width: 240, height: 182 };

export type AutoLayoutMode = 'vertical' | 'horizontal' | 'freeform';

interface DialogueMappingState {
  nodes: DialogueNode[];
  edges: IGraphEdge[];
  /**
   * The selection, as ids. Ids rather than a `selected` flag on each node, so
   * selecting cannot invalidate every node and the panel can read it directly.
   */
  selectedIds: string[];
  layoutHistory: DialogueNode[][];
  autoLayoutMode: AutoLayoutMode;
  connectionError: string | null;

  setNodes: (nodes: DialogueNode[]) => void;
  setEdges: (edges: IGraphEdge[]) => void;
  setSelectedIds: (ids: string[]) => void;
  setAutoLayoutMode: (mode: AutoLayoutMode) => void;
  setConnectionError: (error: string | null) => void;

  addNode: (type: IbisNodeType, position: IPoint, parentNodeId?: string | null) => string;
  updateNode: (id: string, updates: Partial<IDialogueNodeData>) => void;
  updateNodeType: (id: string, type: IbisNodeType) => void;
  moveNode: (id: string, position: IPoint) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;
  deleteSelection: () => void;

  validateConnection: (sourceId: string, targetId: string) => { valid: boolean; reason?: string };
  connectNodes: (source: string, target: string) => boolean;

  recordHistory: () => void;
  undoLayout: () => void;
  importMap: (jsonStr: string) => boolean;
  exportMap: () => string;
}

/* -------------------------------------------------------------------------- */
/* IBIS semantics                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Which connections IBIS permits, as data.
 *
 * A source type listed here may only point at the targets given. Anything not
 * listed connects freely — notes, links and images are annotations and attach
 * to whatever they annotate.
 */
const ALLOWED_TARGETS: Partial<Record<IbisNodeType, IbisNodeType[]>> = {
  pro: ['idea', 'decision'],
  con: ['idea', 'decision'],
  idea: ['question', 'idea'],
  decision: ['question'],
};

const REASONS: Partial<Record<IbisNodeType, string>> = {
  pro: 'Arguments (Pros/Cons) must target Ideas or Decisions.',
  con: 'Arguments (Pros/Cons) must target Ideas or Decisions.',
  idea: 'Ideas must respond to Questions or expand other Ideas.',
  decision: 'Decisions must resolve Questions.',
};

/**
 * Some pairs read backwards when created from the parent.
 *
 * Pressing `d` on a question means "this question is resolved by a decision",
 * and the edge runs decision → question. Reversing here rather than rejecting
 * is what lets the keyboard build a valid map without the user thinking about
 * edge direction.
 */
const reverseFromParent = (parentType: IbisNodeType, newType: IbisNodeType) =>
  (newType === 'decision' && parentType === 'question') ||
  ((newType === 'pro' || newType === 'con') && parentType === 'decision');

const newNode = (type: IbisNodeType, position: IPoint, id: string): DialogueNode => ({
  id,
  kind: type,
  position,
  size: NODE_SIZE,
  data: {
    title: `New ${type.charAt(0).toUpperCase()}${type.slice(1)}`,
    description: '',
    tags: [],
    author: 'user',
    timestamp: new Date().toLocaleString(),
    status: type === 'question' || type === 'idea' ? 'pending' : undefined,
    autoEdit: true,
  },
});

/* -------------------------------------------------------------------------- */
/* Store                                                                      */
/* -------------------------------------------------------------------------- */

export let globalFallbackStore: UseBoundStore<StoreApi<DialogueMappingState>> | null = null;

const storeRegistry = new Map<string | undefined, UseBoundStore<StoreApi<DialogueMappingState>>>();

export const getMapStore = (
  mapId?: string,
): UseBoundStore<StoreApi<DialogueMappingState>> => {
  const existing = storeRegistry.get(mapId);
  if (existing) return existing;

  const store = create<DialogueMappingState>((set, get) => ({
    nodes: [],
    edges: [],
    selectedIds: [],
    layoutHistory: [],
    autoLayoutMode: 'vertical',
    connectionError: null,

    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),
    setSelectedIds: (selectedIds) => set({ selectedIds }),
    setConnectionError: (connectionError) => set({ connectionError }),

    /**
     * Layout mode is remembered, not applied.
     *
     * `useGraphLayout` computes positions from the stored ones on every render,
     * so nothing has to be written back — and switching away from an auto
     * layout restores the arrangement the user had by hand.
     */
    setAutoLayoutMode: (autoLayoutMode) => set({ autoLayoutMode }),

    recordHistory: () =>
      set((state) => ({
        layoutHistory: [...state.layoutHistory, state.nodes],
      })),

    addNode: (type, position, parentNodeId) => {
      const id = nextId('node', get().nodes);
      const node = newNode(type, position, id);

      set((state) => {
        const edges = [...state.edges];
        const parent = parentNodeId
          ? state.nodes.find((n) => n.id === parentNodeId)
          : undefined;

        if (parent) {
          const [source, target] = reverseFromParent(parent.kind, type)
            ? [id, parent.id]
            : [parent.id, id];
          edges.push({ id: nextId('edge', edges), source, target });
        }

        return {
          nodes: [...state.nodes, node],
          edges,
          selectedIds: [id],
        };
      });

      return id;
    },

    updateNode: (id, updates) =>
      set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, ...updates } } : node,
        ),
      })),

    /** Changing a type can imply a status: a decision has, by definition, been made. */
    updateNodeType: (id, type) =>
      set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === id
            ? {
                ...node,
                kind: type,
                data: type === 'decision' ? { ...node.data, status: 'accepted' } : node.data,
              }
            : node,
        ),
      })),

    moveNode: (id, position) =>
      set((state) => ({
        nodes: state.nodes.map((node) => (node.id === id ? { ...node, position } : node)),
      })),

    deleteNode: (id) =>
      set((state) => {
        const { nodes, edges } = removeNode(state.nodes, state.edges, id);
        return {
          nodes: nodes as DialogueNode[],
          edges,
          selectedIds: state.selectedIds.filter((s) => s !== id),
        };
      }),

    deleteEdge: (id) =>
      set((state) => ({ edges: state.edges.filter((edge) => edge.id !== id) })),

    deleteSelection: () => {
      const { selectedIds } = get();
      if (selectedIds.length === 0) return;

      get().recordHistory();
      const doomed = new Set(selectedIds);
      set((state) => ({
        nodes: state.nodes.filter((node) => !doomed.has(node.id)),
        edges: state.edges.filter(
          (edge) => !doomed.has(edge.source) && !doomed.has(edge.target),
        ),
        selectedIds: [],
      }));
    },

    validateConnection: (sourceId, targetId) => {
      if (sourceId === targetId) {
        return { valid: false, reason: 'A node cannot connect to itself.' };
      }

      const { nodes } = get();
      const source = nodes.find((n) => n.id === sourceId);
      const target = nodes.find((n) => n.id === targetId);
      if (!source || !target) {
        return { valid: false, reason: 'Invalid source or target node.' };
      }

      const allowed = ALLOWED_TARGETS[source.kind];
      if (allowed && !allowed.includes(target.kind)) {
        return { valid: false, reason: REASONS[source.kind] };
      }

      return { valid: true };
    },

    connectNodes: (source, target) => {
      const validation = get().validateConnection(source, target);
      if (!validation.valid) {
        set({ connectionError: validation.reason ?? 'Invalid connection' });
        return false;
      }

      set((state) => ({
        edges: [...state.edges, { id: nextId('edge', state.edges), source, target }],
      }));
      return true;
    },

    undoLayout: () => {
      const history = get().layoutHistory;
      if (history.length === 0) return;

      set({
        nodes: history[history.length - 1],
        layoutHistory: history.slice(0, -1),
      });
    },

    importMap: (jsonStr) => {
      try {
        const parsed = JSON.parse(jsonStr);
        if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) return false;

        set({ nodes: parsed.nodes, edges: parsed.edges, selectedIds: [] });
        return true;
      } catch (err) {
        console.error('Failed to parse dialogue map import', err);
        return false;
      }
    },

    exportMap: () => {
      const { nodes, edges } = get();
      return JSON.stringify({ nodes, edges }, null, 2);
    },
  }));

  globalFallbackStore ??= store;
  storeRegistry.set(mapId, store);
  return store;
};

/** The layouts this map offers, taken from the library rather than hand-rolled. */
export const DIALOGUE_LAYOUTS = {
  vertical: BUILT_IN_LAYOUTS.vertical,
  horizontal: BUILT_IN_LAYOUTS.horizontal,
};

/** Edges touching a node, for the inspector's connection count. */
export const connectionsOf = (edges: IGraphEdge[], nodeId: string) =>
  edgesOf(edges, nodeId);

/** A store hook for code that has no `mapId` to hand. Prefer `getMapStore`. */
export const useDialogueMappingStore: UseBoundStore<StoreApi<DialogueMappingState>> = ((
  ...args: unknown[]
) => {
  if (!globalFallbackStore) getMapStore('default');
  return (globalFallbackStore as never as (...a: unknown[]) => unknown)(...args);
}) as never;

useDialogueMappingStore.getState = () => {
  if (!globalFallbackStore) getMapStore('default');
  return globalFallbackStore!.getState();
};
