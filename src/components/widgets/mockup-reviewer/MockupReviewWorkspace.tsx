import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Trash2, Copy, X, Check, Sparkles } from 'lucide-react';
import { useMockupReviewStore, IMockupAnnotation } from '../../../core/services/MockupReviewService';
import { HtmlShadowRenderer } from './HtmlShadowRenderer';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

interface MockupReviewWorkspaceProps {
  tool: 'select' | 'pen' | 'rect' | 'circle' | 'arrow' | 'comment' | 'eraser';
  color: string;
  selectedAnnotationId: string | null;
  setSelectedAnnotationId: (id: string | null) => void;
}

export const MockupReviewWorkspace: React.FC<MockupReviewWorkspaceProps> = ({
  tool,
  color,
  selectedAnnotationId,
  setSelectedAnnotationId,
}) => {
  const {
    views,
    activeViewId,
    compareVersionId,
    addAnnotation,
    undoAnnotation,
    deleteAnnotation,
    updateAnnotationText,
    setActiveViewId,
  } = useMockupReviewStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);
  const [drawStartPos, setDrawStartPos] = useState<{ x: number; y: number } | null>(null);
  const [tempShape, setTempShape] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ x: number; y: number } | null>(null);

  // Comment pin states
  const [pendingComment, setPendingComment] = useState<{ x: number; y: number; selector?: string } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  const shadowHostRef = useRef<HTMLDivElement | null>(null);
  const [resolvedPositions, setResolvedPositions] = useState<Record<string, { x: number; y: number }>>({});

  const activeView = useMemo(() => views.find((v) => v.id === activeViewId) || null, [views, activeViewId]);
  const activeVersion = useMemo(() => {
    if (!activeView) return null;
    return activeView.versions.find((v) => v.id === activeView.activeVersionId) || null;
  }, [activeView]);

  const parentView = useMemo(() => {
    if (!activeView || !activeView.parentId) return null;
    return views.find((v) => v.id === activeView.parentId) || null;
  }, [views, activeView]);

  const parentVersion = useMemo(() => {
    if (!parentView) return null;
    return parentView.versions.find((v) => v.id === parentView.activeVersionId) || null;
  }, [parentView]);

  const resolvedHtmlContent = useMemo(() => {
    if (!activeVersion) return '';
    const defaultPlaceholder = '<div style="padding: 2rem; color: #94a3b8; text-align: center;">Empty Mockup Panel</div>';
    if (activeVersion.htmlContent === defaultPlaceholder && parentVersion) {
      return parentVersion.htmlContent;
    }
    return activeVersion.htmlContent;
  }, [activeVersion, parentVersion]);

  const parentAnnotations = useMemo(() => {
    if (!parentVersion) return [];
    return parentVersion.annotations || [];
  }, [parentVersion]);

  const compareVersion = useMemo(() => {
    if (!activeView || !compareVersionId) return null;
    return activeView.versions.find((v) => v.id === compareVersionId) || null;
  }, [activeView, compareVersionId]);

  const activeComments = useMemo(() => {
    return activeVersion?.annotations.filter((a) => a.type === 'comment') || [];
  }, [activeVersion]);

  const compareComments = useMemo(() => {
    return compareVersion?.annotations.filter((a) => a.type === 'comment') || [];
  }, [compareVersion]);

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
    parentAnnotations.forEach(resolveAnn);

    setResolvedPositions(newPositions);
  }, [activeVersion, compareVersion, parentAnnotations]);

  useEffect(() => {
    const host = shadowHostRef.current;
    if (!host) return;

    const observer = new ResizeObserver(() => {
      updateTetheredPositions();
    });
    observer.observe(host);

    const timer = setTimeout(updateTetheredPositions, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [activeVersion, compareVersion, parentAnnotations, updateTetheredPositions]);

  // Scoped keydown listener for this workspace
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
        if (activeView && activeVersion && activeVersion.annotations.length > 0) {
          e.preventDefault();
          undoAnnotation(activeView.id, activeVersion.id);
          setSelectedAnnotationId(null);
        }
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedAnnotationId && activeView && activeVersion) {
          e.preventDefault();
          deleteAnnotation(activeView.id, activeVersion.id, selectedAnnotationId);
          setSelectedAnnotationId(null);
        } else if (activeCommentId && activeView && activeVersion) {
          e.preventDefault();
          deleteAnnotation(activeView.id, activeVersion.id, activeCommentId);
          setActiveCommentId(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAnnotationId, activeCommentId, activeView, activeVersion, undoAnnotation, deleteAnnotation, setSelectedAnnotationId]);

  const handleElementClick = (selector: string, clientX: number, clientY: number) => {
    if (tool !== 'comment' || !shadowHostRef.current) return;
    const hostRect = shadowHostRef.current.getBoundingClientRect();
    const x = ((clientX - hostRect.left) / hostRect.width) * 100;
    const y = ((clientY - hostRect.top) / hostRect.height) * 100;

    setPendingComment({ x, y, selector });
    setCommentText('');
  };

  const getCanvasCoords = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (tool === 'select' || tool === 'eraser') return;
    e.preventDefault();

    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setDrawStartPos(coords);
    setCurrentCoords(coords);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      console.warn("setPointerCapture failed", err);
    }

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
    e.preventDefault();

    const coords = getCanvasCoords(e);
    setCurrentCoords(coords);

    if (tool === 'pen') {
      setCurrentStroke((prev) => [...prev, coords]);
    } else if (['rect', 'circle', 'arrow'].includes(tool)) {
      setTempShape({
        x: Math.min(drawStartPos.x, coords.x),
        y: Math.min(drawStartPos.y, coords.y),
        w: Math.abs(coords.x - drawStartPos.x),
        h: Math.abs(coords.y - drawStartPos.y),
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing || !activeView || !activeVersion) return;
    setIsDrawing(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {
      console.warn("releasePointerCapture failed", err);
    }

    const annotationId = `ann-${Math.floor(Math.random() * 100000)}`;

    if (tool === 'pen' && currentStroke.length > 1) {
      addAnnotation(activeView.id, activeVersion.id, {
        id: annotationId,
        type: 'stroke',
        color,
        points: currentStroke,
      });
    } else if (['rect', 'circle', 'arrow'].includes(tool) && tempShape && drawStartPos) {
      const endPoint = currentCoords || drawStartPos;
      addAnnotation(activeView.id, activeVersion.id, {
        id: annotationId,
        type: tool as any,
        color,
        x: tempShape.x,
        y: tempShape.y,
        width: tempShape.w,
        height: tempShape.h,
        points: tool === 'arrow' ? [drawStartPos, endPoint] : undefined
      });
    }

    setCurrentStroke([]);
    setTempShape(null);
    setDrawStartPos(null);
    setCurrentCoords(null);
  };

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

  return (
    <div className="flex-1 flex flex-col bg-muted/10 overflow-hidden relative select-none">
      {activeView && activeView.parentId && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs flex justify-between items-center text-amber-500 select-none">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles size={12} className="text-amber-500 animate-pulse" />
            Inheriting template layout structure from <strong>{parentView?.name || 'Base Template'}</strong>
          </span>
          <button
            onClick={() => {
              if (activeView.parentId) setActiveViewId(activeView.parentId);
            }}
            className="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-[10px] font-semibold transition-colors border border-amber-500/20"
          >
            View Base Template
          </button>
        </div>
      )}

      {activeView && activeVersion ? (
        <div className="flex-1 p-6 flex justify-center items-start overflow-auto">
          <div className="relative border border-border shadow-lg bg-card rounded-lg overflow-hidden max-w-4xl w-full min-h-[400px]">
            {/* Safe HTML Content */}
            <HtmlShadowRenderer
              htmlContent={resolvedHtmlContent}
              onElementClick={handleElementClick}
              shadowHostRef={shadowHostRef}
            />

            {/* SVG Drawing Layer */}
            <svg
              className={cn(
                "absolute inset-0 w-full h-full z-20 pointer-events-auto",
                (tool === 'select' || tool === 'eraser') ? "pointer-events-none" : "cursor-crosshair"
              )}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                {renderArrowHeadMarker('arrowhead-red', '#ef4444')}
                {renderArrowHeadMarker('arrowhead-yellow', '#eab308')}
                {renderArrowHeadMarker('arrowhead-green', '#22c55e')}
                {renderArrowHeadMarker('arrowhead-blue', '#3b82f6')}
              </defs>

              {/* Active Annotations */}
              {activeVersion.annotations.map((ann) => {
                const isSelected = ann.id === selectedAnnotationId;

                const handleShapeClick = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (tool === 'select') {
                    setSelectedAnnotationId(isSelected ? null : ann.id);
                  } else if (tool === 'eraser') {
                    deleteAnnotation(activeView.id, activeVersion.id, ann.id);
                  }
                };

                const shapeClass = cn(
                  (tool === 'select' || tool === 'eraser') ? "pointer-events-auto cursor-pointer" : "pointer-events-none"
                );

                if (ann.type === 'stroke' && ann.points) {
                  return (
                    <g key={ann.id} className="group">
                      <path
                        key="hover-highlight"
                        d={generateSvgPath(ann.points)}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        opacity="0.5"
                        className={cn(
                          "pointer-events-none hidden",
                          tool === 'eraser' && "group-hover:block"
                        )}
                        pointerEvents="none"
                      />
                      {isSelected && (
                        <path
                          key="select-highlight"
                          d={generateSvgPath(ann.points)}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          vectorEffect="non-scaling-stroke"
                          opacity="0.5"
                          className="pointer-events-none"
                          pointerEvents="none"
                        />
                      )}
                      <path
                        key="actual"
                        d={generateSvgPath(ann.points)}
                        fill="none"
                        stroke={ann.color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        className={shapeClass}
                        onClick={handleShapeClick}
                      />
                    </g>
                  );
                }
                if (ann.type === 'rect' && ann.x !== undefined && ann.y !== undefined && ann.width && ann.height) {
                  return (
                    <g key={ann.id} className="group">
                      <rect
                        key="hover-highlight"
                        x={ann.x}
                        y={ann.y}
                        width={ann.width}
                        height={ann.height}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="6"
                        vectorEffect="non-scaling-stroke"
                        opacity="0.5"
                        className={cn(
                          "pointer-events-none hidden",
                          tool === 'eraser' && "group-hover:block"
                        )}
                        pointerEvents="none"
                      />
                      {isSelected && (
                        <rect
                          key="select-highlight"
                          x={ann.x}
                          y={ann.y}
                          width={ann.width}
                          height={ann.height}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="6"
                          vectorEffect="non-scaling-stroke"
                          opacity="0.5"
                          className="pointer-events-none"
                          pointerEvents="none"
                        />
                      )}
                      <rect
                        key="actual"
                        x={ann.x}
                        y={ann.y}
                        width={ann.width}
                        height={ann.height}
                        fill="none"
                        stroke={ann.color}
                        strokeWidth="2.5"
                        vectorEffect="non-scaling-stroke"
                        className={shapeClass}
                        onClick={handleShapeClick}
                      />
                    </g>
                  );
                }
                if (ann.type === 'circle' && ann.x !== undefined && ann.y !== undefined && ann.width) {
                  return (
                    <g key={ann.id} className="group">
                      <ellipse
                        key="hover-highlight"
                        cx={ann.x + ann.width / 2}
                        cy={ann.y + ann.height! / 2}
                        rx={ann.width / 2}
                        ry={ann.height! / 2}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="6"
                        vectorEffect="non-scaling-stroke"
                        opacity="0.5"
                        className={cn(
                          "pointer-events-none hidden",
                          tool === 'eraser' && "group-hover:block"
                        )}
                        pointerEvents="none"
                      />
                      {isSelected && (
                        <ellipse
                          key="select-highlight"
                          cx={ann.x + ann.width / 2}
                          cy={ann.y + ann.height! / 2}
                          rx={ann.width / 2}
                          ry={ann.height! / 2}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="6"
                          vectorEffect="non-scaling-stroke"
                          opacity="0.5"
                          className="pointer-events-none"
                          pointerEvents="none"
                        />
                      )}
                      <ellipse
                        key="actual"
                        cx={ann.x + ann.width / 2}
                        cy={ann.y + ann.height! / 2}
                        rx={ann.width / 2}
                        ry={ann.height! / 2}
                        fill="none"
                        stroke={ann.color}
                        strokeWidth="2.5"
                        vectorEffect="non-scaling-stroke"
                        className={shapeClass}
                        onClick={handleShapeClick}
                      />
                    </g>
                  );
                }
                if (ann.type === 'arrow' && ann.points && ann.points.length >= 2) {
                  const mId = ann.color === '#ef4444' ? 'arrowhead-red' : 
                               ann.color === '#eab308' ? 'arrowhead-yellow' : 
                               ann.color === '#22c55e' ? 'arrowhead-green' : 'arrowhead-blue';
                  return (
                    <g key={ann.id} className="group">
                      <line
                        key="hover-highlight"
                        x1={ann.points[0].x}
                        y1={ann.points[0].y}
                        x2={ann.points[1].x}
                        y2={ann.points[1].y}
                        stroke="#ef4444"
                        strokeWidth="6"
                        vectorEffect="non-scaling-stroke"
                        opacity="0.5"
                        className={cn(
                          "pointer-events-none hidden",
                          tool === 'eraser' && "group-hover:block"
                        )}
                        pointerEvents="none"
                      />
                      {isSelected && (
                        <line
                          key="select-highlight"
                          x1={ann.points[0].x}
                          y1={ann.points[0].y}
                          x2={ann.points[1].x}
                          y2={ann.points[1].y}
                          stroke="#3b82f6"
                          strokeWidth="6"
                          vectorEffect="non-scaling-stroke"
                          opacity="0.5"
                          className="pointer-events-none"
                          pointerEvents="none"
                        />
                      )}
                      <line
                        key="actual"
                        x1={ann.points[0].x}
                        y1={ann.points[0].y}
                        x2={ann.points[1].x}
                        y2={ann.points[1].y}
                        stroke={ann.color}
                        strokeWidth="2.5"
                        markerEnd={`url(#${mId})`}
                        vectorEffect="non-scaling-stroke"
                        className={shapeClass}
                        onClick={handleShapeClick}
                      />
                    </g>
                  );
                }
                return null;
              })}

              {/* Compare Overlay Annotations */}
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
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                }
                if (ann.type === 'rect' && ann.x !== undefined && ann.y !== undefined && ann.width && ann.height) {
                  return (
                    <rect
                      key={`comp-${ann.id}`}
                      x={ann.x}
                      y={ann.y}
                      width={ann.width}
                      height={ann.height}
                      fill="none"
                      stroke={ann.color}
                      strokeWidth="2"
                      strokeDasharray="4"
                      opacity="0.4"
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                }
                if (ann.type === 'circle' && ann.x !== undefined && ann.y !== undefined && ann.width) {
                  return (
                    <ellipse
                      key={`comp-${ann.id}`}
                      cx={ann.x + ann.width / 2}
                      cy={ann.y + ann.height! / 2}
                      rx={ann.width / 2}
                      ry={ann.height! / 2}
                      fill="none"
                      stroke={ann.color}
                      strokeWidth="2"
                      strokeDasharray="4"
                      opacity="0.4"
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                }
              })}

              {/* Inherited Parent Annotations */}
              {parentAnnotations.map((ann) => {
                if (ann.type === 'stroke' && ann.points) {
                  return (
                    <path
                      key={`parent-ann-${ann.id}`}
                      d={generateSvgPath(ann.points)}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeDasharray="4"
                      opacity="0.6"
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                }
                if (ann.type === 'rect' && ann.x !== undefined && ann.y !== undefined && ann.width && ann.height) {
                  return (
                    <rect
                      key={`parent-ann-${ann.id}`}
                      x={ann.x}
                      y={ann.y}
                      width={ann.width}
                      height={ann.height}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeDasharray="4"
                      opacity="0.6"
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                }
                if (ann.type === 'circle' && ann.x !== undefined && ann.y !== undefined && ann.width) {
                  return (
                    <ellipse
                      key={`parent-ann-${ann.id}`}
                      cx={ann.x + ann.width / 2}
                      cy={ann.y + ann.height! / 2}
                      rx={ann.width / 2}
                      ry={ann.height! / 2}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeDasharray="4"
                      opacity="0.6"
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                }
                if (ann.type === 'arrow' && ann.points && ann.points.length >= 2) {
                  return (
                    <line
                      key={`parent-ann-${ann.id}`}
                      x1={ann.points[0].x}
                      y1={ann.points[0].y}
                      x2={ann.points[1].x}
                      y2={ann.points[1].y}
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeDasharray="4"
                      opacity="0.6"
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                }
                return null;
              })}

              {/* In-Progress Previews */}
              {isDrawing && (
                <>
                  {tool === 'pen' && currentStroke.length > 1 && (
                    <path
                      d={generateSvgPath(currentStroke)}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                  {tool === 'rect' && tempShape && (
                    <rect
                      x={tempShape.x}
                      y={tempShape.y}
                      width={tempShape.w}
                      height={tempShape.h}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      strokeDasharray="2"
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                  {tool === 'circle' && tempShape && (
                    <ellipse
                      cx={tempShape.x + tempShape.w / 2}
                      cy={tempShape.y + tempShape.h / 2}
                      rx={tempShape.w / 2}
                      ry={tempShape.h / 2}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      strokeDasharray="2"
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                  {tool === 'arrow' && drawStartPos && currentCoords && (
                    <line
                      x1={drawStartPos.x}
                      y1={drawStartPos.y}
                      x2={currentCoords.x}
                      y2={currentCoords.y}
                      stroke={color}
                      strokeWidth="2"
                      strokeDasharray="2"
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                </>
              )}
            </svg>

            {/* Active Comment Pin Markers */}
            {activeComments.map((ann, idx) => {
              const pos = resolvedPositions[ann.id] || { x: ann.x || 0, y: ann.y || 0 };
              return (
                <div
                  key={ann.id}
                  onClick={() => {
                    if (tool === 'eraser') {
                      deleteAnnotation(activeView.id, activeVersion.id, ann.id);
                    } else {
                      setActiveCommentId(ann.id === activeCommentId ? null : ann.id);
                    }
                  }}
                  className={cn(
                    "absolute w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer z-30 shadow hover:scale-110 transition-transform -translate-x-1/2 -translate-y-1/2",
                    ann.id === activeCommentId ? "ring-2 ring-white scale-110" : "",
                    tool === 'eraser' ? "hover:bg-destructive hover:scale-110 border border-destructive" : ""
                  )}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    backgroundColor: tool === 'eraser' ? '#ef4444' : ann.color,
                    color: '#fff',
                  }}
                  title={tool === 'eraser' ? "Click to erase comment" : "View comment details"}
                >
                  {idx + 1}
                </div>
              );
            })}

            {/* Compared Comments */}
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

            {/* Inherited Template Comments */}
            {parentAnnotations.filter(a => a.type === 'comment').map((ann, idx) => {
              const pos = resolvedPositions[ann.id] || { x: ann.x || 0, y: ann.y || 0 };
              return (
                <div
                  key={`parent-comment-${ann.id}`}
                  className="absolute w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] cursor-help z-30 shadow border-2 border-dashed border-amber-500 text-amber-500 bg-amber-500/10 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                  }}
                  title={`Template comment: ${ann.text}`}
                >
                  {String.fromCharCode(65 + idx)}
                </div>
              );
            })}

            {/* Active Comment Details Popover */}
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
                    className="px-2 py-1 text-[10px] rounded hover:bg-accent border border-border text-foreground"
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
  );
};
