import { useCallback, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Circle, Diamond, Server, Square } from 'lucide-react';
import { GraphCanvas } from './GraphCanvas';
import { GraphNode } from './GraphNode';
import { GraphEdge, GraphEdgeLayer } from './GraphEdge';
import { NodePalette, readPaletteDrag } from './NodePalette';
import { useGraphKeyboard } from './useGraphKeyboard';
import {
  nextId,
  removeNode,
  type IGraphEdge,
  type IGraphNode,
  type IPoint,
} from '../../lib/graph';

/**
 * These stories compose the graph primitives into the editors they exist to
 * support. Nothing here is a library component — it is all caller code, which
 * is the point: the layer is decomposed enough that an editor is assembly
 * rather than configuration.
 */

const label = (node: IGraphNode) => (node.data as { label?: string } | undefined)?.label ?? node.id;

const moveNode = (nodes: IGraphNode[], id: string, position: IPoint) =>
  nodes.map((n) => (n.id === id ? { ...n, position } : n));

const meta = {
  title: 'Graph/Editors',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Complete editors assembled from the graph primitives. Each is ordinary application code — the library supplies the canvas, node, edge, keyboard and palette, and nothing else.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="h-[520px] border-b border-border">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/* -------------------------------------------------------------------------- */

const KEY_HINTS = [
  ['↑ ↓ ← →', 'move focus'],
  ['⇧ + arrows', 'nudge'],
  ['Tab', 'new connected node'],
  ['Enter', 'edit'],
  ['c then Enter', 'connect'],
  ['Delete', 'remove'],
  ['Esc', 'back out'],
];

const KeyboardEditor = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<IGraphNode[]>([
    { id: 'root', position: { x: 220, y: 180 }, data: { label: 'Start here' } },
  ]);
  const [edges, setEdges] = useState<IGraphEdge[]>([]);

  const createNode = useCallback(
    (position: IPoint) => {
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
      const next = removeNode(nodes, edges, id);
      setNodes(next.nodes);
      setEdges(next.edges);
    },
    onMoveNode: (id, position) => setNodes((current) => moveNode(current, id, position)),
  });

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div ref={canvasRef} tabIndex={0} className="h-full outline-none">
      <GraphCanvas
        overlay={
          <div className="absolute bottom-3 left-3 rounded-lg border border-border bg-card/90 p-2.5 backdrop-blur-sm">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Keyboard
            </p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[11px]">
              {KEY_HINTS.map(([key, action]) => (
                <div key={key} className="contents">
                  <dt className="font-mono text-foreground">{key}</dt>
                  <dd className="text-muted-foreground">{action}</dd>
                </div>
              ))}
            </dl>
          </div>
        }
      >
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
            onMove={(id, position) => setNodes((c) => moveNode(c, id, position))}
          >
            <div className="flex h-full items-center px-3">
              {keyboard.editingId === node.id ? (
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

/**
 * Click the canvas once to focus it, then build a graph without touching the
 * mouse: press an arrow to take focus, Tab to create a connected node, type a
 * name, Enter to commit.
 */
export const KeyboardDriven: Story = {
  render: () => <KeyboardEditor />,
};

/* -------------------------------------------------------------------------- */

const PALETTE = [
  { kind: 'service', label: 'Service', icon: <Server size={13} /> },
  { kind: 'queue', label: 'Queue', icon: <Square size={13} /> },
  { kind: 'gate', label: 'Gate', icon: <Diamond size={13} /> },
  { kind: 'store', label: 'Store', icon: <Circle size={13} /> },
];

const KIND_ACCENT: Record<string, string> = {
  service: 'border-l-4 border-l-blue-500',
  queue: 'border-l-4 border-l-amber-500',
  gate: 'border-l-4 border-l-violet-500',
  store: 'border-l-4 border-l-emerald-500',
};

const ArchitectureEditor = () => {
  const [nodes, setNodes] = useState<IGraphNode[]>([]);
  const [edges, setEdges] = useState<IGraphEdge[]>([]);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const add = (kind: string, position: IPoint) =>
    setNodes((current) => [
      ...current,
      { id: nextId(kind, current), kind, position, data: { label: kind } },
    ]);

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <GraphCanvas
      onDrop={(point, event) => {
        const kind = readPaletteDrag(event);
        if (kind) add(kind, point);
      }}
      onCanvasClick={() => setConnectingFrom(null)}
      overlay={
        <>
          <div className="absolute left-3 top-3">
            <NodePalette items={PALETTE} onSelect={(item) => add(item.kind, { x: 160, y: 160 })} />
          </div>
          {nodes.length === 0 && (
            <p className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-muted-foreground">
              Drag a type from the palette, or click one.
            </p>
          )}
        </>
      }
    >
      <GraphEdgeLayer>
        {edges.map((edge) => (
          <GraphEdge
            key={edge.id}
            edge={edge}
            source={byId[edge.source]}
            target={byId[edge.target]}
            routing="smoothstep"
          />
        ))}
      </GraphEdgeLayer>

      {nodes.map((node) => (
        <GraphNode
          key={node.id}
          node={node}
          selected={node.id === connectingFrom}
          className={node.kind ? KIND_ACCENT[node.kind] : undefined}
          onMove={(id, position) => setNodes((c) => moveNode(c, id, position))}
          // Dragging a port starts a connection; releasing over a node ends it.
          onConnectStart={setConnectingFrom}
          onConnectEnd={(targetId) => {
            if (connectingFrom && connectingFrom !== targetId) {
              setEdges((current) => [
                ...current,
                { id: nextId('edge', current), source: connectingFrom, target: targetId },
              ]);
            }
            setConnectingFrom(null);
          }}
        >
          <div className="flex h-full flex-col justify-center px-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {node.kind}
            </p>
            <p className="text-sm font-medium capitalize">{label(node)}</p>
          </div>
        </GraphNode>
      ))}
    </GraphCanvas>
  );
};

/**
 * Drag types from the palette onto the field, then hover a node and drag one of
 * its ports onto another to connect them.
 */
export const DragAndDrop: Story = {
  render: () => <ArchitectureEditor />,
};

/* -------------------------------------------------------------------------- */

const ARGUMENT_NODES: IGraphNode[] = [
  { id: 'q', position: { x: 40, y: 180 }, kind: 'question', data: { label: 'Ship v1 this quarter?' } },
  { id: 'i1', position: { x: 320, y: 60 }, kind: 'idea', data: { label: 'Limited beta first' } },
  { id: 'i2', position: { x: 320, y: 300 }, kind: 'idea', data: { label: 'Cut scope, ship all' } },
  { id: 'p1', position: { x: 600, y: 20 }, kind: 'pro', data: { label: 'Feedback before the API sets' } },
  { id: 'c1', position: { x: 600, y: 130 }, kind: 'con', data: { label: 'Two migration paths' } },
  { id: 'p2', position: { x: 600, y: 300 }, kind: 'pro', data: { label: 'One release to document' } },
];

const ARGUMENT_EDGES: IGraphEdge[] = [
  { id: 'e1', source: 'q', target: 'i1' },
  { id: 'e2', source: 'q', target: 'i2' },
  { id: 'e3', source: 'i1', target: 'p1', label: 'supports' },
  { id: 'e4', source: 'i1', target: 'c1', label: 'objects' },
  { id: 'e5', source: 'i2', target: 'p2', label: 'supports' },
];

const KIND_STYLE: Record<string, string> = {
  question: 'border-l-4 border-l-sky-500',
  idea: 'border-l-4 border-l-amber-500',
  pro: 'border-l-4 border-l-emerald-500',
  con: 'border-l-4 border-l-red-500',
};

/**
 * The same primitives as an argument map — the case the old dialogue mapper
 * hardcoded. Node kinds are application data here, not library types.
 */
export const ArgumentMap: Story = {
  render: function Render() {
    const [nodes, setNodes] = useState(ARGUMENT_NODES);
    const [selected, setSelected] = useState<string | null>(null);
    const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

    return (
      <GraphCanvas onCanvasClick={() => setSelected(null)}>
        <GraphEdgeLayer>
          {ARGUMENT_EDGES.map((edge) => (
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
            className={node.kind ? KIND_STYLE[node.kind] : undefined}
            onSelect={setSelected}
            onMove={(id, position) => setNodes((c) => moveNode(c, id, position))}
          >
            <div className="flex h-full flex-col justify-center px-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {node.kind}
              </p>
              <p className="text-xs font-medium leading-snug">{label(node)}</p>
            </div>
          </GraphNode>
        ))}
      </GraphCanvas>
    );
  },
};
