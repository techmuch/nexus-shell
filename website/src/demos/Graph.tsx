import { useCallback, useRef, useState } from 'react';
import { Circle, Diamond, Server, Square } from 'lucide-react';
import {
  GraphCanvas,
  GraphEdge,
  GraphEdgeLayer,
  GraphMiniMap,
  GraphNode,
  NodePalette,
  nextId,
  readPaletteDrag,
  removeNode,
  useGraphKeyboard,
  type GraphCanvasHandle,
  type IGraphEdge,
  type IGraphNode,
  type IViewport,
  type ResolvedOrientation,
} from 'nexus-shell';

/* -------------------------------------------------------------------------- */
/* Shared helpers                                                             */
/* -------------------------------------------------------------------------- */

interface NodeData {
  label: string;
}

const label = (node: IGraphNode) => (node.data as NodeData | undefined)?.label ?? node.id;

const move = (nodes: IGraphNode[], id: string, position: { x: number; y: number }) =>
  nodes.map((n) => (n.id === id ? { ...n, position } : n));

/* -------------------------------------------------------------------------- */
/* Canvas alone                                                               */
/* -------------------------------------------------------------------------- */

// #region canvas
export const CanvasOnly = () => (
  // The canvas owns exactly one thing: the mapping between screen pixels and
  // graph space. Drag to pan, wheel or pinch to zoom — always about the cursor.
  <GraphCanvas>
    <div
      style={{ position: 'absolute', left: 60, top: 40 }}
      className="rounded-lg border border-border bg-card px-4 py-3 text-xs shadow-sm"
    >
      Anything positioned in graph coordinates
    </div>
    <div
      style={{ position: 'absolute', left: 260, top: 160 }}
      className="rounded-lg border border-border bg-card px-4 py-3 text-xs shadow-sm"
    >
      …lands in the right place
    </div>
  </GraphCanvas>
);
// #endregion

/* -------------------------------------------------------------------------- */
/* Nodes and edges                                                            */
/* -------------------------------------------------------------------------- */

// #region nodesAndEdges
const PIPELINE: IGraphNode[] = [
  { id: 'ingest', position: { x: 40, y: 120 }, kind: 'source', data: { label: 'Ingest' } },
  { id: 'clean', position: { x: 280, y: 60 }, kind: 'step', data: { label: 'Normalise' } },
  { id: 'score', position: { x: 280, y: 200 }, kind: 'step', data: { label: 'Score' } },
  { id: 'sink', position: { x: 520, y: 130 }, kind: 'sink', data: { label: 'Warehouse' } },
];

const PIPELINE_EDGES: IGraphEdge[] = [
  { id: 'e1', source: 'ingest', target: 'clean' },
  { id: 'e2', source: 'ingest', target: 'score' },
  { id: 'e3', source: 'clean', target: 'sink', label: 'clean' },
  { id: 'e4', source: 'score', target: 'sink', label: 'scored' },
];

export const NodesAndEdges = () => {
  const [nodes, setNodes] = useState(PIPELINE);
  const [selected, setSelected] = useState<string | null>(null);
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <GraphCanvas>
      {/* Edges sit beneath the nodes on their own SVG surface. Which sides
          they attach to is worked out from relative position, so dragging a
          node re-routes its edges with no configuration. */}
      <GraphEdgeLayer>
        {PIPELINE_EDGES.map((edge) => (
          <GraphEdge
            key={edge.id}
            edge={edge}
            source={byId[edge.source]}
            target={byId[edge.target]}
          />
        ))}
      </GraphEdgeLayer>

      {nodes.map((node) => (
        <GraphNode
          key={node.id}
          node={node}
          selected={node.id === selected}
          onSelect={setSelected}
          onMove={(id, position) => setNodes((current) => move(current, id, position))}
        >
          <div className="flex h-full flex-col justify-center px-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {node.kind}
            </p>
            <p className="text-sm font-medium">{label(node)}</p>
          </div>
        </GraphNode>
      ))}
    </GraphCanvas>
  );
};
// #endregion

/* -------------------------------------------------------------------------- */
/* Keyboard-driven editor                                                     */
/* -------------------------------------------------------------------------- */

// #region keyboard
const START: IGraphNode[] = [
  { id: 'root', position: { x: 200, y: 140 }, data: { label: 'Start here' } },
];

export const KeyboardEditor = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState(START);
  const [edges, setEdges] = useState<IGraphEdge[]>([]);

  const createNode = useCallback(
    (position: { x: number; y: number }) => {
      const id = nextId('node', nodes);
      setNodes((current) => [...current, { id, position, data: { label: 'Untitled' } }]);
      return id;
    },
    [nodes],
  );

  const keyboard = useGraphKeyboard({
    nodes,
    edges,
    targetRef: canvasRef,
    onCreateNode: createNode,
    onConnect: (source, target) =>
      setEdges((current) => [...current, { id: nextId('edge', current), source, target }]),
    onDeleteNode: (id) => {
      const result = removeNode(nodes, edges, id);
      setNodes(result.nodes);
      setEdges(result.edges);
    },
    onMoveNode: (id, position) => setNodes((current) => move(current, id, position)),
  });

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div ref={canvasRef} tabIndex={0} className="h-full outline-none">
      <GraphCanvas>
        <GraphEdgeLayer>
          {edges.map((edge) => (
            <GraphEdge
              key={edge.id}
              edge={edge}
              source={byId[edge.source]}
              target={byId[edge.target]}
            />
          ))}
        </GraphEdgeLayer>

        {nodes.map((node) => (
          <GraphNode
            key={node.id}
            node={node}
            focused={node.id === keyboard.focusedId}
            selected={node.id === keyboard.connectingFrom}
            onSelect={keyboard.setFocusedId}
            onActivate={keyboard.setEditingId}
            onMove={(id, position) => setNodes((current) => move(current, id, position))}
          >
            <div className="flex h-full items-center px-3">
              {keyboard.editingId === node.id ? (
                // Editing is the app's concern; the hook only says *when*.
                <input
                  autoFocus
                  defaultValue={label(node)}
                  onBlur={(e) => {
                    setNodes((current) =>
                      current.map((n) =>
                        n.id === node.id ? { ...n, data: { label: e.target.value } } : n,
                      ),
                    );
                    keyboard.setEditingId(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                  className="w-full bg-transparent text-sm outline-none"
                />
              ) : (
                <p className="text-sm font-medium">{label(node)}</p>
              )}
            </div>
          </GraphNode>
        ))}
      </GraphCanvas>
    </div>
  );
};
// #endregion

/* -------------------------------------------------------------------------- */
/* Drag to create                                                             */
/* -------------------------------------------------------------------------- */

// #region palette
const PALETTE = [
  { kind: 'service', label: 'Service', icon: <Server size={13} />, description: 'A running process' },
  { kind: 'queue', label: 'Queue', icon: <Square size={13} />, description: 'A buffer' },
  { kind: 'gate', label: 'Gate', icon: <Diamond size={13} />, description: 'A decision' },
  { kind: 'store', label: 'Store', icon: <Circle size={13} />, description: 'Persistent state' },
];

export const DragToCreate = () => {
  const canvas = useRef<GraphCanvasHandle>(null);
  const [nodes, setNodes] = useState<IGraphNode[]>([]);

  const add = (kind: string, position: { x: number; y: number }) =>
    setNodes((current) => [
      ...current,
      { id: nextId(kind, current), kind, position, data: { label: kind } },
    ]);

  return (
    <GraphCanvas
      ref={canvas}
      // The palette carries only the kind; what a node of that kind *is* is
      // decided here, in the app.
      onDrop={(point, event) => {
        const kind = readPaletteDrag(event);
        if (kind) add(kind, point);
      }}
      overlay={
        <div className="absolute left-3 top-3">
          <NodePalette
            items={PALETTE}
            // Clicking works too, so the palette is usable without a pointer.
            onSelect={(item) => add(item.kind, { x: 120, y: 120 })}
          />
        </div>
      }
    >
      {nodes.map((node) => (
        <GraphNode
          key={node.id}
          node={node}
          onMove={(id, position) => setNodes((current) => move(current, id, position))}
        >
          <div className="flex h-full items-center px-3">
            <p className="text-sm font-medium capitalize">{node.kind}</p>
          </div>
        </GraphNode>
      ))}
    </GraphCanvas>
  );
};
// #endregion

/* -------------------------------------------------------------------------- */
/* Edge routing                                                               */
/* -------------------------------------------------------------------------- */

// #region routing
const PAIR: IGraphNode[] = [
  { id: 'a', position: { x: 40, y: 40 }, data: { label: 'From' } },
  { id: 'b', position: { x: 360, y: 200 }, data: { label: 'To' } },
];

export const EdgeRouting = () => {
  const [nodes, setNodes] = useState(PAIR);
  const [routing, setRouting] = useState<'bezier' | 'smoothstep' | 'straight'>('bezier');
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <GraphCanvas
      overlay={
        <div className="absolute left-3 top-3 flex gap-1 rounded-lg border border-border bg-card/90 p-1 backdrop-blur-sm">
          {(['bezier', 'smoothstep', 'straight'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRouting(option)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                routing === option
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      }
    >
      <GraphEdgeLayer>
        <GraphEdge
          edge={{ id: 'e', source: 'a', target: 'b', label: routing }}
          source={byId.a}
          target={byId.b}
          routing={routing}
        />
      </GraphEdgeLayer>

      {nodes.map((node) => (
        <GraphNode
          key={node.id}
          node={node}
          onMove={(id, position) => setNodes((current) => move(current, id, position))}
        >
          <div className="flex h-full items-center px-3">
            <p className="text-sm font-medium">{label(node)}</p>
          </div>
        </GraphNode>
      ))}
    </GraphCanvas>
  );
};
// #endregion

/* -------------------------------------------------------------------------- */
/* Minimap                                                                    */
/* -------------------------------------------------------------------------- */

// #region minimap
/** A graph big enough that an overview earns its place. */
const LARGE: IGraphNode[] = Array.from({ length: 36 }, (_, i) => ({
  id: `n${i}`,
  position: { x: (i % 6) * 260, y: Math.floor(i / 6) * 190 },
  size: { width: 160, height: 64 },
  kind: ['source', 'step', 'sink'][i % 3],
  data: { label: `Node ${i}` },
}));

const LARGE_EDGES: IGraphEdge[] = LARGE.slice(1).map((node, i) => ({
  id: `e${i}`,
  source: LARGE[i].id,
  target: node.id,
}));

const KIND_FILL: Record<string, string> = {
  source: 'hsl(var(--primary))',
  step: 'hsl(var(--muted-foreground))',
  sink: 'hsl(var(--destructive))',
};

export const MiniMap = () => {
  // The minimap is controlled, so the viewport has to live here — this is the
  // one case where owning it is worth the wiring.
  const [viewport, setViewport] = useState<IViewport>({ x: 40, y: 40, scale: 0.5 });
  // `canvasSize` comes from the canvas: without it the indicator can't be drawn.
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [selected, setSelected] = useState<string | null>(null);

  const byId = Object.fromEntries(LARGE.map((n) => [n.id, n]));

  return (
    <GraphCanvas
      viewport={viewport}
      onViewportChange={setViewport}
      onSizeChange={setCanvasSize}
      onCanvasClick={() => setSelected(null)}
      overlay={
        <GraphMiniMap
          nodes={LARGE}
          viewport={viewport}
          canvasSize={canvasSize}
          onViewportChange={setViewport}
          // Colour by the app's own node kinds.
          nodeColor={(node) => KIND_FILL[node.kind ?? 'step']}
          highlightIds={selected ? [selected] : undefined}
          className="absolute bottom-3 right-3"
        />
      }
    >
      <GraphEdgeLayer>
        {LARGE_EDGES.map((edge) => (
          <GraphEdge
            key={edge.id}
            edge={edge}
            source={byId[edge.source]}
            target={byId[edge.target]}
          />
        ))}
      </GraphEdgeLayer>

      {LARGE.map((node) => (
        <GraphNode
          key={node.id}
          node={node}
          selected={node.id === selected}
          onSelect={setSelected}
          draggable={false}
        >
          <div className="flex h-full items-center px-3">
            <p className="text-xs font-medium">{label(node)}</p>
          </div>
        </GraphNode>
      ))}
    </GraphCanvas>
  );
};
// #endregion

/* -------------------------------------------------------------------------- */
/* Palette orientation                                                        */
/* -------------------------------------------------------------------------- */

// #region orientation
const PALETTE_ITEMS = [
  { kind: 'service', label: 'Service', icon: <Server size={13} /> },
  { kind: 'queue', label: 'Queue', icon: <Square size={13} /> },
  { kind: 'gate', label: 'Gate', icon: <Diamond size={13} /> },
  { kind: 'store', label: 'Store', icon: <Circle size={13} /> },
];

export const PaletteOrientations = () => {
  // `auto` reports what it settled on, so surrounding layout can follow.
  const [wide, setWide] = useState<ResolvedOrientation>('horizontal');
  const [rail, setRail] = useState<ResolvedOrientation>('horizontal');

  return (
    <div className="flex h-full gap-4 p-4">
      {/* A narrow rail: too tight for a row, so auto stacks it. */}
      <aside className="w-[150px] shrink-0">
        <p className="mb-2 text-[11px] text-muted-foreground">
          150px rail → <span className="font-mono text-foreground">{rail}</span>
        </p>
        <NodePalette items={PALETTE_ITEMS} onOrientationChange={setRail} />
      </aside>

      {/* A wide strip: the items fit a row, so auto keeps them in one. */}
      <section className="flex-1">
        <p className="mb-2 text-[11px] text-muted-foreground">
          Wide strip → <span className="font-mono text-foreground">{wide}</span>
        </p>
        <NodePalette items={PALETTE_ITEMS} onOrientationChange={setWide} />

        <p className="mt-6 mb-2 text-[11px] text-muted-foreground">
          Explicit <code className="font-mono">vertical</code>, icons only
        </p>
        <div className="w-[52px]">
          <NodePalette items={PALETTE_ITEMS} orientation="vertical" iconOnly />
        </div>
      </section>
    </div>
  );
};
// #endregion
