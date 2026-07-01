import React, { useMemo, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  Handle,
  Position,
  NodeProps,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWikiStore } from '../../../core/services/useWikiStore';
import { Network } from 'lucide-react';

const WikiNode = ({ data, selected }: NodeProps) => {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-[var(--card)] border-2 transition-transform ${
      selected ? 'border-indigo-500 scale-110 shadow-lg shadow-indigo-500/20' : 'border-[var(--border)]'
    }`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div className="font-semibold text-sm text-[var(--foreground)]">{data.label}</div>
      <div className="text-[10px] text-[var(--muted-foreground)] capitalize">{data.status}</div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
};

const nodeTypes = { wikiNode: WikiNode };

export const SemanticLinkMapper: React.FC = () => {
  const { pages, setActivePage } = useWikiStore();

  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = Object.values(pages).map((p, i) => ({
      id: p.id,
      type: 'wikiNode',
      position: { x: 250 + (i % 3) * 200, y: 100 + Math.floor(i / 3) * 150 },
      data: { label: p.title, status: p.status, pageId: p.id },
    }));

    const edges: Edge[] = [];
    if (nodes.length > 1) {
      edges.push({
        id: 'e-1-2',
        source: 'p-1',
        target: 'p-2',
        type: 'straight',
        animated: true,
        label: 'Suggest Link (AI)',
        style: { stroke: '#fbbf24', strokeDasharray: '5,5' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#fbbf24' }
      });
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [pages]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (node.data.pageId) {
      setActivePage(node.data.pageId);
    }
  }, [setActivePage]);

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <div className="flex items-center gap-2 p-3 border-b border-[var(--border)]">
        <Network className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
          Semantic Knowledge Graph
        </span>
      </div>
      <div className="flex-1 w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          className="bg-[var(--background)]"
        >
          <Background color="var(--border)" gap={20} size={1} />
          <Controls className="fill-[var(--foreground)] bg-[var(--card)] border border-[var(--border)]" />
        </ReactFlow>
      </div>
    </div>
  );
};
