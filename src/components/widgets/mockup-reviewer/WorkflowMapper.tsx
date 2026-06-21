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
import { useMockupReviewStore } from '../../../core/services/MockupReviewService';
import { FlowControlToolbar } from '../FlowControlToolbar';

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



  return (
    <div className="flex-1 h-full w-full bg-card overflow-hidden relative">
      {/* Auto-Layout Controls & Drag Mode Toggles */}
      <FlowControlToolbar
        variant="floating"
        dragMode={dragMode}
        onDragModeChange={setDragMode}
        autoLayoutMode="freeform"
        onAutoLayoutModeChange={() => {}}
        onUndo={() => {}}
        canUndo={false}
        className="absolute top-4 right-4 z-50 bg-background/95 shadow-xl border-border/80"
      />

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
