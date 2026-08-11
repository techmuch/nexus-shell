import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Maximize, ZoomIn, ZoomOut } from 'lucide-react';
import { GraphCanvas, type GraphCanvasHandle } from './GraphCanvas';
import { GraphNode } from './GraphNode';
import { nextId, type IGraphNode, type IViewport } from '../../lib/graph';

const NODES: IGraphNode[] = [
  { id: 'a', position: { x: 60, y: 60 }, data: { label: 'One' } },
  { id: 'b', position: { x: 340, y: 180 }, data: { label: 'Two' } },
  { id: 'c', position: { x: 120, y: 300 }, data: { label: 'Three' } },
];

const label = (node: IGraphNode) => (node.data as { label: string }).label;

const Body = ({ children }: { children: string }) => (
  <div className="flex h-full items-center px-3">
    <p className="text-sm font-medium">{children}</p>
  </div>
);

const meta = {
  title: 'Graph/GraphCanvas',
  component: GraphCanvas,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'An infinite, pannable, zoomable field to draw a graph on.\n\nThe canvas owns exactly one thing: the mapping between screen pixels and graph space. It knows nothing about nodes, edges, or what any of it means — children render inside a transformed layer, so anything positioned in graph coordinates lands in the right place.\n\nDrag empty space to pan, wheel or pinch to zoom. Zoom is always anchored to the cursor. Hold space to pan from anywhere, including over a node.\n\nViewport state is internal by default — you should not have to own pan and zoom just to draw a graph. Pass `viewport` to take control.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="h-[420px] border-b border-border">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GraphCanvas>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Drag to pan, wheel or pinch to zoom. */
export const Default: Story = {
  args: {},
  render: function Render() {
    const [nodes, setNodes] = useState(NODES);
    return (
      <GraphCanvas>
        {nodes.map((node) => (
          <GraphNode
            key={node.id}
            node={node}
            onMove={(id, position) =>
              setNodes((c) => c.map((n) => (n.id === id ? { ...n, position } : n)))
            }
          >
            <Body>{label(node)}</Body>
          </GraphNode>
        ))}
      </GraphCanvas>
    );
  },
};

/** Without the dot grid, and with a coarser one. */
export const Grid: Story = {
  args: {},
  render: () => (
    <div className="grid h-full grid-cols-2 divide-x divide-border">
      <GraphCanvas grid={false}>
        <div style={{ position: 'absolute', left: 40, top: 40 }} className="text-xs text-muted-foreground">
          grid={'{false}'}
        </div>
      </GraphCanvas>
      <GraphCanvas gridSize={64}>
        <div style={{ position: 'absolute', left: 40, top: 40 }} className="text-xs text-muted-foreground">
          gridSize={'{64}'}
        </div>
      </GraphCanvas>
    </div>
  ),
};

/**
 * `overlay` renders in screen space, unaffected by pan and zoom — the right
 * place for toolbars. The imperative handle drives the viewport.
 */
export const WithOverlayControls: Story = {
  args: {},
  render: function Render() {
    const canvas = useRef<GraphCanvasHandle>(null);
    const [nodes, setNodes] = useState(NODES);

    return (
      <GraphCanvas
        ref={canvas}
        overlay={
          <div className="absolute bottom-3 left-3 flex gap-1 rounded-lg border border-border bg-card/90 p-1 backdrop-blur-sm">
            {[
              ['Zoom in', ZoomIn, () => canvas.current?.zoomBy(1.25)],
              ['Zoom out', ZoomOut, () => canvas.current?.zoomBy(0.8)],
              ['Fit', Maximize, () => canvas.current?.fitTo(nodes)],
            ].map(([title, Icon, onClick]) => {
              const Component = Icon as typeof ZoomIn;
              return (
                <button
                  key={title as string}
                  type="button"
                  title={title as string}
                  onClick={onClick as () => void}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Component size={14} />
                </button>
              );
            })}
          </div>
        }
      >
        {nodes.map((node) => (
          <GraphNode
            key={node.id}
            node={node}
            onMove={(id, position) =>
              setNodes((c) => c.map((n) => (n.id === id ? { ...n, position } : n)))
            }
          >
            <Body>{label(node)}</Body>
          </GraphNode>
        ))}
      </GraphCanvas>
    );
  },
};

/** Pass `viewport` to take control. Here a slider drives the zoom. */
export const ControlledViewport: Story = {
  args: {},
  render: function Render() {
    const [viewport, setViewport] = useState<IViewport>({ x: 0, y: 0, scale: 1 });

    return (
      <GraphCanvas
        viewport={viewport}
        onViewportChange={setViewport}
        overlay={
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-lg border border-border bg-card/90 px-3 py-2 backdrop-blur-sm">
            <label htmlFor="zoom" className="text-[11px] text-muted-foreground">
              zoom
            </label>
            <input
              id="zoom"
              type="range"
              min={0.2}
              max={2}
              step={0.05}
              value={viewport.scale}
              onChange={(e) =>
                setViewport((v) => ({ ...v, scale: Number(e.target.value) }))
              }
            />
            <span className="w-10 font-mono text-[11px] tabular-nums text-muted-foreground">
              {viewport.scale.toFixed(2)}
            </span>
          </div>
        }
      >
        {NODES.map((node) => (
          <GraphNode key={node.id} node={node} draggable={false}>
            <Body>{label(node)}</Body>
          </GraphNode>
        ))}
      </GraphCanvas>
    );
  },
};

/** Click empty canvas to drop a node exactly where you clicked. */
export const ClickToCreate: Story = {
  args: {},
  render: function Render() {
    const [nodes, setNodes] = useState<IGraphNode[]>([]);

    return (
      <GraphCanvas
        onCanvasClick={(point) =>
          setNodes((current) => [
            ...current,
            { id: nextId('node', current), position: point, data: { label: 'Node' } },
          ])
        }
        overlay={
          nodes.length === 0 ? (
            <p className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-muted-foreground">
              Click anywhere to add a node.
            </p>
          ) : null
        }
      >
        {nodes.map((node) => (
          <GraphNode
            key={node.id}
            node={node}
            onMove={(id, position) =>
              setNodes((c) => c.map((n) => (n.id === id ? { ...n, position } : n)))
            }
          >
            <Body>{label(node)}</Body>
          </GraphNode>
        ))}
      </GraphCanvas>
    );
  },
};

/** With panning and zooming off, the canvas is a static coordinate space. */
export const Locked: Story = {
  args: { pannable: false, zoomable: false },
  render: (args) => (
    <GraphCanvas {...args}>
      {NODES.map((node) => (
        <GraphNode key={node.id} node={node} draggable={false}>
          <Body>{label(node)}</Body>
        </GraphNode>
      ))}
    </GraphCanvas>
  ),
};
