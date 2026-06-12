import { create } from 'zustand';
import { Node, Edge, Connection } from 'reactflow';

export type IbisNodeType = 'question' | 'idea' | 'pro' | 'con' | 'note' | 'decision';

export interface IDialogueNodeData {
  id: string;
  type: IbisNodeType;
  title: string;
  description?: string;
  tags?: string[];
  author?: string;
  timestamp: string;
  status?: 'pending' | 'accepted' | 'rejected';
}

interface DialogueMappingState {
  nodes: Node<IDialogueNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  layoutHistory: Node<IDialogueNodeData>[][];
  setNodes: (nodes: Node<IDialogueNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  addNode: (type: IbisNodeType, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, updates: Partial<IDialogueNodeData>) => void;
  deleteNode: (id: string) => void;
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

// Preload a sample IBIS Argumentation map
const initialNodes: Node<IDialogueNodeData>[] = [
  {
    id: 'node-1',
    type: 'ibisNode',
    position: { x: 400, y: 50 },
    width: 240,
    height: 182,
    data: {
      id: 'node-1',
      type: 'question',
      title: 'Which communication model should we use for real-time state sync?',
      description: 'We need to keep client workbench layouts synchronized with low overhead.',
      tags: ['architecture', 'sync'],
      author: 'admin',
      timestamp: new Date().toLocaleString(),
      status: 'pending',
    },
  },
  {
    id: 'node-2',
    type: 'ibisNode',
    position: { x: 200, y: 200 },
    width: 240,
    height: 182,
    data: {
      id: 'node-2',
      type: 'idea',
      title: 'WebSockets with a custom state protocol',
      description: 'Persistent bi-directional connection using JSON framing.',
      tags: ['websockets', 'low-latency'],
      author: 'engineer-1',
      timestamp: new Date().toLocaleString(),
      status: 'pending',
    },
  },
  {
    id: 'node-3',
    type: 'ibisNode',
    position: { x: 80, y: 350 },
    width: 240,
    height: 182,
    data: {
      id: 'node-3',
      type: 'pro',
      title: 'Extremely low latency (sub-10ms)',
      description: 'Ideal for frequent slider drags or text syncing.',
      tags: ['performance'],
      author: 'engineer-1',
      timestamp: new Date().toLocaleString(),
    },
  },
  {
    id: 'node-4',
    type: 'ibisNode',
    position: { x: 260, y: 350 },
    width: 240,
    height: 182,
    data: {
      id: 'node-4',
      type: 'con',
      title: 'Requires sticky sessions on load balancers',
      description: 'Increases backend routing complexity.',
      tags: ['deployment'],
      author: 'devops',
      timestamp: new Date().toLocaleString(),
    },
  },
  {
    id: 'node-5',
    type: 'ibisNode',
    position: { x: 600, y: 200 },
    width: 240,
    height: 182,
    data: {
      id: 'node-5',
      type: 'idea',
      title: 'Server-Sent Events (SSE) with HTTP/2 multiplexing',
      description: 'Uni-directional push channel paired with standard POST actions.',
      tags: ['sse', 'http2'],
      author: 'engineer-2',
      timestamp: new Date().toLocaleString(),
      status: 'accepted',
    },
  },
  {
    id: 'node-6',
    type: 'ibisNode',
    position: { x: 480, y: 350 },
    width: 240,
    height: 182,
    data: {
      id: 'node-6',
      type: 'pro',
      title: 'Automatic reconnection out-of-the-box',
      description: 'Managed by browser standard EventSource API.',
      tags: ['reliability'],
      author: 'engineer-2',
      timestamp: new Date().toLocaleString(),
    },
  },
  {
    id: 'node-7',
    type: 'ibisNode',
    position: { x: 680, y: 350 },
    width: 240,
    height: 182,
    data: {
      id: 'node-7',
      type: 'note',
      title: 'SSE Benchmark Study link: web.dev/sse',
      description: 'Shows lower battery consumption on mobile devices compared to WebSockets.',
      tags: ['reference'],
      author: 'researcher',
      timestamp: new Date().toLocaleString(),
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'edge-1-2', source: 'node-1', target: 'node-2', type: 'smoothstep', style: { stroke: '#818cf8', strokeWidth: 2 } },
  { id: 'edge-2-3', source: 'node-2', target: 'node-3', type: 'smoothstep', style: { stroke: '#4ade80', strokeWidth: 2 } },
  { id: 'edge-2-4', source: 'node-2', target: 'node-4', type: 'smoothstep', style: { stroke: '#f87171', strokeWidth: 2 } },
  { id: 'edge-1-5', source: 'node-1', target: 'node-5', type: 'smoothstep', style: { stroke: '#818cf8', strokeWidth: 2 } },
  { id: 'edge-5-6', source: 'node-5', target: 'node-6', type: 'smoothstep', style: { stroke: '#4ade80', strokeWidth: 2 } },
  { id: 'edge-5-7', source: 'node-5', target: 'node-7', type: 'smoothstep', style: { stroke: '#fbbf24', strokeWidth: 2 } },
];

export const useDialogueMappingStore = create<DialogueMappingState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNodeId: null,
  layoutHistory: [],
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

  addNode: (type, position) => {
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
      },
    };
    set((state) => ({
      nodes: [...state.nodes, newNode],
      selectedNodeId: id,
    }));
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

    // Set connection stroke style based on source argument type
    const sourceNode = get().nodes.find((n) => n.id === source);
    let strokeColor = '#818cf8'; // default purple/indigo
    if (sourceNode?.data.type === 'pro') strokeColor = '#4ade80'; // green
    if (sourceNode?.data.type === 'con') strokeColor = '#f87171'; // red
    if (sourceNode?.data.type === 'note') strokeColor = '#fbbf24'; // amber

    const edgeId = `edge-${source}-${target}-${Date.now()}`;
    const newEdge: Edge = {
      id: edgeId,
      source,
      target,
      type: 'smoothstep',
      style: { stroke: strokeColor, strokeWidth: 2 },
    };

    set((state) => ({
      edges: [...state.edges, newEdge],
    }));

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
    const spacingX = 260;
    const spacingY = 150;

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
          nodes: parsed.nodes,
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
