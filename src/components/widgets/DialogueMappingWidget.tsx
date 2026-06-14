import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Connection,
  useReactFlow,
  ReactFlowProvider,
  Node,
  Edge,
  SelectionMode,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TabNode } from 'flexlayout-react';

import { 
  Download, 
  Upload, 
  Trash2, 
  ChevronRight, 
  AlertCircle,
  Tag,
  Maximize2,
  Copy,
  ClipboardPaste,
  Scissors
} from 'lucide-react';

import { useDialogueMappingStore, IbisNodeType, IDialogueNodeData } from '../../core/services/DialogueMappingService';
import { IbisNode } from './dialogue-mapper/IbisNode';
import { DialogueMapperLibrary } from './DialogueMapperLibrary';
import { ContextMenu, IContextMenuItem } from './ContextMenu';
import { FlowControlToolbar } from './FlowControlToolbar';

export interface DialogueMappingWidgetProps {
  node?: TabNode;
  defaultDragMode?: 'pan' | 'select';
  hideInternalLibrary?: boolean;
  hideInternalInspector?: boolean;
}

export const DialogueMappingWidget: React.FC<DialogueMappingWidgetProps> = ({ 
  node,
  defaultDragMode = 'select',
  hideInternalLibrary = false,
  hideInternalInspector = false
}) => {
  return (
    <ReactFlowProvider>
      <DialogueMappingCanvas 
        node={node} 
        defaultDragMode={defaultDragMode} 
        hideInternalLibrary={hideInternalLibrary}
        hideInternalInspector={hideInternalInspector}
      />
    </ReactFlowProvider>
  );
};

const DialogueMappingCanvas: React.FC<DialogueMappingWidgetProps> = ({ 
  node,
  defaultDragMode = 'select',
  hideInternalLibrary = false,
  hideInternalInspector = false
}) => {
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
    deleteEdge,
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

  // Context Menu and clipboard states
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    targetType: 'node' | 'edge' | 'pane';
    id?: string;
  } | null>(null);
  const [clipboard, setClipboard] = useState<{
    nodes: Node<IDialogueNodeData>[];
    edges: Edge[];
  } | null>(null);

  // UI Panels state
  const [showLibrary, setShowLibrary] = useState(!hideInternalLibrary);
  const [showInspector, setShowInspector] = useState(!hideInternalInspector);
  const [dragMode, setDragMode] = useState<'pan' | 'select'>(defaultDragMode);

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
  const selectedNodes = nodes.filter((n) => n.selected);
  const activeNode = selectedNodes.length === 1 ? selectedNodes[0] : null;
  const [newTag, setNewTag] = useState('');

  const selectedNodesRef = useRef(selectedNodes);
  useEffect(() => {
    selectedNodesRef.current = selectedNodes;
  }, [selectedNodes]);

  // Handle nodes/edges movements from canvas
  const onNodesChange = useCallback(
    (changes: any) => {
      const nextNodes = applyNodeChanges(changes, nodes);
      setNodes(nextNodes);

      const selected = nextNodes.filter((n) => n.selected);
      if (selected.length === 1) {
        setSelectedNodeId(selected[0].id);
      } else {
        setSelectedNodeId(null);
      }
    },
    [nodes, setNodes, setSelectedNodeId]
  );

  const onEdgesChange = useCallback(
    (changes: any) => {
      setEdges(applyEdgeChanges(changes, edges));
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
      const target = e.target as HTMLElement;
      if (domNode.contains(target)) {
        e.preventDefault();

        // Check if right clicked on node selection overlay wrapper
        const selectionEl = 
          target.closest('.react-flow__nodesselection-rect') || 
          target.closest('.react-flow__nodesselection') || 
          target.closest('.react-flow__selection');
        const activeSelectedNodes = selectedNodesRef.current;

        if (selectionEl && activeSelectedNodes.length > 1) {
          setContextMenu({
            x: e.clientX,
            y: e.clientY,
            targetType: 'node',
            id: activeSelectedNodes[0].id,
          });
        }
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

  const onDragStart = useCallback((event: React.DragEvent, nodeType: IbisNodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as IbisNodeType;

      if (!type || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [reactFlowInstance, addNode]
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      if (preventNextContextMenuRef.current) {
        preventNextContextMenuRef.current = false;
        return;
      }

      // If the right-clicked node is not already selected, select it exclusively
      const isSelected = nodes.find((n) => n.id === node.id)?.selected;
      if (!isSelected) {
        setNodes(
          nodes.map((n) => ({
            ...n,
            selected: n.id === node.id,
          }))
        );
        setSelectedNodeId(node.id);
      }

      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        targetType: 'node',
        id: node.id,
      });
    },
    [nodes, setNodes, setSelectedNodeId]
  );

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        targetType: 'edge',
        id: edge.id,
      });
    },
    []
  );

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const target = event.target as HTMLElement;

      const isSelectionClick = 
        target.closest('.react-flow__nodesselection-rect') || 
        target.closest('.react-flow__nodesselection') || 
        target.closest('.react-flow__selection') || 
        target.closest('.react-flow__node');

      if (selectedNodes.length > 1 && isSelectionClick) {
        setContextMenu({
          x: event.clientX,
          y: event.clientY,
          targetType: 'node',
          id: selectedNodes[0].id,
        });
      } else {
        setContextMenu({
          x: event.clientX,
          y: event.clientY,
          targetType: 'pane',
        });
      }
    },
    [selectedNodes]
  );

  const handleCopy = useCallback(() => {
    const selectedIds = new Set(selectedNodes.map((n) => n.id));
    const internalEdges = edges.filter(
      (e) => selectedIds.has(e.source) && selectedIds.has(e.target)
    );
    setClipboard({
      nodes: selectedNodes,
      edges: internalEdges,
    });
  }, [selectedNodes, edges]);

  const handleCut = useCallback(() => {
    const selectedIds = new Set(selectedNodes.map((n) => n.id));
    const internalEdges = edges.filter(
      (e) => selectedIds.has(e.source) && selectedIds.has(e.target)
    );
    setClipboard({
      nodes: selectedNodes,
      edges: internalEdges,
    });
    recordHistory();
    setNodes(nodes.filter((n) => !selectedIds.has(n.id)));
    setEdges(
      edges.filter((e) => !selectedIds.has(e.source) && !selectedIds.has(e.target))
    );
    setSelectedNodeId(null);
  }, [selectedNodes, edges, nodes, recordHistory, setNodes, setEdges, setSelectedNodeId]);

  const handleDeleteSelection = useCallback(() => {
    const selectedIds = new Set(selectedNodes.map((n) => n.id));
    recordHistory();
    setNodes(nodes.filter((n) => !selectedIds.has(n.id)));
    setEdges(
      edges.filter((e) => !selectedIds.has(e.source) && !selectedIds.has(e.target))
    );
    setSelectedNodeId(null);
  }, [selectedNodes, edges, nodes, recordHistory, setNodes, setEdges, setSelectedNodeId]);

  const handlePaste = useCallback(() => {
    if (!clipboard || !contextMenu) return;

    recordHistory();

    const pastePos = reactFlowInstance.screenToFlowPosition({
      x: contextMenu.x,
      y: contextMenu.y,
    });

    const minX = Math.min(...clipboard.nodes.map((n) => n.position.x));
    const minY = Math.min(...clipboard.nodes.map((n) => n.position.y));

    const idMap: Record<string, string> = {};
    const newNodes = clipboard.nodes.map((oldNode, idx) => {
      const newId = `node-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`;
      idMap[oldNode.id] = newId;

      const dx = oldNode.position.x - minX;
      const dy = oldNode.position.y - minY;

      const pastedNode: Node<IDialogueNodeData> = {
        ...oldNode,
        id: newId,
        position: {
          x: pastePos.x + dx,
          y: pastePos.y + dy,
        },
        selected: true,
        data: {
          ...oldNode.data,
          id: newId,
          title: oldNode.data.title,
          autoEdit: false,
        },
      };
      return pastedNode;
    });

    const newEdges: Edge[] = [];
    clipboard.edges.forEach((oldEdge) => {
      const newSource = idMap[oldEdge.source];
      const newTarget = idMap[oldEdge.target];
      if (newSource && newTarget) {
        const strokeColor = '#64748b'; // Slate-500
        newEdges.push({
          ...oldEdge,
          id: `edge-${newSource}-${newTarget}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          source: newSource,
          target: newTarget,
          style: { stroke: strokeColor, strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: strokeColor },
        });
      }
    });

    const updatedNodes = nodes.map((n) => ({ ...n, selected: false }));

    setNodes([...updatedNodes, ...newNodes]);
    setEdges([...edges, ...newEdges]);

    if (newNodes.length === 1) {
      setSelectedNodeId(newNodes[0].id);
    } else {
      setSelectedNodeId(null);
    }
  }, [clipboard, contextMenu, nodes, edges, reactFlowInstance, recordHistory, setNodes, setEdges, setSelectedNodeId]);

  const getNodeContextMenuItems = (): IContextMenuItem[] => {
    if (!contextMenu || !contextMenu.id) return [];

    if (selectedNodes.length > 1) {
      return [
        {
          label: 'Cut Selection',
          icon: <Scissors size={14} />,
          onClick: () => {
            handleCut();
          },
        },
        {
          label: 'Copy Selection',
          icon: <Copy size={14} />,
          onClick: () => {
            handleCopy();
          },
        },
        {
          label: 'Delete Selection',
          icon: <Trash2 size={14} className="text-destructive" />,
          onClick: () => {
            handleDeleteSelection();
          },
        },
      ];
    }

    const node = nodes.find((n) => n.id === contextMenu.id);
    if (!node) return [];

    return [
      {
        label: 'Cut Node',
        icon: <Scissors size={14} />,
        onClick: () => {
          setClipboard({ nodes: [node], edges: [] });
          recordHistory();
          deleteNode(node.id);
        },
      },
      {
        label: 'Copy Node',
        icon: <Copy size={14} />,
        onClick: () => {
          setClipboard({ nodes: [node], edges: [] });
        },
      },
      {
        label: 'Delete Node',
        icon: <Trash2 size={14} className="text-destructive" />,
        onClick: () => {
          deleteNode(node.id);
        },
      },
    ];
  };

  const getEdgeContextMenuItems = (): IContextMenuItem[] => {
    if (!contextMenu || !contextMenu.id) return [];
    const edgeId = contextMenu.id;
    return [
      {
        label: 'Delete Connection',
        icon: <Trash2 size={14} className="text-destructive" />,
        onClick: () => {
          deleteEdge(edgeId);
        },
      },
    ];
  };

  const getPaneContextMenuItems = (): IContextMenuItem[] => {
    if (!clipboard) {
      return [
        {
          label: 'Paste (Empty)',
          icon: <ClipboardPaste size={14} />,
          onClick: () => {},
        },
      ];
    }
    return [
      {
        label: clipboard.nodes.length > 1 ? 'Paste Selection' : 'Paste Node',
        icon: <ClipboardPaste size={14} />,
        onClick: () => {
          handlePaste();
        },
      },
    ];
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
      {!hideInternalLibrary && showLibrary && (
        <DialogueMapperLibrary
          onAddNode={handleAddNodeFromLibrary}
          onClose={() => setShowLibrary(false)}
          onDragStart={onDragStart}
        />
      )}

      {/* Hidden Sidebar Restorers */}
      {!hideInternalLibrary && !showLibrary && (
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
          <FlowControlToolbar
            variant="header"
            dragMode={dragMode}
            onDragModeChange={setDragMode}
            onLayoutChange={triggerAutoLayout}
            onUndo={undoLayout}
            canUndo={layoutHistory.length > 0}
            title="Workspace"
          />

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
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeContextMenu={onNodeContextMenu}
            onEdgeContextMenu={onEdgeContextMenu}
            onPaneContextMenu={onPaneContextMenu}
            onPaneClick={() => setContextMenu(null)}
            onNodeClick={() => setContextMenu(null)}
            onEdgeClick={() => setContextMenu(null)}
            panOnDrag={dragMode === 'pan'}
            selectionOnDrag={dragMode === 'select'}
            selectionMode={SelectionMode.Partial}
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
      {!hideInternalInspector && !showInspector && (
        <button
          onClick={() => setShowInspector(true)}
          className="absolute right-2 top-16 z-20 p-1.5 rounded-lg bg-card border border-border shadow-lg text-foreground hover:bg-accent animate-pulse"
          title="Show Inspector"
        >
          <Maximize2 size={16} />
        </button>
      )}

      {/* Right Sidebar: Node Metadata Inspector */}
      {!hideInternalInspector && showInspector && (
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
            {selectedNodes.length > 1 ? (
              <div className="text-center italic text-muted-foreground/60 pt-10 text-xs space-y-2">
                <div className="font-semibold text-primary">Multiple Nodes Selected</div>
                <div>({selectedNodes.length} nodes selected)</div>
                <div className="text-[10px] mt-2">Node arguments cannot be edited simultaneously. Select a single node to view and edit its logical properties.</div>
              </div>
            ) : activeNode ? (
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

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={
            contextMenu.targetType === 'node'
              ? getNodeContextMenuItems()
              : contextMenu.targetType === 'edge'
              ? getEdgeContextMenuItems()
              : getPaneContextMenuItems()
          }
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
export default DialogueMappingWidget;
