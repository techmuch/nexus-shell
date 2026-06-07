import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap, Connection, addEdge, applyNodeChanges, applyEdgeChanges, type Node as FlowNode, type Edge as FlowEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Eye, 
  GitFork, 
  Trash2, 
  Plus, 
  Download, 
  MousePointer, 
  Pencil, 
  Square, 
  Circle, 
  MoveRight, 
  MessageSquare, 
  Check, 
  X,
  History,
  Copy
} from 'lucide-react';
import { useMockupReviewStore, IMockupAnnotation } from '../../core/services/MockupReviewService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---------------------------------------------------------------------
// 1. Sanitizer & Shadow DOM Renderer Component
// ---------------------------------------------------------------------
interface HtmlShadowRendererProps {
  htmlContent: string;
  onElementClick?: (selector: string, clientX: number, clientY: number) => void;
  shadowHostRef: React.RefObject<HTMLDivElement | null>;
}

export const HtmlShadowRenderer: React.FC<HtmlShadowRendererProps> = ({
  htmlContent,
  onElementClick,
  shadowHostRef,
}) => {
  useEffect(() => {
    const host = shadowHostRef.current;
    if (!host) return;

    let shadowRoot = host.shadowRoot;
    if (!shadowRoot) {
      shadowRoot = host.attachShadow({ mode: 'open' });
    }

    // 1. Parse & Sanitize HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Remove potential XSS tags
    doc.querySelectorAll('script, iframe, object, embed, applet').forEach((el) => el.remove());

    // Strip inline event listeners
    const sanitizeEvents = (node: ChildNode) => {
      if (node.nodeType === 1) { // ELEMENT_NODE
        const el = node as HTMLElement;
        const attrs = Array.from(el.attributes);
        for (const attr of attrs) {
          if (attr.name.startsWith('on')) {
            el.removeAttribute(attr.name);
          }
          if (attr.name === 'href' && attr.value.trim().toLowerCase().startsWith('javascript:')) {
            el.removeAttribute(attr.name);
          }
        }
      }
      node.childNodes.forEach((child) => sanitizeEvents(child));
    };
    doc.childNodes.forEach((child) => sanitizeEvents(child));

    // 2. Insert sanitized HTML
    shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          min-height: 400px;
          overflow: auto;
          box-sizing: border-box;
        }
      </style>
      ${doc.body.innerHTML}
    `;

    // 3. Setup event intercepting for element tethering clicks
    const handleMouseUp = (e: MouseEvent) => {
      if (!onElementClick || !shadowRoot) return;
      const target = e.target as HTMLElement;
      if (!target || target === doc.body || target.tagName === 'BODY') return;

      // Build unique selector
      const getSelector = (element: HTMLElement): string => {
        if (element.id) return `#${element.id}`;
        const path: string[] = [];
        let current: HTMLElement | null = element;
        while (current && current.nodeType === 1 && current.tagName !== 'BODY') {
          let selector = current.tagName.toLowerCase();
          if (current.id) {
            selector += `#${current.id}`;
            path.unshift(selector);
            break;
          } else {
            let sibling = current.previousElementSibling;
            let index = 1;
            while (sibling) {
              if (sibling.tagName === current.tagName) index++;
              sibling = sibling.previousElementSibling;
            }
            selector += `:nth-of-type(${index})`;
          }
          path.unshift(selector);
          current = current.parentElement;
        }
        return path.join(' > ');
      };

      const selector = getSelector(target);
      onElementClick(selector, e.clientX, e.clientY);
    };

    shadowRoot.addEventListener('mouseup', handleMouseUp as EventListener);
    return () => {
      shadowRoot?.removeEventListener('mouseup', handleMouseUp as EventListener);
    };
  }, [htmlContent, onElementClick, shadowHostRef]);

  return <div ref={shadowHostRef} className="w-full h-full min-h-[400px] bg-background text-foreground rounded-lg overflow-hidden border border-border/40" />;
};

// ---------------------------------------------------------------------
// 2. SVG Annotation Overlay Helper Functions
// ---------------------------------------------------------------------
const generateSvgPath = (points: { x: number; y: number }[]) => {
  if (points.length < 2) return '';
  return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ');
};

const renderArrowHeadMarker = (id: string, color: string) => (
  <marker
    id={id}
    markerWidth="8"
    markerHeight="8"
    refX="5"
    refY="4"
    orient="auto"
    markerUnits="strokeWidth"
  >
    <path d="M0,1 L6,4 L0,7 z" fill={color} />
  </marker>
);

// ---------------------------------------------------------------------
// 3. Main MockupReviewWidget
// ---------------------------------------------------------------------
export const MockupReviewWidget: React.FC = () => {
  const {
    views,
    activeViewId,
    compareVersionId,
    nodes,
    edges,
    setActiveViewId,
    setActiveVersionId,
    setCompareVersionId,
    addAnnotation,
    deleteAnnotation,
    updateAnnotationText,
    addMockupView,
    addMockupVersion,
    updateWorkflow,
    exportHistoryJson
  } = useMockupReviewStore();

  const [activeTab, setActiveTab] = useState<'review' | 'workflow'>('review');
  const [tool, setTool] = useState<'select' | 'pen' | 'rect' | 'circle' | 'arrow' | 'comment'>('select');
  const [color, setColor] = useState<string>('#ef4444'); // Red default
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);
  const [drawStartPos, setDrawStartPos] = useState<{ x: number; y: number } | null>(null);
  const [tempShape, setTempShape] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  
  // Comment placement helpers
  const [pendingComment, setPendingComment] = useState<{ x: number; y: number; selector?: string } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  
  // Custom screen name helpers
  const [showAddScreen, setShowAddScreen] = useState(false);
  const [newScreenName, setNewScreenName] = useState('');
  const [newScreenDesc, setNewScreenDesc] = useState('');

  // Shadow DOM refs for position calculations
  const shadowHostRef = useRef<HTMLDivElement | null>(null);
  const [resolvedPositions, setResolvedPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Active view model
  const activeView = useMemo(() => views.find((v) => v.id === activeViewId) || null, [views, activeViewId]);
  const activeVersion = useMemo(() => {
    if (!activeView) return null;
    return activeView.versions.find((v) => v.id === activeView.activeVersionId) || null;
  }, [activeView]);

  // Comparison version model
  const compareVersion = useMemo(() => {
    if (!activeView || !compareVersionId) return null;
    return activeView.versions.find((v) => v.id === compareVersionId) || null;
  }, [activeView, compareVersionId]);

  // 1. Recalculate tethered annotation pixel/percent positions relative to viewport/host
  const updateTetheredPositions = useCallback(() => {
    const host = shadowHostRef.current;
    if (!host) return;
    const shadowRoot = host.shadowRoot;
    if (!shadowRoot) return;

    const hostRect = host.getBoundingClientRect();
    const newPositions: Record<string, { x: number; y: number }> = {};

    const resolveAnn = (ann: IMockupAnnotation) => {
      if (ann.type === 'comment' && ann.elementSelector) {
        const el = shadowRoot.querySelector(ann.elementSelector);
        if (el) {
          const elRect = el.getBoundingClientRect();
          const x = ((elRect.left + elRect.width / 2 - hostRect.left) / hostRect.width) * 100;
          const y = ((elRect.top + elRect.height / 2 - hostRect.top) / hostRect.height) * 100;
          newPositions[ann.id] = { x, y };
        }
      }
    };

    activeVersion?.annotations.forEach(resolveAnn);
    compareVersion?.annotations.forEach(resolveAnn);

    setResolvedPositions(newPositions);
  }, [activeVersion, compareVersion]);

  // Trigger tether updates on container resizing
  useEffect(() => {
    const host = shadowHostRef.current;
    if (!host) return;

    const observer = new ResizeObserver(() => {
      updateTetheredPositions();
    });
    observer.observe(host);

    // Initial positioning
    const timer = setTimeout(updateTetheredPositions, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [activeVersion, compareVersion, updateTetheredPositions]);

  // 2. Intercept click to add element-tethered comment
  const handleElementClick = (selector: string, clientX: number, clientY: number) => {
    if (tool !== 'comment' || !shadowHostRef.current) return;
    const hostRect = shadowHostRef.current.getBoundingClientRect();
    const x = ((clientX - hostRect.left) / hostRect.width) * 100;
    const y = ((clientY - hostRect.top) / hostRect.height) * 100;

    setPendingComment({ x, y, selector });
    setCommentText('');
  };

  // 3. Pointer event handlers for drawing overlay canvas (SVG-based)
  const getCanvasCoords = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (tool === 'select') return;
    e.preventDefault();

    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setDrawStartPos(coords);

    if (tool === 'pen') {
      setCurrentStroke([coords]);
    } else if (['rect', 'circle', 'arrow'].includes(tool)) {
      setTempShape({ x: coords.x, y: coords.y, w: 0, h: 0 });
    } else if (tool === 'comment') {
      setPendingComment({ x: coords.x, y: coords.y });
      setCommentText('');
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing || !drawStartPos) return;

    const coords = getCanvasCoords(e);

    if (tool === 'pen') {
      setCurrentStroke((prev) => [...prev, coords]);
    } else if (['rect', 'circle', 'arrow'].includes(tool) && tempShape) {
      setTempShape({
        x: Math.min(drawStartPos.x, coords.x),
        y: Math.min(drawStartPos.y, coords.y),
        w: Math.abs(coords.x - drawStartPos.x),
        h: Math.abs(coords.y - drawStartPos.y),
      });
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing || !activeView || !activeVersion) return;
    setIsDrawing(false);

    const annotationId = `ann-${Math.floor(Math.random() * 100000)}`;

    if (tool === 'pen' && currentStroke.length > 1) {
      addAnnotation(activeView.id, activeVersion.id, {
        id: annotationId,
        type: 'stroke',
        color,
        points: currentStroke,
      });
    } else if (['rect', 'circle', 'arrow'].includes(tool) && tempShape && drawStartPos) {
      const lastPoint = currentStroke[currentStroke.length - 1];
      addAnnotation(activeView.id, activeVersion.id, {
        id: annotationId,
        type: tool as any,
        color,
        x: tempShape.x,
        y: tempShape.y,
        width: tempShape.w,
        height: tempShape.h,
        points: tool === 'arrow' ? [drawStartPos, lastPoint || drawStartPos] : undefined
      });
    }

    setCurrentStroke([]);
    setTempShape(null);
    setDrawStartPos(null);
  };

  // 4. Save comment pin
  const submitComment = () => {
    if (!pendingComment || !activeView || !activeVersion) return;

    addAnnotation(activeView.id, activeVersion.id, {
      id: `ann-${Math.floor(Math.random() * 100000)}`,
      type: 'comment',
      color,
      x: pendingComment.x,
      y: pendingComment.y,
      text: commentText || 'No comment provided.',
      elementSelector: pendingComment.selector,
    });

    setPendingComment(null);
    setCommentText('');
    setTimeout(updateTetheredPositions, 100);
  };

  // 5. React Flow Workflow State Bindings
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
      const label = window.prompt("Enter transition label (optional):") || "";
      const newEdge = {
        ...params,
        label,
        style: { stroke: '#38bdf8' },
        labelStyle: { fill: '#f8fafc', fontWeight: 600, fontSize: 10 },
        labelBgStyle: { fill: '#1e293b' }
      };
      updateWorkflow(nodes, addEdge(newEdge, edges));
    },
    [nodes, edges, updateWorkflow]
  );

  const handleNodeClick = (_event: React.MouseEvent, node: FlowNode) => {
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

  // 6. Custom Screen Node Addition
  const handleAddScreen = () => {
    if (!newScreenName) return;
    addMockupView(newScreenName, newScreenDesc);
    setShowAddScreen(false);
    setNewScreenName('');
    setNewScreenDesc('');
  };

  // 7. Add HTML mockup revision/version
  const handleAddNewVersion = () => {
    if (!activeView || !activeVersion) return;
    const nextVerLabel = `v${activeView.versions.length + 1}.0`;
    addMockupVersion(activeView.id, nextVerLabel, activeVersion.htmlContent);
  };

  // 8. Export JSON utility
  const triggerExport = () => {
    const jsonStr = exportHistoryJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mockup-feedback-${activeViewId || 'system'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Precomputed comments list
  const activeComments = useMemo(() => {
    return activeVersion?.annotations.filter((a) => a.type === 'comment') || [];
  }, [activeVersion]);

  const compareComments = useMemo(() => {
    return compareVersion?.annotations.filter((a) => a.type === 'comment') || [];
  }, [compareVersion]);

  return (
    <div className="flex flex-col h-full bg-background text-foreground border border-border overflow-hidden rounded-lg">
      
      {/* Header Tabs */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('review')}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors",
              activeTab === 'review' 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-accent text-muted-foreground hover:text-foreground"
            )}
          >
            <Eye size={14} /> Mockup Reviewer
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors",
              activeTab === 'workflow' 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-accent text-muted-foreground hover:text-foreground"
            )}
          >
            <GitFork size={14} /> Workflow Mapper
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={triggerExport}
            className="p-1.5 rounded bg-secondary/80 hover:bg-secondary text-foreground text-xs font-semibold flex items-center gap-1.5 border"
            title="Export feedback report JSON"
          >
            <Download size={14} /> Export Feedback Report
          </button>
        </div>
      </div>

      {activeTab === 'review' ? (
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Navigation & Version History Sidebar */}
          <aside className="w-64 border-r border-border bg-card flex flex-col overflow-y-auto">
            
            {/* Screen View Explorer */}
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mockup Screens</span>
                <button
                  onClick={() => setShowAddScreen(true)}
                  className="p-1 rounded hover:bg-accent text-primary transition-colors"
                  title="Add Mockup Screen Node"
                >
                  <Plus size={14} />
                </button>
              </div>

              {showAddScreen ? (
                <div className="p-2 border border-border/80 bg-muted/20 rounded mb-2 space-y-2">
                  <input
                    type="text"
                    placeholder="Screen Name"
                    className="w-full bg-background border rounded px-2 py-1 text-xs outline-none"
                    value={newScreenName}
                    onChange={(e) => setNewScreenName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Description (Optional)"
                    className="w-full bg-background border rounded px-2 py-1 text-xs outline-none"
                    value={newScreenDesc}
                    onChange={(e) => setNewScreenDesc(e.target.value)}
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setShowAddScreen(false)}
                      className="px-2 py-1 text-[10px] rounded hover:bg-accent border"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddScreen}
                      className="px-2 py-1 text-[10px] rounded bg-primary text-primary-foreground"
                    >
                      Create
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="space-y-1">
                {views.map((view) => (
                  <button
                    key={view.id}
                    onClick={() => setActiveViewId(view.id)}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-between",
                      view.id === activeViewId 
                        ? "bg-accent/80 text-foreground border-l-2 border-primary font-semibold" 
                        : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                    )}
                  >
                    <span className="truncate">{view.name}</span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {view.versions.length} revs
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Version Revision History */}
            {activeView && (
              <div className="p-3 border-b border-border flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Revision Log</span>
                  <button
                    onClick={handleAddNewVersion}
                    className="p-1 rounded hover:bg-accent text-primary text-[10px] font-semibold flex items-center gap-0.5"
                    title="Create Revision Version"
                  >
                    <Plus size={10} /> Add Rev
                  </button>
                </div>

                <div className="space-y-1 overflow-y-auto flex-1 min-h-0 pr-1">
                  {activeView.versions.map((ver) => (
                    <button
                      key={ver.id}
                      onClick={() => setActiveVersionId(activeView.id, ver.id)}
                      className={cn(
                        "w-full text-left px-2.5 py-2 rounded border text-xs flex flex-col gap-0.5 transition-colors",
                        ver.id === activeView.activeVersionId 
                          ? "bg-primary/5 border-primary text-primary font-medium" 
                          : "border-transparent text-muted-foreground hover:bg-accent/30"
                      )}
                    >
                      <span className="font-semibold flex items-center gap-1.5 text-foreground">
                        <History size={12} className="text-muted-foreground" />
                        {ver.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground/80">
                        {new Date(ver.timestamp).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">
                        {ver.annotations.length} Annotations
                      </span>
                    </button>
                  ))}
                </div>

                {/* Compare Overlay Revision Selector */}
                <div className="mt-3 pt-3 border-t border-border">
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Compare/Overlay Rev
                  </label>
                  <select
                    className="w-full bg-secondary/60 border border-border rounded px-2 py-1 text-xs outline-none text-foreground"
                    value={compareVersionId || ''}
                    onChange={(e) => setCompareVersionId(e.target.value || null)}
                  >
                    <option value="">(None - Select version)</option>
                    {activeView.versions
                      .filter((v) => v.id !== activeView.activeVersionId)
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.label} (compare)
                        </option>
                      ))}
                  </select>
                  <p className="text-[10px] text-muted-foreground/80 mt-1 leading-relaxed">
                    Overlays annotations of the selected version in dashed transparent red.
                  </p>
                </div>
              </div>
            )}
          </aside>

          {/* Main Mockup Area */}
          <div className="flex-1 flex flex-col bg-muted/10 overflow-hidden relative">
            
            {/* Annotation Overlay Toolbar */}
            <div className="flex items-center justify-between p-2.5 border-b border-border bg-card">
              <div className="flex items-center space-x-1.5">
                {[
                  { id: 'select', icon: <MousePointer size={14} />, label: 'Interact' },
                  { id: 'pen', icon: <Pencil size={14} />, label: 'Draw' },
                  { id: 'rect', icon: <Square size={14} />, label: 'Box' },
                  { id: 'circle', icon: <Circle size={14} />, label: 'Circle' },
                  { id: 'arrow', icon: <MoveRight size={14} />, label: 'Arrow' },
                  { id: 'comment', icon: <MessageSquare size={14} />, label: 'Comment' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTool(item.id as any)}
                    className={cn(
                      "px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 border border-transparent transition-all",
                      tool === item.id 
                        ? "bg-primary text-primary-foreground shadow" 
                        : "hover:bg-accent text-muted-foreground hover:text-foreground"
                    )}
                    title={item.label}
                  >
                    {item.icon} <span className="hidden sm:inline">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Color Picker & Draw States */}
              <div className="flex items-center space-x-3">
                {tool !== 'select' && (
                  <div className="flex items-center space-x-1 border rounded px-1.5 py-1 bg-muted/10">
                    {['#ef4444', '#eab308', '#22c55e', '#3b82f6'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={cn(
                          "w-4 h-4 rounded-full border border-black/10 transition-transform",
                          color === c ? "scale-125 ring-1 ring-ring" : "opacity-80 hover:opacity-100"
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                )}
                {activeView && activeVersion && (
                  <button
                    onClick={() => {
                      if (window.confirm("Clear all drawings from this revision?")) {
                        activeVersion.annotations
                          .filter((a) => a.type !== 'comment')
                          .forEach((a) => deleteAnnotation(activeView.id, activeVersion.id, a.id));
                      }
                    }}
                    className="p-1 rounded hover:bg-destructive/10 text-destructive text-[11px] font-semibold border border-transparent"
                  >
                    Clear Canvas
                  </button>
                )}
              </div>
            </div>

            {/* Mockup Render Workspace */}
            {activeView && activeVersion ? (
              <div className="flex-1 p-6 flex justify-center items-start overflow-auto">
                <div className="relative border border-border shadow-lg bg-card rounded-lg overflow-hidden max-w-4xl w-full min-h-[400px]">
                  
                  {/* Safe HTML Content (Encapsulated inside DOM) */}
                  <HtmlShadowRenderer
                    htmlContent={activeVersion.htmlContent}
                    onElementClick={handleElementClick}
                    shadowHostRef={shadowHostRef}
                  />

                  {/* SVG Drawing & Annotation Overlay Layer */}
                  <svg
                    className={cn(
                      "absolute inset-0 w-full h-full z-20 pointer-events-auto",
                      tool === 'select' ? "pointer-events-none" : "cursor-crosshair"
                    )}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                  >
                    <defs>
                      {renderArrowHeadMarker('arrowhead-red', '#ef4444')}
                      {renderArrowHeadMarker('arrowhead-yellow', '#eab308')}
                      {renderArrowHeadMarker('arrowhead-green', '#22c55e')}
                      {renderArrowHeadMarker('arrowhead-blue', '#3b82f6')}
                    </defs>

                    {/* Rendering Active Drawing Annotations */}
                    {activeVersion.annotations.map((ann) => {
                      if (ann.type === 'stroke' && ann.points) {
                        return (
                          <path
                            key={ann.id}
                            d={generateSvgPath(ann.points)}
                            fill="none"
                            stroke={ann.color}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        );
                      }
                      if (ann.type === 'rect' && ann.x !== undefined && ann.y !== undefined && ann.width && ann.height) {
                        return (
                          <rect
                            key={ann.id}
                            x={`${ann.x}%`}
                            y={`${ann.y}%`}
                            width={`${ann.width}%`}
                            height={`${ann.height}%`}
                            fill="none"
                            stroke={ann.color}
                            strokeWidth="2.5"
                          />
                        );
                      }
                      if (ann.type === 'circle' && ann.x !== undefined && ann.y !== undefined && ann.width) {
                        return (
                          <ellipse
                            key={ann.id}
                            cx={`${ann.x + ann.width / 2}%`}
                            cy={`${ann.y + ann.height! / 2}%`}
                            rx={`${ann.width / 2}%`}
                            ry={`${ann.height! / 2}%`}
                            fill="none"
                            stroke={ann.color}
                            strokeWidth="2.5"
                          />
                        );
                      }
                      if (ann.type === 'arrow' && ann.points && ann.points.length >= 2) {
                        const mId = ann.color === '#ef4444' ? 'arrowhead-red' : 
                                     ann.color === '#eab308' ? 'arrowhead-yellow' : 
                                     ann.color === '#22c55e' ? 'arrowhead-green' : 'arrowhead-blue';
                        return (
                          <line
                            key={ann.id}
                            x1={`${ann.points[0].x}%`}
                            y1={`${ann.points[0].y}%`}
                            x2={`${ann.points[1].x}%`}
                            y2={`${ann.points[1].y}%`}
                            stroke={ann.color}
                            strokeWidth="2.5"
                            markerEnd={`url(#${mId})`}
                          />
                        );
                      }
                      return null;
                    })}

                    {/* Rendering Compared Annotations (transparent dashed overlays) */}
                    {compareVersion?.annotations.map((ann) => {
                      if (ann.type === 'stroke' && ann.points) {
                        return (
                          <path
                            key={`comp-${ann.id}`}
                            d={generateSvgPath(ann.points)}
                            fill="none"
                            stroke={ann.color}
                            strokeWidth="2"
                            strokeDasharray="4"
                            opacity="0.4"
                          />
                        );
                      }
                      if (ann.type === 'rect' && ann.x !== undefined && ann.y !== undefined && ann.width && ann.height) {
                        return (
                          <rect
                            key={`comp-${ann.id}`}
                            x={`${ann.x}%`}
                            y={`${ann.y}%`}
                            width={`${ann.width}%`}
                            height={`${ann.height}%`}
                            fill="none"
                            stroke={ann.color}
                            strokeWidth="2"
                            strokeDasharray="4"
                            opacity="0.4"
                          />
                        );
                      }
                      if (ann.type === 'circle' && ann.x !== undefined && ann.y !== undefined && ann.width) {
                        return (
                          <ellipse
                            key={`comp-${ann.id}`}
                            cx={`${ann.x + ann.width / 2}%`}
                            cy={`${ann.y + ann.height! / 2}%`}
                            rx={`${ann.width / 2}%`}
                            ry={`${ann.height! / 2}%`}
                            fill="none"
                            stroke={ann.color}
                            strokeWidth="2"
                            strokeDasharray="4"
                            opacity="0.4"
                          />
                        );
                      }
                      return null;
                    })}

                    {/* Temporary Rendering Shape when Drag-Drawing */}
                    {isDrawing && tempShape && (
                      <>
                        {tool === 'rect' && (
                          <rect
                            x={`${tempShape.x}%`}
                            y={`${tempShape.y}%`}
                            width={`${tempShape.w}%`}
                            height={`${tempShape.h}%`}
                            fill="none"
                            stroke={color}
                            strokeWidth="2"
                            strokeDasharray="2"
                          />
                        )}
                        {tool === 'circle' && (
                          <ellipse
                            cx={`${tempShape.x + tempShape.w / 2}%`}
                            cy={`${tempShape.y + tempShape.h / 2}%`}
                            rx={`${tempShape.w / 2}%`}
                            ry={`${tempShape.h / 2}%`}
                            fill="none"
                            stroke={color}
                            strokeWidth="2"
                            strokeDasharray="2"
                          />
                        )}
                        {tool === 'arrow' && drawStartPos && (
                          <line
                            x1={`${drawStartPos.x}%`}
                            y1={`${drawStartPos.y}%`}
                            x2={`${currentStroke[currentStroke.length - 1]?.x || drawStartPos.x}%`}
                            y2={`${currentStroke[currentStroke.length - 1]?.y || drawStartPos.y}%`}
                            stroke={color}
                            strokeWidth="2"
                            strokeDasharray="2"
                          />
                        )}
                      </>
                    )}
                  </svg>

                  {/* Render Comment Pin Markers (Absolute divs on top of SVG z-index space) */}
                  {activeComments.map((ann, idx) => {
                    const pos = resolvedPositions[ann.id] || { x: ann.x || 0, y: ann.y || 0 };
                    return (
                      <div
                        key={ann.id}
                        onClick={() => setActiveCommentId(ann.id === activeCommentId ? null : ann.id)}
                        className={cn(
                          "absolute w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer z-30 shadow hover:scale-110 transition-transform -translate-x-1/2 -translate-y-1/2",
                          ann.id === activeCommentId ? "ring-2 ring-white scale-110" : ""
                        )}
                        style={{
                          left: `${pos.x}%`,
                          top: `${pos.y}%`,
                          backgroundColor: ann.color,
                          color: '#fff',
                        }}
                        title="View comment details"
                      >
                        {idx + 1}
                      </div>
                    );
                  })}

                  {/* Render Compared Comments in transparent outline styling */}
                  {compareComments.map((ann, idx) => {
                    const pos = resolvedPositions[ann.id] || { x: ann.x || 0, y: ann.y || 0 };
                    return (
                      <div
                        key={`comp-${ann.id}`}
                        className="absolute w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] cursor-not-allowed z-30 shadow opacity-50 border-2 border-dashed -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `${pos.x}%`,
                          top: `${pos.y}%`,
                          borderColor: ann.color,
                          backgroundColor: 'transparent',
                          color: ann.color,
                        }}
                        title={`Old Rev annotation: ${ann.text}`}
                      >
                        {idx + 1}
                      </div>
                    );
                  })}

                  {/* Active Comment Pin Popover */}
                  {activeCommentId && (
                    (() => {
                      const ann = activeVersion.annotations.find((a) => a.id === activeCommentId);
                      if (!ann) return null;
                      const pos = resolvedPositions[ann.id] || { x: ann.x || 0, y: ann.y || 0 };
                      const commentIndex = activeComments.findIndex((c) => c.id === ann.id) + 1;
                      
                      return (
                        <div
                          className="absolute z-40 bg-popover border border-border rounded-lg shadow-xl p-3 max-w-xs text-xs -translate-x-1/2 mt-4"
                          style={{
                            left: `${pos.x}%`,
                            top: `${pos.y}%`,
                          }}
                        >
                          <div className="flex justify-between items-center mb-1.5 border-b pb-1">
                            <span className="font-bold text-primary">Comment #{commentIndex}</span>
                            <button
                              onClick={() => {
                                deleteAnnotation(activeView.id, activeVersion.id, ann.id);
                                setActiveCommentId(null);
                              }}
                              className="text-destructive hover:text-destructive/80 transition-colors"
                              title="Delete comment"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          
                          <textarea
                            className="w-full bg-secondary/50 border rounded px-1.5 py-1 text-xs outline-none text-foreground mb-1.5"
                            rows={3}
                            value={ann.text}
                            onChange={(e) => updateAnnotationText(activeView.id, activeVersion.id, ann.id, e.target.value)}
                          />

                          {ann.elementSelector && (
                            <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1 select-all bg-muted/40 p-1 rounded overflow-hidden truncate" title={ann.elementSelector}>
                              <Copy size={8} /> {ann.elementSelector}
                            </div>
                          )}
                          
                          <div className="flex justify-end mt-1.5">
                            <button
                              onClick={() => setActiveCommentId(null)}
                              className="px-2 py-0.5 rounded bg-secondary text-foreground text-[10px]"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  )}
                  
                  {/* Create Comment Pin Inline Popover */}
                  {pendingComment && (
                    <div
                      className="absolute z-40 bg-popover border border-border rounded-lg shadow-xl p-3 w-64 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${pendingComment.x}%`,
                        top: `${pendingComment.y}%`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-foreground">Add Screen Markup Comment</span>
                        <button
                          onClick={() => setPendingComment(null)}
                          className="p-0.5 rounded hover:bg-accent text-muted-foreground"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <textarea
                        placeholder="Describe usability feedback, style adjustments, or layout changes..."
                        className="w-full bg-secondary border border-border rounded px-2 py-1 text-xs outline-none text-foreground mb-2"
                        rows={3}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        autoFocus
                      />

                      {pendingComment.selector && (
                        <div className="text-[9px] text-muted-foreground font-mono mb-2 overflow-hidden truncate bg-muted/20 p-1 rounded">
                          Tethered: {pendingComment.selector}
                        </div>
                      )}

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setPendingComment(null)}
                          className="px-2 py-1 text-[10px] rounded hover:bg-accent border"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={submitComment}
                          className="px-2 py-1 text-[10px] rounded bg-primary text-primary-foreground font-semibold flex items-center gap-1"
                        >
                          <Check size={10} /> Add Comment
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground italic text-sm">
                No mockup view selected. Select a screen from the explorer.
              </div>
            )}
          </div>

        </div>
      ) : (
        
        // Workflow Mapping View (React Flow Nodes and Transitions)
        <div className="flex-1 h-full w-full bg-card overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onEdgeDoubleClick={handleEdgeDoubleClick}
            fitView
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
      )}

    </div>
  );
};
