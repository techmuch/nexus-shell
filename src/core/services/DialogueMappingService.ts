import { create, StoreApi, UseBoundStore } from 'zustand';
import { Node, Edge, Connection, MarkerType } from 'reactflow';

export type IbisNodeType = 'question' | 'idea' | 'pro' | 'con' | 'note' | 'decision' | 'link' | 'image' | 'map';

export interface IDialogueNodeData {
  id: string;
  type: IbisNodeType;
  title: string;
  description?: string;
  tags?: string[];
  author?: string;
  timestamp: string;
  status?: 'pending' | 'accepted' | 'rejected';
  url?: string;
  imageUrl?: string;
  autoEdit?: boolean;
  freeformPosition?: { x: number; y: number };
}

interface DialogueMappingState {
  nodes: Node<IDialogueNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  layoutHistory: Node<IDialogueNodeData>[][];
  autoLayoutMode: 'vertical' | 'horizontal' | 'freeform';
  setAutoLayoutMode: (mode: 'vertical' | 'horizontal' | 'freeform') => void;
  setNodes: (nodes: Node<IDialogueNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  addNode: (type: IbisNodeType, position: { x: number; y: number }, parentNodeId?: string | null) => void;
  updateNodeData: (id: string, updates: Partial<IDialogueNodeData>) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;
  pasteNode: (type: IbisNodeType, position: { x: number; y: number }, initialData: Partial<IDialogueNodeData>) => void;
  connectNodes: (connection: Connection) => boolean;
  validateConnection: (sourceId: string, targetId: string) => { valid: boolean; reason?: string };
  triggerAutoLayout: (direction: 'vertical' | 'horizontal' | 'grid') => void;
  undoLayout: () => void;
  connectionError: string | null;
  setConnectionError: (error: string | null) => void;
  recordHistory: () => void;
  importMap: (jsonStr: string) => boolean;
  exportMap: () => string;
}

// Export a default fallback for non-map-specific usages if needed
export let globalFallbackStore: UseBoundStore<StoreApi<DialogueMappingState>> | null = null;

const storeRegistry = new Map<string | undefined, UseBoundStore<StoreApi<DialogueMappingState>>>();

export const getMapStore = (mapId?: string): UseBoundStore<StoreApi<DialogueMappingState>> => {
  if (!storeRegistry.has(mapId)) {
    const newStore = create<DialogueMappingState>((set, get) => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      layoutHistory: [],
      autoLayoutMode: 'vertical',
      setAutoLayoutMode: (mode) => {
        set({ autoLayoutMode: mode });
        if (mode === 'freeform') {
          set((state) => ({
            nodes: state.nodes.map((n) => {
              if (n.data.freeformPosition) {
                return { ...n, position: { ...n.data.freeformPosition } };
              }
              return n;
            }),
          }));
        } else {
          get().triggerAutoLayout(mode);
        }
      },
      connectionError: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
  setConnectionError: (connectionError) => set({ connectionError }),
  recordHistory: () => {
    const { nodes } = get();
    set((state) => ({
      layoutHistory: [...state.layoutHistory, JSON.parse(JSON.stringify(nodes))],
    }));
  },

  addNode: (type, position, parentNodeId) => {
    const id = `node-${Date.now()}`;
    const newNode: Node<IDialogueNodeData> = {
      id,
      type: 'ibisNode',
      position,
      width: 240,
      height: 182,
      data: {
        id,
        type,
        title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        description: '',
        tags: [],
        author: 'user',
        timestamp: new Date().toLocaleString(),
        status: type === 'question' || type === 'idea' ? 'pending' : undefined,
        autoEdit: true,
      },
    };
    set((state) => {
      const nextNodes = [...state.nodes, newNode];
      const nextEdges = [...state.edges];

      if (parentNodeId) {
        // Find if parent exists
        const parentNode = state.nodes.find((n) => n.id === parentNodeId);
        if (parentNode) {
          // Determine edge direction using local semantics to avoid store get() sync delays
          // The user expects newly spawned nodes to be children of the selected node
          let isValid = true;
          let source = parentNodeId;
          let target = id;

          const parentType = parentNode.data.type;
          const newType = type;

          // Only reverse the relationship if it's a strict IBIS violation that demands New -> Parent
          if (newType === 'decision' && parentType === 'question') {
            source = id;
            target = parentNodeId;
          } else if ((newType === 'pro' || newType === 'con') && parentType === 'decision') {
            source = id;
            target = parentNodeId;
          }
          if (isValid) {
            const strokeColor = '#64748b'; // common slate edge color

            const edgeId = `edge-${source}-${target}-${Date.now()}`;
            nextEdges.push({
              id: edgeId,
              source,
              target,
              type: 'straight',
              style: { stroke: strokeColor, strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: strokeColor },
            });
          }
        }
      }

      return {
        nodes: nextNodes.map((n) => ({
          ...n,
          selected: n.id === id,
        })),
        edges: nextEdges,
        selectedNodeId: id,
      };
    });

    const mode = get().autoLayoutMode;
    if (mode !== 'freeform') {
      // Delay slightly to ensure ReactFlow receives the new node before layout runs
      setTimeout(() => {
        get().triggerAutoLayout(mode);
      }, 10);
    }
  },

  updateNodeData: (id, updates) => {
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === id) {
          // If updates includes a type change to 'decision', set status to 'accepted'
          const finalUpdates = { ...updates };
          if (updates.type === 'decision') {
            finalUpdates.status = 'accepted';
          }
          return {
            ...node,
            data: { ...node.data, ...finalUpdates },
          };
        }
        return node;
      }),
    }));
  },

  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }));
    const mode = get().autoLayoutMode;
    if (mode !== 'freeform') {
      setTimeout(() => get().triggerAutoLayout(mode), 10);
    }
  },

  deleteEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    }));
    const mode = get().autoLayoutMode;
    if (mode !== 'freeform') {
      setTimeout(() => get().triggerAutoLayout(mode), 10);
    }
  },

  pasteNode: (type, position, initialData) => {
    const id = `node-${Date.now()}`;
    const newNode: Node<IDialogueNodeData> = {
      id,
      type: 'ibisNode',
      position,
      width: 240,
      height: 182,
      data: {
        id,
        type,
        title: initialData.title || `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        description: initialData.description || '',
        tags: initialData.tags || [],
        author: initialData.author || 'user',
        timestamp: new Date().toLocaleString(),
        status: initialData.status,
        url: initialData.url,
        imageUrl: initialData.imageUrl,
        autoEdit: false,
      },
    };
    set((state) => ({
      nodes: [...state.nodes.map((n) => ({ ...n, selected: false })), { ...newNode, selected: true }],
      selectedNodeId: id,
    }));
  },

  validateConnection: (sourceId, targetId) => {
    const { nodes } = get();
    const sourceNode = nodes.find((n) => n.id === sourceId);
    const targetNode = nodes.find((n) => n.id === targetId);

    if (!sourceNode || !targetNode) {
      return { valid: false, reason: 'Invalid source or target node.' };
    }

    const source = sourceNode.data;
    const target = targetNode.data;

    if (sourceId === targetId) {
      return { valid: false, reason: 'A node cannot connect to itself.' };
    }

    // IBIS Semantics
    if (source.type === 'pro' || source.type === 'con') {
      if (target.type !== 'idea' && target.type !== 'decision') {
        return { valid: false, reason: 'Arguments (Pros/Cons) must target Ideas or Decisions.' };
      }
    }

    if (source.type === 'idea') {
      if (target.type !== 'question' && target.type !== 'idea') {
        return { valid: false, reason: 'Ideas must respond to Questions or expand other Ideas.' };
      }
    }

    if (source.type === 'decision') {
      if (target.type !== 'question') {
        return { valid: false, reason: 'Decisions must resolve Questions.' };
      }
    }

    return { valid: true };
  },

  connectNodes: (connection) => {
    const { source, target } = connection;
    if (!source || !target) return false;

    const validation = get().validateConnection(source, target);
    if (!validation.valid) {
      set({ connectionError: validation.reason || 'Invalid connection' });
      return false;
    }

    const strokeColor = '#64748b'; // common slate edge color

    const edgeId = `edge-${source}-${target}-${Date.now()}`;
    const newEdge: Edge = {
      id: edgeId,
      source,
      target,
      type: 'straight',
      style: { stroke: strokeColor, strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: strokeColor },
    };

    set((state) => ({
      edges: [...state.edges, newEdge],
    }));

    const mode = get().autoLayoutMode;
    if (mode !== 'freeform') {
      setTimeout(() => get().triggerAutoLayout(mode), 10);
    }

    return true;
  },

  triggerAutoLayout: (direction) => {
    get().recordHistory();
    const { nodes } = get();

    // Topological Layout algorithm
    // 1. Find root nodes (nodes with 0 incoming edges)
    const incomingEdgeCounts: Record<string, number> = {};
    nodes.forEach((n) => {
      incomingEdgeCounts[n.id] = 0;
    });
    get().edges.forEach((e) => {
      if (incomingEdgeCounts[e.target] !== undefined) {
        incomingEdgeCounts[e.target]++;
      }
    });

    // 2. BFS to resolve layering/depth
    const levels: Record<string, number> = {};
    const queue: string[] = [];
    nodes.forEach((n) => {
      if (incomingEdgeCounts[n.id] === 0) {
        levels[n.id] = 0;
        queue.push(n.id);
      }
    });

    // Fallback if there are cycles: initialize all unassigned nodes to level 0
    if (queue.length === 0 && nodes.length > 0) {
      levels[nodes[0].id] = 0;
      queue.push(nodes[0].id);
    }

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentLevel = levels[currentId] || 0;
      
      const outgoingEdges = get().edges.filter((e) => e.source === currentId);
      outgoingEdges.forEach((e) => {
        const nextId = e.target;
        const nextLevel = levels[nextId];
        if (nextLevel === undefined || nextLevel < currentLevel + 1) {
          levels[nextId] = currentLevel + 1;
          queue.push(nextId);
        }
      });
    }

    // Group nodes by levels
    const nodesByLevel: Record<number, string[]> = {};
    nodes.forEach((n) => {
      const lvl = levels[n.id] !== undefined ? levels[n.id] : 0;
      if (!nodesByLevel[lvl]) {
        nodesByLevel[lvl] = [];
      }
      nodesByLevel[lvl].push(n.id);
    });

    // Calculate layout coordinates
    const spacingX = 320;
    const spacingY = 250;

    const newNodes = nodes.map((node) => {
      const lvl = levels[node.id] !== undefined ? levels[node.id] : 0;
      const levelNodes = nodesByLevel[lvl];
      const index = levelNodes.indexOf(node.id);
      const totalInLevel = levelNodes.length;

      let position = { x: node.position.x, y: node.position.y };

      if (direction === 'vertical') {
        // Center-aligned tree layout
        const offset = ((totalInLevel - 1) * spacingX) / 2;
        position = {
          x: 400 + index * spacingX - offset,
          y: 50 + lvl * spacingY,
        };
      } else if (direction === 'horizontal') {
        // Left-to-right hierarchy layout
        const offset = ((totalInLevel - 1) * spacingY) / 2;
        position = {
          x: 50 + lvl * spacingX,
          y: 300 + index * spacingY - offset,
        };
      } else if (direction === 'grid') {
        // Grid organization
        const cols = 3;
        const col = index % cols;
        const row = Math.floor(index / cols);
        position = {
          x: 50 + col * spacingX + lvl * 100,
          y: 50 + row * spacingY + lvl * 150,
        };
      }

      return {
        ...node,
        position,
      };
    });

    set({ nodes: newNodes });
  },

  undoLayout: () => {
    const history = get().layoutHistory;
    if (history.length === 0) return;

    const previousNodes = history[history.length - 1];
    set({
      nodes: previousNodes,
      layoutHistory: history.slice(0, -1),
    });
  },

  importMap: (jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
        set({
          nodes: parsed.nodes.map((n: any) => ({ ...n, selected: false })),
          edges: parsed.edges,
          selectedNodeId: null,
        });
        return true;
      }
      return false;
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
  
  if (!globalFallbackStore) {
    globalFallbackStore = newStore;
  }
  
  storeRegistry.set(mapId, newStore);
  }
  return storeRegistry.get(mapId)!;
};

// Re-export a hook for backward compatibility if needed, but components should use getMapStore instead.
export const useDialogueMappingStore: UseBoundStore<StoreApi<DialogueMappingState>> = ((...args: any[]) => {
  if (!globalFallbackStore) {
    getMapStore('default');
  }
  return (globalFallbackStore as any)(...args);
}) as any;

// Add a getState method to the wrapper for compatibility
useDialogueMappingStore.getState = () => {
  if (!globalFallbackStore) {
    getMapStore('default');
  }
  return globalFallbackStore!.getState();
};
