import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Connection,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TabNode } from 'flexlayout-react';

import { 
  Undo2, 
  Download, 
  Upload, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  HelpCircle, 
  Lightbulb, 
  Plus, 
  Minus, 
  FileText, 
  Check,
  AlertCircle,
  Tag,
  Maximize2,
  Link2,
  Image as ImageIcon,
  Folder
} from 'lucide-react';

import { useDialogueMappingStore, IbisNodeType } from '../../core/services/DialogueMappingService';
import { IbisNode } from './dialogue-mapper/IbisNode';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DialogueMappingWidget: React.FC<{ node?: TabNode }> = ({ node }) => {
  return (
    <ReactFlowProvider>
      <DialogueMappingCanvas node={node} />
    </ReactFlowProvider>
  );
};

const DialogueMappingCanvas: React.FC<{ node?: TabNode }> = ({ node }) => {
  const nodeTypes = React.useMemo(() => ({
    ibisNode: IbisNode,
  }), []);

  if (typeof window !== 'undefined') {
    (window as any).useDialogueMappingStore = useDialogueMappingStore;
  }

  const {
    nodes,
    edges,
    selectedNodeId,
    layoutHistory,
    connectionError,
    setConnectionError,
    recordHistory,
    setNodes,
    setEdges,
    addNode,
    updateNodeData,
    deleteNode,
    connectNodes,
    triggerAutoLayout,
    undoLayout,
    setSelectedNodeId,
    importMap,
    exportMap,
  } = useDialogueMappingStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const reactFlowInstance = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Right drag link connection states
  const [rightDragStartNodeId, setRightDragStartNodeId] = useState<string | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<{ clientX: number; clientY: number } | null>(null);
  const preventNextContextMenuRef = useRef(false);
  const wasRightPressedOnNodeRef = useRef(false);

  // UI Panels state
  const [showLibrary, setShowLibrary] = useState(true);
  const [showInspector, setShowInspector] = useState(true);

  // Scoped keydown listener for layout undos and Compendium shortcuts
  useEffect(() => {
    const focusAndScrollToNode = (targetNodeId: string) => {
      setSelectedNodeId(targetNodeId);
      setNodes(
        nodes.map((n) => ({
          ...n,
          selected: n.id === targetNodeId,
        }))
      );

      const targetNode = nodes.find((n) => n.id === targetNodeId);
      if (targetNode && containerRef.current) {
        const { x: vx, y: vy, zoom: vz } = reactFlowInstance.getViewport();
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        const nx = targetNode.position.x;
        const ny = targetNode.position.y;
        
        const nodeWidth = targetNode.width || 240;
        const nodeHeight = targetNode.height || 182;

        const nodeLeft = nx * vz + vx;
        const nodeRight = (nx + nodeWidth) * vz + vx;
        const nodeTop = ny * vz + vy;
        const nodeBottom = (ny + nodeHeight) * vz + vy;

        const margin = 80;
        const isFullyVisible = (
          nodeLeft >= margin &&
          nodeRight <= containerWidth - margin &&
          nodeTop >= margin &&
          nodeBottom <= containerHeight - margin
        );

        if (!isFullyVisible) {
          const isPartiallyVisible = (
            nodeRight >= 0 &&
            nodeLeft <= containerWidth &&
            nodeBottom >= 0 &&
            nodeTop <= containerHeight
          );

          if (isPartiallyVisible) {
            let newVx = vx;
            let newVy = vy;

            if (nodeLeft < margin) {
              newVx = vx + (margin - nodeLeft);
            } else if (nodeRight > containerWidth - margin) {
              newVx = vx - (nodeRight - (containerWidth - margin));
            }

            if (nodeTop < margin) {
              newVy = vy + (margin - nodeTop);
            } else if (nodeBottom > containerHeight - margin) {
              newVy = vy - (nodeBottom - (containerHeight - margin));
            }

            reactFlowInstance.setViewport({ x: newVx, y: newVy, zoom: vz }, { duration: 200 });
          } else {
            reactFlowInstance.setCenter(nx + nodeWidth / 2, ny + nodeHeight / 2, { zoom: vz, duration: 200 });
          }
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if this tab is active
      if (node && !node.isVisible()) {
        return;
      }

      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable
      ) {
        return;
      }

      // Escape -> Cancel active right-click drag-linking
      if (e.key === 'Escape') {
        if (rightDragStartNodeId) {
          e.preventDefault();
          setRightDragStartNodeId(null);
          setCurrentMousePos(null);
          wasRightPressedOnNodeRef.current = false;
          return;
        }
      }

      // Arrow keys navigation
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (selectedNodeId) {
          const currentNode = nodes.find((n) => n.id === selectedNodeId);
          if (currentNode) {
            const cx = currentNode.position.x;
            const cy = currentNode.position.y;
            
            let bestNodeId: string | null = null;
            let minMetric = Infinity;
            
            nodes.forEach((n) => {
              if (n.id === selectedNodeId) return;
              const nx = n.position.x;
              const ny = n.position.y;
              const dx = nx - cx;
              const dy = ny - cy;
              
              let isValid = false;
              let metric = Infinity;
              
              if (e.key === 'ArrowRight') {
                if (dx > 10) {
                  isValid = true;
                  metric = dx + 2 * Math.abs(dy);
                }
              } else if (e.key === 'ArrowLeft') {
                if (dx < -10) {
                  isValid = true;
                  metric = -dx + 2 * Math.abs(dy);
                }
              } else if (e.key === 'ArrowUp') {
                if (dy < -10) {
                  isValid = true;
                  metric = -dy + 2 * Math.abs(dx);
                }
              } else if (e.key === 'ArrowDown') {
                if (dy > 10) {
                  isValid = true;
                  metric = dy + 2 * Math.abs(dx);
                }
              }
              
              if (isValid && metric < minMetric) {
                minMetric = metric;
                bestNodeId = n.id;
              }
            });
            
            if (bestNodeId) {
              focusAndScrollToNode(bestNodeId);
            }
          }
        } else {
          // Fallback: select first node
          if (nodes.length > 0) {
            focusAndScrollToNode(nodes[0].id);
          }
        }
        return;
      }

      // Cmd/Ctrl + Z -> Undo Layout
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (layoutHistory.length > 0) {
          e.preventDefault();
          undoLayout();
        }
        return;
      }

      // Ignore shortcut key combos with modifiers like Cmd/Ctrl/Alt
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      let type: IbisNodeType | null = null;
      if (e.key === 'q' || e.key === '?') type = 'question';
      else if (e.key === 'a' || e.key === '!') type = 'idea';
      else if (e.key === 'p' || e.key === '+') type = 'pro';
      else if (e.key === 'c' || e.key === '-') type = 'con';
      else if (e.key === 'n') type = 'note';
      else if (e.key === 'd') type = 'decision';
      else if (e.key === 'l') type = 'link';
      else if (e.key === 'i') type = 'image';
      else if (e.key === 'm') type = 'map';

      if (type) {
        e.preventDefault();
        // If a node is selected, position new node below it and link them
        if (selectedNodeId) {
          const selectedNode = nodes.find((n) => n.id === selectedNodeId);
          if (selectedNode) {
            const xOffset = (Math.random() - 0.5) * 40;
            const newPos = {
              x: selectedNode.position.x + xOffset,
              y: selectedNode.position.y + 250,
            };
            addNode(type, newPos, selectedNodeId);
            return;
          }
        }
        // Otherwise position near center
        const offset = Math.random() * 50;
        addNode(type, { x: 350 + offset, y: 150 + offset });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [node, layoutHistory, undoLayout, addNode, selectedNodeId, nodes, rightDragStartNodeId]);

  // Connection warning auto-clear
  useEffect(() => {
    if (connectionError) {
      const timer = setTimeout(() => {
        setConnectionError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [connectionError, setConnectionError]);
  
  // Node editing state in Inspector
  const activeNode = nodes.find((n) => n.id === selectedNodeId) || null;
  const [newTag, setNewTag] = useState('');

  // Handle nodes/edges movements from canvas
  const onNodesChange = useCallback(
    (changes: any) => {
      // Direct node position updates
      const updatedNodes = [...nodes];
      changes.forEach((change: any) => {
        if (change.type === 'position' && change.position) {
          const idx = updatedNodes.findIndex((n) => n.id === change.id);
          if (idx !== -1) {
            updatedNodes[idx] = {
              ...updatedNodes[idx],
              position: change.position,
            };
          }
        }
      });
      setNodes(updatedNodes);
    },
    [nodes, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: any) => {
      const updatedEdges = [...edges];
      changes.forEach((change: any) => {
        if (change.type === 'remove') {
          const idx = updatedEdges.findIndex((e) => e.id === change.id);
          if (idx !== -1) {
            updatedEdges.splice(idx, 1);
          }
        }
      });
      setEdges(updatedEdges);
    },
    [edges, setEdges]
  );

  // Link drawing completion
  const onConnect = useCallback(
    (connection: Connection) => {
      connectNodes(connection);
    },
    [connectNodes]
  );

  useEffect(() => {
    const domNode = containerRef.current;
    if (!domNode) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) { // right-click
        const target = e.target as HTMLElement;
        const nodeEl = target.closest('.react-flow__node');
        if (nodeEl) {
          const nodeId = nodeEl.getAttribute('data-id');
          if (nodeId) {
            setRightDragStartNodeId(nodeId);
            setCurrentMousePos({ clientX: e.clientX, clientY: e.clientY });
            wasRightPressedOnNodeRef.current = true;
          }
        }
      } else {
        wasRightPressedOnNodeRef.current = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (rightDragStartNodeId) {
        setCurrentMousePos({ clientX: e.clientX, clientY: e.clientY });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2 && rightDragStartNodeId) {
        const target = e.target as HTMLElement;
        const nodeEl = target.closest('.react-flow__node');
        if (nodeEl) {
          const nodeId = nodeEl.getAttribute('data-id');
          if (nodeId && nodeId !== rightDragStartNodeId) {
            connectNodes({ 
              source: rightDragStartNodeId, 
              target: nodeId,
              sourceHandle: null,
              targetHandle: null
            });
            preventNextContextMenuRef.current = true;
          }
        }
      }
      setRightDragStartNodeId(null);
      setCurrentMousePos(null);
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (wasRightPressedOnNodeRef.current || preventNextContextMenuRef.current) {
        e.preventDefault();
        preventNextContextMenuRef.current = false;
        wasRightPressedOnNodeRef.current = false;
      }
    };

    const handleDoubleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.react-flow__node') || target.closest('.react-flow__controls') || target.closest('.react-flow__minimap')) {
        return;
      }

      const rect = domNode.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const projectedPos = reactFlowInstance.project({ x, y });
      addNode('question', projectedPos);
    };

    domNode.addEventListener('mousedown', handleMouseDown);
    domNode.addEventListener('dblclick', handleDoubleClick);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu, { capture: true });

    return () => {
      domNode.removeEventListener('mousedown', handleMouseDown);
      domNode.removeEventListener('dblclick', handleDoubleClick);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
    };
  }, [rightDragStartNodeId, connectNodes, reactFlowInstance, addNode]);

  const handleExport = () => {
    const jsonStr = exportMap();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dialogue-map-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const success = importMap(result);
      if (!success) {
        alert("Failed to import dialogue map. Ensure it is a valid JSON file with nodes and edges.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // clear
  };

  // Add node from library panel click
  const handleAddNodeFromLibrary = (type: IbisNodeType) => {
    // Add in the center of the canvas
    addNode(type, { x: 350 + Math.random() * 50, y: 150 + Math.random() * 50 });
  };

  const handleAddTag = () => {
    if (!activeNode || !newTag.trim()) return;
    const currentTags = activeNode.data.tags || [];
    if (!currentTags.includes(newTag.trim().toLowerCase())) {
      updateNodeData(activeNode.id, {
        tags: [...currentTags, newTag.trim().toLowerCase()],
      });
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!activeNode) return;
    const currentTags = activeNode.data.tags || [];
    updateNodeData(activeNode.id, {
      tags: currentTags.filter((t) => t !== tagToRemove),
    });
  };

  return (
    <div className="flex w-full h-full overflow-hidden bg-background/95 text-foreground relative select-none font-sans">
      {/* File Input for Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Connection Warning Banner */}
      {connectionError && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-destructive/15 text-destructive border border-destructive/30 px-4 py-2 rounded-lg shadow-xl backdrop-blur flex items-center gap-2 text-xs font-semibold animate-slide-in-down select-text">
          <AlertCircle size={15} />
          <span>Semantic Rejection: {connectionError}</span>
        </div>
      )}

      {/* Left Sidebar: Node Library / Palette */}
      {showLibrary && (
        <aside className="w-64 border-r border-border bg-card/45 flex flex-col shrink-0 overflow-hidden relative z-10 animate-slide-in-left">
          <div className="p-4 border-b border-border bg-muted/15 flex justify-between items-center shrink-0">
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary font-mono">IBIS Node Library</span>
            <button
              onClick={() => setShowLibrary(false)}
              className="p-1 rounded hover:bg-secondary text-muted-foreground transition-colors"
              title="Hide Sidebar"
            >
              <ChevronLeft size={14} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
              Click elements below to add them to your map, then drag handles to link reasoning.
            </p>

            <div className="space-y-2.5">
              {[
                { type: 'question', label: 'Question / Issue', shortcut: 'Q', desc: 'Define a problem, decision, or query', color: 'bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/15', icon: <HelpCircle size={14} /> },
                { type: 'idea', label: 'Idea / Position', shortcut: 'A', desc: 'Propose a response or solution', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/15', icon: <Lightbulb size={14} /> },
                { type: 'pro', label: 'Pro Argument', shortcut: 'P', desc: 'Supporting argument for an idea', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/15', icon: <Plus size={14} /> },
                { type: 'con', label: 'Con Argument', shortcut: 'C', desc: 'Argument opposing an idea', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/15', icon: <Minus size={14} /> },
                { type: 'note', label: 'Note / Evidence', shortcut: 'N', desc: 'Background fact, URL, or note', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/15', icon: <FileText size={14} /> },
                { type: 'decision', label: 'Decision / Resolve', shortcut: 'D', desc: 'The resolved position / choice', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/15', icon: <Check size={14} /> },
                { type: 'link', label: 'Link / Reference', shortcut: 'L', desc: 'Clickable URL reference card', color: 'bg-teal-500/10 text-teal-400 border-teal-500/30 hover:bg-teal-500/15', icon: <Link2 size={14} /> },
                { type: 'image', label: 'Image / Diagram', shortcut: 'I', desc: 'Embedded image thumbnail card', color: 'bg-pink-500/10 text-pink-400 border-pink-500/30 hover:bg-pink-500/15', icon: <ImageIcon size={14} /> },
                { type: 'map', label: 'Map / Sub-Map', shortcut: 'M', desc: 'Link to another dialogue map', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/15', icon: <Folder size={14} /> },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => handleAddNodeFromLibrary(item.type as IbisNodeType)}
                  className={cn(
                    "w-full text-left p-3 border rounded-xl flex items-start gap-3 transition-all hover:scale-[1.02] shadow-sm hover:shadow-md",
                    item.color
                  )}
                >
                  <div className="mt-0.5 shrink-0">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="text-xs font-bold font-mono truncate">{item.label}</h5>
                      <kbd className="px-1.5 py-0.5 text-[9px] font-extrabold bg-background/50 border border-foreground/10 rounded shadow-sm text-foreground/80 font-mono shrink-0">
                        {item.shortcut}
                      </kbd>
                    </div>
                    <p className="text-[10px] opacity-75 mt-0.5 leading-normal">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>
      )}

      {/* Hidden Sidebar Restorers */}
      {!showLibrary && (
        <button
          onClick={() => setShowLibrary(true)}
          className="absolute left-2 top-16 z-20 p-1.5 rounded-lg bg-card border border-border shadow-lg text-foreground hover:bg-accent"
          title="Show Library"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Center Layout: React Flow Canvas */}
      <main ref={containerRef} className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Canvas Toolbar Panel */}
        <div className="h-12 border-b border-border bg-card flex items-center justify-between px-4 shrink-0 select-none">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-extrabold uppercase font-mono tracking-widest text-primary mr-3">Workspace</span>
            
            {/* Auto-Layout Presets */}
            <div className="flex items-center border rounded p-0.5 bg-muted/20">
              <button
                onClick={() => triggerAutoLayout('vertical')}
                className="px-2 py-1 text-[10px] font-bold hover:bg-accent rounded text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                title="Arrange nodes in a vertical tree layout"
              >
                <Sparkles size={11} className="text-primary" /> Vertical Tree
              </button>
              <button
                onClick={() => triggerAutoLayout('horizontal')}
                className="px-2 py-1 text-[10px] font-bold hover:bg-accent rounded text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                title="Arrange nodes in a left-to-right flow"
              >
                Horizontal Flow
              </button>
              <button
                onClick={() => triggerAutoLayout('grid')}
                className="px-2 py-1 text-[10px] font-bold hover:bg-accent rounded text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                title="Organize all nodes in an aligned grid pattern"
              >
                Grid layout
              </button>
            </div>

            {/* Layout Undo */}
            {layoutHistory.length > 0 && (
              <button
                onClick={undoLayout}
                className="p-1.5 rounded hover:bg-accent text-foreground border border-border/80 flex items-center gap-1 text-[10px] font-bold transition-colors"
                title="Revert last node move or layout action"
              >
                <Undo2 size={12} /> Undo Layout
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleImportClick}
              className="px-2.5 py-1.5 rounded bg-secondary/80 hover:bg-secondary text-foreground text-[10px] font-bold border border-border flex items-center gap-1"
              title="Import JSON Map"
            >
              <Upload size={12} /> Import Map
            </button>
            <button
              onClick={handleExport}
              className="px-2.5 py-1.5 rounded bg-primary hover:bg-primary/95 text-primary-foreground text-[10px] font-bold flex items-center gap-1 border border-primary/20 shadow-sm"
              title="Export Map JSON"
            >
              <Download size={12} /> Export Map
            </button>
          </div>
        </div>

        {/* React Flow Editor */}
        <div className="flex-1 w-full h-full min-h-0 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStart={recordHistory}
            nodeTypes={nodeTypes}
            minZoom={0.1}
            maxZoom={2}
            panOnScroll={true}
            panOnScrollMode={"all" as any}
            zoomOnScroll={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="hsl(var(--border))" gap={16} size={1} />
            <Controls className="fill-foreground stroke-foreground text-foreground" />
             <MiniMap 
              nodeColor={(node) => {
                const type = node.data?.type;
                if (type === 'question') return '#0ea5e9';
                if (type === 'idea') return '#eab308';
                if (type === 'pro') return '#10b981';
                if (type === 'con') return '#f43f5e';
                if (type === 'note') return '#f59e0b';
                if (type === 'decision') return '#a855f7';
                if (type === 'map') return '#6366f1';
                return '#64748b';
              }}
              maskColor="rgba(15, 23, 42, 0.6)"
              className="border border-border/60 bg-card/65 rounded-lg"
              pannable={true}
              onClick={(_, position) => {
                reactFlowInstance.setCenter(position.x, position.y, { zoom: reactFlowInstance.getZoom() });
              }}
            />
          </ReactFlow>
        </div>

        {/* Custom right-drag connection line overlay */}
        {rightDragStartNodeId && currentMousePos && containerRef.current && (() => {
          const startEl = document.querySelector(`[data-id="${rightDragStartNodeId}"]`);
          if (!startEl) return null;
          const rect = startEl.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          const startX = rect.left + rect.width / 2 - containerRect.left;
          const startY = rect.top + rect.height / 2 - containerRect.top;
          const currentX = currentMousePos.clientX - containerRect.left;
          const currentY = currentMousePos.clientY - containerRect.top;

          return (
            <svg className="absolute inset-0 pointer-events-none z-50 w-full h-full">
              <line
                x1={startX}
                y1={startY}
                x2={currentX}
                y2={currentY}
                stroke="#64748b"
                strokeWidth={2}
                strokeDasharray="4,4"
              />
            </svg>
          );
        })()}
      </main>

      {/* Right Sidebar Restorer */}
      {!showInspector && (
        <button
          onClick={() => setShowInspector(true)}
          className="absolute right-2 top-16 z-20 p-1.5 rounded-lg bg-card border border-border shadow-lg text-foreground hover:bg-accent animate-pulse"
          title="Show Inspector"
        >
          <Maximize2 size={16} />
        </button>
      )}

      {/* Right Sidebar: Node Metadata Inspector */}
      {showInspector && (
        <aside className="w-80 border-l border-border bg-card/45 flex flex-col shrink-0 overflow-hidden relative z-10 animate-slide-in-right">
          <div className="p-4 border-b border-border bg-muted/15 flex justify-between items-center shrink-0">
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary font-mono">Argument Inspector</span>
            <button
              onClick={() => setShowInspector(false)}
              className="p-1 rounded hover:bg-secondary text-muted-foreground transition-colors"
              title="Hide Inspector"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 select-text">
            {activeNode ? (
              <div className="space-y-4">
                {/* 1. Node Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Node Label</label>
                  <input
                    type="text"
                    value={activeNode.data.title}
                    onChange={(e) => updateNodeData(activeNode.id, { title: e.target.value })}
                    className="w-full bg-secondary border border-border rounded-lg p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring select-text"
                    placeholder="Enter node title..."
                  />
                </div>

                {/* 2. Type Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Argument Logic Class</label>
                  <select
                    value={activeNode.data.type}
                    onChange={(e) => updateNodeData(activeNode.id, { type: e.target.value as IbisNodeType })}
                    className="w-full bg-secondary border border-border rounded-lg p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="question">Question / Issue</option>
                    <option value="idea">Idea / Position</option>
                    <option value="pro">Pro Argument</option>
                    <option value="con">Con Argument</option>
                    <option value="note">Note / Evidence</option>
                    <option value="decision">Decision / Resolve</option>
                    <option value="link">Link / Reference</option>
                    <option value="image">Image / Diagram</option>
                    <option value="map">Map / Sub-Map</option>
                  </select>
                </div>

                {/* 3. Decision Status (Conditional) */}
                {(activeNode.data.type === 'question' || activeNode.data.type === 'idea' || activeNode.data.type === 'decision') && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Resolution status</label>
                    <select
                      value={activeNode.data.status || 'pending'}
                      onChange={(e) => updateNodeData(activeNode.id, { status: e.target.value as any })}
                      className="w-full bg-secondary border border-border rounded-lg p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted / Chosen</option>
                      <option value="rejected">Rejected / Dropped</option>
                    </select>
                  </div>
                )}

                {/* 4. Description Detail Notes */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Description & Notes</label>
                  <textarea
                    value={activeNode.data.description || ''}
                    onChange={(e) => updateNodeData(activeNode.id, { description: e.target.value })}
                    className="w-full bg-secondary border border-border rounded-lg p-2.5 text-xs text-foreground outline-none h-24 resize-none focus:ring-1 focus:ring-ring select-text"
                    placeholder="Provide details, facts, URLs, or evidence context..."
                  />
                </div>

                {/* Link URL (Conditional) */}
                {activeNode.data.type === 'link' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Link URL</label>
                    <input
                      type="text"
                      value={activeNode.data.url || ''}
                      onChange={(e) => updateNodeData(activeNode.id, { url: e.target.value })}
                      className="w-full bg-secondary border border-border rounded-lg p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring select-text"
                      placeholder="https://example.com"
                    />
                  </div>
                )}

                {/* Image URL (Conditional) */}
                {activeNode.data.type === 'image' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Image URL</label>
                    <input
                      type="text"
                      value={activeNode.data.imageUrl || ''}
                      onChange={(e) => updateNodeData(activeNode.id, { imageUrl: e.target.value })}
                      className="w-full bg-secondary border border-border rounded-lg p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring select-text"
                      placeholder="Image URL or local path..."
                    />
                  </div>
                )}

                {/* 5. Tag Editor */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Tags / Categories</label>
                  
                  {/* Active tags badges */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {activeNode.data.tags && activeNode.data.tags.map((tag) => (
                      <span
                        key={tag}
                        onClick={() => handleRemoveTag(tag)}
                        className="text-[9px] bg-secondary text-foreground hover:bg-destructive/15 hover:text-destructive border border-border/80 px-2 py-0.5 rounded-md font-mono cursor-pointer flex items-center gap-1 transition-colors"
                        title="Click to remove tag"
                      >
                        #{tag} <span className="opacity-60 text-[8px]">×</span>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="e.g. database"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      className="flex-1 bg-secondary border border-border rounded-lg p-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-2.5 py-1 bg-secondary hover:bg-accent border rounded-lg text-xs font-bold transition-colors"
                    >
                      <Tag size={12} />
                    </button>
                  </div>
                </div>

                {/* 6. Node Delete */}
                <div className="pt-4 border-t border-border/40">
                  <button
                    onClick={() => deleteNode(activeNode.id)}
                    className="w-full py-2 bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground text-destructive border border-destructive/20 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                  >
                    <Trash2 size={13} /> Delete Node from Map
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center italic text-muted-foreground/60 pt-10 text-xs">
                No node selected. Click on a node in the mapping canvas to view and edit its logical properties.
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
};
export default DialogueMappingWidget;
