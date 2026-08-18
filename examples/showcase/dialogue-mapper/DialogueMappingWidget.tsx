import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TabNode } from 'flexlayout-react';
import { AlertCircle, ClipboardPaste, Copy, Scissors, Trash2 } from 'lucide-react';

import {
  ContextMenu,
  FREEFORM,
  GraphCanvas,
  GraphEdge,
  GraphEdgeLayer,
  GraphMiniMap,
  GraphNode,
  readPaletteDrag,
  SidebarPane,
  useGraphKeyboard,
  useGraphLayout,
  type GraphCanvasHandle,
  type IContextMenuItem,
  type IGraphEdge,
  type IPoint,
  type IViewport,
} from '../../../src/index';

import {
  DIALOGUE_LAYOUTS,
  getMapStore,
  NODE_SIZE,
  type DialogueNode,
  type IbisNodeType,
} from './DialogueMappingService';
import { IBIS_COLOURS, IbisNode } from './components/IbisNode';
import { DialogueMapRepository } from './services/DialogueMapRepository';
import { FlowControlToolbar } from './FlowControlToolbar';
import { DialogueMapperLibrary } from './DialogueMapperLibrary';
import { DialogueMapperInspector } from './DialogueMapperInspector';

/**
 * The dialogue mapper.
 *
 * Every general capability here comes from the library — the infinite canvas,
 * node placement and dragging, edge routing, the minimap, spatial keyboard
 * navigation, auto layout, the palette and the inspector. What is left in this
 * file is the part that is genuinely about dialogue mapping: IBIS validation on
 * connect, the shortcut keys for the nine node types, and clipboard semantics.
 */

export interface DialogueMappingWidgetProps {
  node?: TabNode;
  /** Kept for compatibility; the canvas pans on empty space either way. */
  defaultDragMode?: 'pan' | 'select';
  mapId: string;
}

type MenuTarget = { x: number; y: number; kind: 'node' | 'edge' | 'pane'; id?: string };

/** Shortcut key → node type, from the palette's own definition. */
const SHORTCUT_TYPES: Record<string, IbisNodeType> = {
  q: 'question',
  '?': 'question',
  a: 'idea',
  '!': 'idea',
  p: 'pro',
  '+': 'pro',
  n: 'note',
  d: 'decision',
  l: 'link',
  i: 'image',
  m: 'map',
};

export const DialogueMappingWidget: React.FC<DialogueMappingWidgetProps> = ({
  node,
  mapId,
}) => {
  const useStore = useMemo(() => getMapStore(mapId), [mapId]);

  if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).useDialogueMappingStore = useStore;
  }

  const {
    nodes,
    edges,
    selectedIds,
    layoutHistory,
    connectionError,
    autoLayoutMode,
    setNodes,
    setEdges,
    setSelectedIds,
    setAutoLayoutMode,
    setConnectionError,
    addNode,
    deleteNode,
    deleteEdge,
    deleteSelection,
    connectNodes,
    moveNode,
    recordHistory,
    undoLayout,
  } = useStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<GraphCanvasHandle>(null);

  const [viewport, setViewport] = useState<IViewport>({ x: 0, y: 0, scale: 1 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [menu, setMenu] = useState<MenuTarget | null>(null);
  const [clipboard, setClipboard] = useState<{
    nodes: DialogueNode[];
    edges: IGraphEdge[];
  } | null>(null);

  const [isLibraryOpen, setIsLibraryOpen] = useState(!node?.getConfig()?.hideInternalLibrary);
  const [isInspectorOpen, setIsInspectorOpen] = useState(
    !node?.getConfig()?.hideInternalInspector,
  );

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  /* ---------------------------------------------------------------- layout */

  /**
   * Layout is computed, never stored.
   *
   * The old version wrote laid-out positions into the store on a timer after
   * every add, connect and delete, which is why nodes used to jump. Here the
   * hook derives positions on render, and dragging a node escapes to freeform
   * so the drag survives.
   */
  const layout = useGraphLayout({
    nodes,
    edges,
    layouts: DIALOGUE_LAYOUTS,
    mode: autoLayoutMode,
    onModeChange: (mode) => setAutoLayoutMode(mode as typeof autoLayoutMode),
    onNodeMove: (id, position) => moveNode(id, position),
  });

  const laidOut = layout.nodes as DialogueNode[];

  /* ------------------------------------------------------------- keyboard */

  const keyboard = useGraphKeyboard({
    nodes: laidOut,
    edges,
    targetRef: containerRef,
    onCreateNode: (position, context) => addNode('idea', position, context.from),
    // Routed through the store so IBIS rules apply however a connection is made.
    onConnect: (source, target) => {
      connectNodes(source, target);
    },
    onDeleteNode: (id) => {
      recordHistory();
      deleteNode(id);
    },
    onMoveNode: (id, position) => layout.onMove(id, position),
    onFocusChange: (id) => setSelectedIds(id ? [id] : []),
  });

  /** New nodes open for editing, which is what `autoEdit` meant. */
  const create = useCallback(
    (type: IbisNodeType, position: IPoint, parentId?: string | null) => {
      recordHistory();
      const id = addNode(type, position, parentId);
      keyboard.setFocusedId(id);
      keyboard.setEditingId(id);
      return id;
    },
    [addNode, recordHistory, keyboard],
  );

  /** Where a node goes when created without a pointer position. */
  const centreOfView = useCallback((): IPoint => {
    const point = canvasRef.current?.clientToGraph({
      x: (containerRef.current?.getBoundingClientRect().left ?? 0) + canvasSize.width / 2,
      y: (containerRef.current?.getBoundingClientRect().top ?? 0) + canvasSize.height / 2,
    });
    return point ?? { x: 350, y: 150 };
  }, [canvasSize]);

  /* IBIS shortcut keys. Separate from `useGraphKeyboard` because which key
     makes which kind of node is a property of IBIS, not of graphs. */
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (node && !node.isVisible()) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // `c` is the library's connect binding, so con nodes take the minus key
      // alone. Two meanings for one key would make neither reliable.
      const type = e.key === '-' ? 'con' : SHORTCUT_TYPES[e.key];
      if (!type) return;

      e.preventDefault();
      const parent = keyboard.focusedId ? byId.get(keyboard.focusedId) : undefined;

      create(
        type,
        parent
          ? { x: parent.position.x, y: parent.position.y + NODE_SIZE.height + 70 }
          : centreOfView(),
        parent?.id,
      );
    };

    element.addEventListener('keydown', onKeyDown);
    return () => element.removeEventListener('keydown', onKeyDown);
  }, [node, keyboard.focusedId, byId, create, centreOfView]);

  /* Undo, on the platform shortcut. */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (node && !node.isVisible()) return;
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z') return;
      if (layoutHistory.length === 0) return;

      e.preventDefault();
      undoLayout();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [node, layoutHistory.length, undoLayout]);

  /* ------------------------------------------------------- load and save */

  useEffect(() => {
    let mounted = true;
    DialogueMapRepository.loadMap(mapId)
      .then((content) => {
        if (content && mounted) useStore.getState().importMap(content);
      })
      .catch((e) => console.error('Failed to load map data', e));
    return () => {
      mounted = false;
    };
  }, [mapId, useStore]);

  useEffect(() => {
    if (nodes.length === 0 && edges.length === 0) return;
    const handle = setTimeout(() => {
      DialogueMapRepository.saveMap(mapId, nodes, edges).catch(console.error);
    }, 2000);
    return () => clearTimeout(handle);
  }, [nodes, edges, mapId]);

  /* Connection warnings clear themselves. */
  useEffect(() => {
    if (!connectionError) return;
    const handle = setTimeout(() => setConnectionError(null), 4000);
    return () => clearTimeout(handle);
  }, [connectionError, setConnectionError]);

  /* ------------------------------------------------------------ selection */

  const select = useCallback(
    (id: string, event?: React.MouseEvent) => {
      keyboard.setFocusedId(id);
      setSelectedIds(
        event?.shiftKey || event?.metaKey
          ? selectedIds.includes(id)
            ? selectedIds.filter((s) => s !== id)
            : [...selectedIds, id]
          : [id],
      );
    },
    [selectedIds, setSelectedIds, keyboard],
  );

  /* ------------------------------------------------------------ clipboard */

  const selectedNodes = useMemo(
    () => nodes.filter((n) => selectedIds.includes(n.id)),
    [nodes, selectedIds],
  );

  /** Copies the selection plus the edges wholly inside it. */
  const snapshot = useCallback(() => {
    const ids = new Set(selectedIds);
    return {
      nodes: selectedNodes,
      edges: edges.filter((e) => ids.has(e.source) && ids.has(e.target)),
    };
  }, [selectedIds, selectedNodes, edges]);

  const paste = useCallback(
    (at: IPoint) => {
      if (!clipboard || clipboard.nodes.length === 0) return;

      recordHistory();
      const stamp = Date.now();
      const minX = Math.min(...clipboard.nodes.map((n) => n.position.x));
      const minY = Math.min(...clipboard.nodes.map((n) => n.position.y));

      const idMap = new Map<string, string>();
      const pasted = clipboard.nodes.map((original, index) => {
        const id = `node-${stamp}-${index}`;
        idMap.set(original.id, id);
        return {
          ...original,
          id,
          position: {
            x: at.x + (original.position.x - minX),
            y: at.y + (original.position.y - minY),
          },
          data: { ...original.data, autoEdit: false },
        };
      });

      const pastedEdges = clipboard.edges.flatMap((edge, index) => {
        const source = idMap.get(edge.source);
        const target = idMap.get(edge.target);
        return source && target ? [{ ...edge, id: `edge-${stamp}-${index}`, source, target }] : [];
      });

      setNodes([...nodes, ...pasted]);
      setEdges([...edges, ...pastedEdges]);
      setSelectedIds(pasted.map((n) => n.id));
      // A paste is hand placement by definition, so stop the layout moving it.
      if (layout.isAuto) setAutoLayoutMode(FREEFORM as typeof autoLayoutMode);
    },
    [
      clipboard,
      nodes,
      edges,
      recordHistory,
      setNodes,
      setEdges,
      setSelectedIds,
      layout.isAuto,
      setAutoLayoutMode,
    ],
  );

  /* ---------------------------------------------------------- context menu */

  const menuItems = (): IContextMenuItem[] => {
    if (!menu) return [];

    if (menu.kind === 'edge' && menu.id) {
      const id = menu.id;
      return [
        {
          label: 'Delete Connection',
          icon: <Trash2 size={14} className="text-destructive" />,
          onClick: () => deleteEdge(id),
        },
      ];
    }

    if (menu.kind === 'node') {
      const many = selectedIds.length > 1;
      return [
        {
          label: many ? 'Cut Selection' : 'Cut Node',
          icon: <Scissors size={14} />,
          onClick: () => {
            setClipboard(snapshot());
            deleteSelection();
          },
        },
        {
          label: many ? 'Copy Selection' : 'Copy Node',
          icon: <Copy size={14} />,
          onClick: () => setClipboard(snapshot()),
        },
        {
          label: many ? 'Delete Selection' : 'Delete Node',
          icon: <Trash2 size={14} className="text-destructive" />,
          onClick: deleteSelection,
        },
      ];
    }

    return [
      {
        label: clipboard ? (clipboard.nodes.length > 1 ? 'Paste Selection' : 'Paste Node') : 'Paste (Empty)',
        icon: <ClipboardPaste size={14} />,
        disabled: !clipboard,
        onClick: () => {
          const point = canvasRef.current?.clientToGraph({ x: menu.x, y: menu.y });
          if (point) paste(point);
        },
      },
    ];
  };

  const openMenu = (kind: MenuTarget['kind'], point: IPoint, id?: string) =>
    setMenu({ x: point.x, y: point.y, kind, id });

  /* ------------------------------------------------------------------ view */

  return (
    <div className="relative flex h-full w-full select-none overflow-hidden bg-background/95 font-sans text-foreground">
      {isLibraryOpen && (
        <DialogueMapperLibrary
          className="z-10 h-full border-r border-border bg-card/45"
          onAddNode={(type) => create(type, centreOfView(), keyboard.focusedId)}
        />
      )}

      {connectionError && (
        <div
          role="alert"
          className="animate-slide-in-down absolute left-1/2 top-16 z-50 flex -translate-x-1/2 select-text items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/15 px-4 py-2 text-xs font-semibold text-destructive shadow-xl backdrop-blur"
        >
          <AlertCircle size={15} />
          <span>Semantic Rejection: {connectionError}</span>
        </div>
      )}

      <main
        ref={containerRef}
        tabIndex={-1}
        className="relative flex h-full min-w-0 flex-1 flex-col outline-none"
      >
        <div className="z-40 flex w-full shrink-0 select-none items-center border-b border-border bg-card px-4 py-2 shadow-sm">
          <FlowControlToolbar
            variant="header"
            autoLayoutMode={autoLayoutMode}
            onAutoLayoutModeChange={setAutoLayoutMode}
            onUndo={undoLayout}
            canUndo={layoutHistory.length > 0}
            isLibraryOpen={isLibraryOpen}
            onToggleLibrary={() => setIsLibraryOpen(!isLibraryOpen)}
            isInspectorOpen={isInspectorOpen}
            onToggleInspector={() => setIsInspectorOpen(!isInspectorOpen)}
          />
        </div>

        <div className="relative h-full min-h-0 w-full flex-1">
          <GraphCanvas
            ref={canvasRef}
            aria-label="Dialogue map"
            onViewportChange={setViewport}
            onSizeChange={setCanvasSize}
            onCanvasClick={() => {
              setMenu(null);
              setSelectedIds([]);
              keyboard.setFocusedId(null);
            }}
            onCanvasDoubleClick={(point) => create('question', point, null)}
            onCanvasContextMenu={(point, event) =>
              openMenu('pane', { x: event.clientX, y: event.clientY })
            }
            onDrop={(point, event) => {
              const kind = readPaletteDrag(event);
              if (kind) create(kind as IbisNodeType, point, null);
            }}
            overlay={
              <div className="pointer-events-auto absolute bottom-3 right-3">
                <GraphMiniMap
                  nodes={laidOut}
                  viewport={viewport}
                  canvasSize={canvasSize}
                  onViewportChange={(next) => canvasRef.current?.setViewport(next)}
                  highlightIds={selectedIds}
                  nodeColor={(n) => IBIS_COLOURS[(n as DialogueNode).kind] ?? '#64748b'}
                  className="rounded-lg border border-border/60 bg-card/65"
                />
              </div>
            }
          >
            <GraphEdgeLayer>
              {edges.map((edge) => {
                const source = byId.get(edge.source);
                const target = byId.get(edge.target);
                if (!source || !target) return null;

                return (
                  <GraphEdge
                    key={edge.id}
                    edge={edge}
                    source={source}
                    target={target}
                    routing="smoothstep"
                    onSelect={() => setMenu(null)}
                    onContextMenu={(id, point) => openMenu('edge', point, id)}
                  />
                );
              })}
            </GraphEdgeLayer>

            {laidOut.map((graphNode) => (
              <GraphNode
                key={graphNode.id}
                node={graphNode}
                selected={selectedIds.includes(graphNode.id)}
                focused={keyboard.focusedId === graphNode.id}
                onMove={layout.onMove}
                onMoveEnd={() => recordHistory()}
                onSelect={(id, event) => {
                  setMenu(null);
                  select(id, event);
                }}
                onActivate={(id) => keyboard.setEditingId(id)}
                onContextMenu={(id, point) => {
                  if (!selectedIds.includes(id)) select(id);
                  openMenu('node', point, id);
                }}
                onConnectStart={(id) => keyboard.setConnectingFrom(id)}
                onConnectEnd={(targetId) => {
                  if (keyboard.connectingFrom && keyboard.connectingFrom !== targetId) {
                    connectNodes(keyboard.connectingFrom, targetId);
                  }
                  keyboard.setConnectingFrom(null);
                }}
              >
                <IbisNode
                  type={graphNode.kind}
                  data={graphNode.data}
                  editing={keyboard.editingId === graphNode.id}
                  onEditingChange={(editing) =>
                    keyboard.setEditingId(editing ? graphNode.id : null)
                  }
                  onTitleChange={(title) =>
                    useStore.getState().updateNode(graphNode.id, { title })
                  }
                />
              </GraphNode>
            ))}
          </GraphCanvas>
        </div>
      </main>

      {isInspectorOpen && (
        <SidebarPane
          title="Argument Inspector"
          side="right"
          width="320px"
          onClose={() => setIsInspectorOpen(false)}
          className="z-10 bg-card/45"
        >
          <DialogueMapperInspector mapId={mapId} />
        </SidebarPane>
      )}

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          items={menuItems()}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  );
};

export default DialogueMappingWidget;
