import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Connection, 
  addEdge, 
  applyNodeChanges, 
  applyEdgeChanges, 
  MarkerType, 
  SelectionMode, 
  type Node as FlowNode, 
  type Edge as FlowEdge 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { RotateCcw } from 'lucide-react';
import { useMockupReviewStore } from '../../../core/services/MockupReviewService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WorkflowMapperProps {
  setActiveTab: (tab: 'workflow' | 'review' | 'implementation') => void;
}

export const WorkflowMapper: React.FC<WorkflowMapperProps> = ({ setActiveTab }) => {
  const {
    nodes,
    edges,
    updateWorkflow,
    setViewParentId,
    setActiveViewId,
  } = useMockupReviewStore();

  const [dragMode, setDragMode] = useState<'pan' | 'select'>('pan');
  const [layoutHistory, setLayoutHistory] = useState<FlowNode[][]>([]);

  // 1. React Flow callback bindings
  const onNodesChange = useCallback(
    (changes: any) => {
      updateWorkflow(applyNodeChanges(changes, nodes), edges);
    },
    [nodes, edges, updateWorkflow]
  );

  const onEdgesChange = useCallback(
    (changes: any) => {
      updateWorkflow(nodes, applyEdgeChanges(changes, edges));
    },
    [nodes, edges, updateWorkflow]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const choice = window.prompt(
        "Select Connection Type:\n1. User Transition (default)\n2. Base Template Inheritance"
      );
      if (choice === null) return; // User cancelled

      if (choice.trim() === '2' || choice.toLowerCase().includes('inherit') || choice.toLowerCase().includes('template')) {
        // Source inherits template from Target: Source (Child) -> Target (Parent)
        if (params.source && params.target) {
          setViewParentId(params.source, params.target);
          const newEdge = {
            id: `inherit-${params.source}-${params.target}`,
            source: params.source,
            target: params.target,
            label: 'Inherits Template',
            style: { stroke: '#f59e0b', strokeDasharray: '5,5', strokeWidth: 1.5 },
            labelStyle: { fill: '#f59e0b', fontWeight: 600, fontSize: 10 },
            labelBgStyle: { fill: '#1e293b' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' }
          };
          updateWorkflow(nodes, addEdge(newEdge, edges));
        }
      } else {
        const label = window.prompt("Enter transition label (optional):") || "";
        const newEdge = {
          ...params,
          label,
          style: { stroke: '#38bdf8' },
          labelStyle: { fill: '#f8fafc', fontWeight: 600, fontSize: 10 },
          labelBgStyle: { fill: '#1e293b' }
        };
        updateWorkflow(nodes, addEdge(newEdge, edges));
      }
    },
    [nodes, edges, updateWorkflow, setViewParentId]
  );

  const handleNodeDoubleClick = (_event: React.MouseEvent, node: FlowNode) => {
    setActiveViewId(node.id);
    setActiveTab('review');
  };

  const handleEdgeDoubleClick = useCallback(
    (_event: React.MouseEvent, edge: FlowEdge) => {
      const newLabel = window.prompt("Edit Transition Label:", (edge.label as string) || "");
      if (newLabel !== null) {
        const updatedEdges = edges.map((e) => {
          if (e.id === edge.id) {
            return {
              ...e,
              label: newLabel,
            };
          }
          return e;
        });
        updateWorkflow(nodes, updatedEdges);
      }
    },
    [nodes, edges, updateWorkflow]
  );

  const handleNodeDragStart = useCallback(() => {
    setLayoutHistory((prev) => [...prev, nodes.map(n => ({ ...n, position: { ...n.position } }))]);
  }, [nodes]);

  const handleUndoLayout = useCallback(() => {
    if (layoutHistory.length === 0) return;
    const previous = layoutHistory[layoutHistory.length - 1];
    setLayoutHistory((prev) => prev.slice(0, -1));
    updateWorkflow(previous, edges);
  }, [layoutHistory, edges, updateWorkflow]);

  // Scoped keydown listener for layout undos
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (layoutHistory.length > 0) {
          e.preventDefault();
          handleUndoLayout();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [layoutHistory, handleUndoLayout]);

  const runAutoLayout = (layoutType: 'horizontal' | 'vertical' | 'grid') => {
    // Save current positions to history
    setLayoutHistory((prev) => [...prev, nodes.map(n => ({ ...n, position: { ...n.position } }))]);

    let updatedNodes = [...nodes];
    const spacingX = 260;
    const spacingY = 140;

    if (layoutType === 'grid') {
      updatedNodes.sort((a, b) => {
        const labelA = (a.data?.label as string) || '';
        const labelB = (b.data?.label as string) || '';
        return labelA.localeCompare(labelB);
      });
      const cols = 3;
      updatedNodes = updatedNodes.map((node, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        return {
          ...node,
          position: {
            x: 80 + col * spacingX,
            y: 80 + row * spacingY
          }
        };
      });
    } else {
      // Calculate depth levels (ranks) for horizontal / vertical flow
      const ranks: Record<string, number> = {};
      nodes.forEach((n) => { ranks[n.id] = 0; });

      // Run distance relaxation on transition edges
      const transitions = edges.filter((e) => !e.id.includes('inherit'));
      for (let i = 0; i < nodes.length; i++) {
        let changed = false;
        transitions.forEach((edge) => {
          const u = edge.source;
          const v = edge.target;
          if (ranks[u] !== undefined && ranks[v] !== undefined) {
            if (ranks[v] < ranks[u] + 1) {
              ranks[v] = ranks[u] + 1;
              changed = true;
            }
          }
        });
        if (!changed) break;
      }

      // Group nodes by computed rank
      const rankGroups: Record<number, FlowNode[]> = {};
      nodes.forEach((node) => {
        const r = ranks[node.id] || 0;
        if (!rankGroups[r]) rankGroups[r] = [];
        rankGroups[r].push(node);
      });

      // Align positions based on rank flow direction
      updatedNodes = updatedNodes.map((node) => {
        const rank = ranks[node.id] || 0;
        const group = rankGroups[rank] || [];
        const indexInGroup = group.findIndex((n) => n.id === node.id);

        if (layoutType === 'horizontal') {
          return {
            ...node,
            position: {
              x: 80 + rank * spacingX,
              y: 80 + indexInGroup * spacingY
            }
          };
        } else {
          return {
            ...node,
            position: {
              x: 80 + indexInGroup * spacingX,
              y: 80 + rank * spacingY
            }
          };
        }
      });
    }

    updateWorkflow(updatedNodes, edges);
  };

  return (
    <div className="flex-1 h-full w-full bg-card overflow-hidden relative">
      {/* Auto-Layout Controls & Drag Mode Toggles */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-card/90 backdrop-blur-sm p-1.5 rounded-lg border border-border shadow-lg select-none">
        <span className="text-[10px] uppercase font-bold text-muted-foreground px-2 font-mono">Drag Mode:</span>
        <button
          onClick={() => setDragMode('pan')}
          className={cn(
            "px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors border border-transparent",
            dragMode === 'pan' ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-accent text-muted-foreground"
          )}
          title="Pan Canvas Mode"
        >
          Pan
        </button>
        <button
          onClick={() => setDragMode('select')}
          className={cn(
            "px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors border border-transparent",
            dragMode === 'select' ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-accent text-muted-foreground"
          )}
          title="Box Selection Mode (Drag marquee to multi-select)"
        >
          Box Select
        </button>

        <div className="w-[1px] h-4 bg-border mx-1" />
        <span className="text-[10px] uppercase font-bold text-muted-foreground px-1 font-mono">Layout:</span>
        <button
          onClick={() => runAutoLayout('horizontal')}
          className="px-2 py-1 rounded hover:bg-accent text-foreground text-xs font-semibold border border-transparent flex items-center gap-1"
          title="Horizontal Flow Layout"
        >
          Horizontal
        </button>
        <button
          onClick={() => runAutoLayout('vertical')}
          className="px-2 py-1 rounded hover:bg-accent text-foreground text-xs font-semibold border border-transparent flex items-center gap-1"
          title="Vertical Flow Layout"
        >
          Vertical
        </button>
        <button
          onClick={() => runAutoLayout('grid')}
          className="px-2 py-1 rounded hover:bg-accent text-foreground text-xs font-semibold border border-transparent flex items-center gap-1"
          title="Grid Dashboard Layout"
        >
          Grid
        </button>
        <button
          onClick={handleUndoLayout}
          disabled={layoutHistory.length === 0}
          className={cn(
            "p-1 rounded border border-transparent transition-colors",
            layoutHistory.length === 0 ? "opacity-30 cursor-not-allowed text-muted-foreground" : "hover:bg-accent text-primary"
          )}
          title="Undo Last Node Move or Layout (Control+Z)"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={handleNodeDragStart}
        onNodeDoubleClick={handleNodeDoubleClick}
        onEdgeDoubleClick={handleEdgeDoubleClick}
        panOnDrag={dragMode === 'pan'}
        selectionOnDrag={dragMode === 'select'}
        selectionMode={SelectionMode.Partial}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#334155" gap={16} />
        <Controls />
        <MiniMap 
          nodeColor="#1e293b" 
          maskColor="rgba(15, 23, 42, 0.7)"
          style={{ background: '#0f172a', border: '1px solid #334155' }}
        />
      </ReactFlow>
    </div>
  );
};
