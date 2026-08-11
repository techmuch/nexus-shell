import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Hand, LayoutGrid, MoveDown, MoveRight, Wand2 } from 'lucide-react';
import { GraphCanvas } from './GraphCanvas';
import { GraphNode } from './GraphNode';
import { GraphEdge, GraphEdgeLayer } from './GraphEdge';
import { FREEFORM, useGraphLayout, type LayoutMode } from './useGraphLayout';
import { layeredLayout } from '../../lib/layout';
import { cn } from '../../lib/cn';
import type { IGraphEdge, IGraphNode } from '../../lib/graph';

/** A pipeline with a couple of branches, deliberately placed badly. */
const NODES: IGraphNode[] = [
  { id: 'ingest', position: { x: 40, y: 300 }, data: { label: 'Ingest' } },
  { id: 'parse', position: { x: 320, y: 40 }, data: { label: 'Parse' } },
  { id: 'validate', position: { x: 90, y: 120 }, data: { label: 'Validate' } },
  { id: 'enrich', position: { x: 520, y: 260 }, data: { label: 'Enrich' } },
  { id: 'score', position: { x: 260, y: 400 }, data: { label: 'Score' } },
  { id: 'store', position: { x: 600, y: 60 }, data: { label: 'Store' } },
];

const EDGES: IGraphEdge[] = [
  { id: 'e1', source: 'ingest', target: 'parse' },
  { id: 'e2', source: 'ingest', target: 'validate' },
  { id: 'e3', source: 'parse', target: 'enrich' },
  { id: 'e4', source: 'validate', target: 'score' },
  { id: 'e5', source: 'enrich', target: 'store' },
  { id: 'e6', source: 'score', target: 'store' },
];

const label = (node: IGraphNode) => (node.data as { label: string }).label;

const MODE_ICON: Record<string, typeof Hand> = {
  [FREEFORM]: Hand,
  vertical: MoveDown,
  horizontal: MoveRight,
  grid: LayoutGrid,
};

const meta = {
  title: 'Graph/Layout',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Layout engines are pure functions from a graph to repositioned nodes — testable in isolation, and replaceable with your own.\n\n`useGraphLayout` applies one and adds the mode concept. Under an **auto layout** positions come from the engine and your stored positions are left alone. Under **`freeform`** positions are exactly yours.\n\nDragging a node while an auto layout is active escapes to freeform rather than fighting the engine. That is what makes auto layout usable in an editor: you can always grab a node, and the graph stops rearranging itself the moment you do.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="h-[560px] border-b border-border">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/* -------------------------------------------------------------------------- */

interface EditorProps {
  defaultMode?: LayoutMode;
  layouts?: Parameters<typeof useGraphLayout>[0]['layouts'];
  escapeOnDrag?: boolean;
  showBake?: boolean;
}

const LayoutEditor = ({
  defaultMode = FREEFORM,
  layouts,
  escapeOnDrag = true,
  showBake = false,
}: EditorProps) => {
  const [nodes, setNodes] = useState(NODES);
  const [selected, setSelected] = useState<string | null>(null);

  const layout = useGraphLayout({
    nodes,
    edges: EDGES,
    layouts,
    defaultMode,
    escapeOnDrag,
    onNodeMove: (id, position) =>
      setNodes((current) => current.map((n) => (n.id === id ? { ...n, position } : n))),
  });

  const byId = Object.fromEntries(layout.nodes.map((n) => [n.id, n]));

  return (
    <GraphCanvas
      onCanvasClick={() => setSelected(null)}
      overlay={
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-lg border border-border bg-card/90 p-1 backdrop-blur-sm">
          {/* A mode picker is a few lines of your own UI — the library ships
              the engines and the mode, not the toolbar. */}
          {[FREEFORM, ...layout.available].map((mode) => {
            const Icon = MODE_ICON[mode] ?? Wand2;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => layout.setMode(mode)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors',
                  layout.mode === mode
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon size={12} />
                {mode}
              </button>
            );
          })}

          {showBake && (
            <button
              type="button"
              disabled={!layout.isAuto}
              onClick={() => setNodes(layout.bake())}
              title="Write the computed positions back, so hand editing starts from them"
              className="ml-1 rounded-md border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              Bake
            </button>
          )}
        </div>
      }
    >
      <GraphEdgeLayer>
        {EDGES.map((edge) => (
          <GraphEdge
            key={edge.id}
            edge={edge}
            source={byId[edge.source]}
            target={byId[edge.target]}
            routing="smoothstep"
          />
        ))}
      </GraphEdgeLayer>

      {layout.nodes.map((node) => (
        <GraphNode
          key={node.id}
          node={node}
          selected={node.id === selected}
          onSelect={setSelected}
          onMove={layout.onMove}
        >
          <div className="flex h-full items-center px-3">
            <p className="text-sm font-medium">{label(node)}</p>
          </div>
        </GraphNode>
      ))}
    </GraphCanvas>
  );
};

/* -------------------------------------------------------------------------- */

/**
 * Start in freeform with a deliberately messy arrangement, then switch layouts.
 * Switch back to freeform and the mess returns — an auto layout never
 * overwrites your positions.
 */
export const Modes: Story = {
  render: () => <LayoutEditor />,
};

/**
 * Start under a layout, then drag any node. The mode drops to freeform and the
 * node stays where you put it, rather than snapping back.
 */
export const FreeformEscape: Story = {
  render: () => <LayoutEditor defaultMode="vertical" />,
};

/**
 * `bake` writes the computed positions back so hand editing continues from the
 * laid-out arrangement instead of the one underneath it. Pick a layout, press
 * Bake, then switch to freeform.
 */
export const Bake: Story = {
  render: () => <LayoutEditor defaultMode="vertical" showBake />,
};

/**
 * With `escapeOnDrag` off the engine keeps placing nodes, so a drag has no
 * visible effect. For a derived visualisation rather than an editor.
 */
export const NoEscape: Story = {
  render: () => <LayoutEditor defaultMode="horizontal" escapeOnDrag={false} />,
};

/**
 * Any `(nodes, edges) => nodes` function is a layout. Here two extra
 * configurations of the built-in layered engine are registered alongside.
 */
export const CustomLayouts: Story = {
  render: () => (
    <LayoutEditor
      defaultMode="upward"
      layouts={{
        upward: layeredLayout({ direction: 'up' }),
        leftward: layeredLayout({ direction: 'left' }),
        airy: layeredLayout({ direction: 'down', layerSpacing: 220, nodeSpacing: 120 }),
      }}
    />
  ),
};
