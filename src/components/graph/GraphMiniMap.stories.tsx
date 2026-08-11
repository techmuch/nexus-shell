import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { GraphMiniMap } from './GraphMiniMap';
import { GraphCanvas } from './GraphCanvas';
import { GraphNode } from './GraphNode';
import { GraphEdge, GraphEdgeLayer } from './GraphEdge';
import {
  IDENTITY_VIEWPORT,
  type IGraphEdge,
  type IGraphNode,
  type IViewport,
} from '../../lib/graph';

/** A graph large enough that the minimap earns its place. */
const NODES: IGraphNode[] = Array.from({ length: 40 }, (_, i) => ({
  id: `n${i}`,
  position: { x: (i % 8) * 260, y: Math.floor(i / 8) * 190 },
  size: { width: 160, height: 64 },
  kind: ['source', 'step', 'sink'][i % 3],
  data: { label: `Node ${i}` },
}));

const EDGES: IGraphEdge[] = NODES.slice(1).map((node, i) => ({
  id: `e${i}`,
  source: NODES[i].id,
  target: node.id,
}));

const KIND_FILL: Record<string, string> = {
  source: 'hsl(var(--primary))',
  step: 'hsl(var(--muted-foreground))',
  sink: 'hsl(var(--destructive))',
};

const meta = {
  title: 'Graph/GraphMiniMap',
  component: GraphMiniMap,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A scaled overview of the whole graph, with an indicator showing what the canvas is currently looking at.\n\nClick anywhere to jump there, drag to pan continuously, or focus it and use the arrow keys. Zoom is never changed — a minimap answers "where am I", and changing scale on a click makes that answer harder to trust.\n\nThe plotted extent is the union of the graph bounds and the current viewport, so the indicator stays visible even when you have panned far away from every node.\n\nFully controlled: it reads `viewport` and reports where you want to go, but never moves the canvas itself. It needs `canvasSize` — take it from `GraphCanvas`\'s `onSizeChange`.',
      },
    },
  },
} satisfies Meta<typeof GraphMiniMap>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Wired to a real canvas: pan the field, or drive it from the minimap. */
export const WithCanvas: Story = {
  args: { nodes: NODES, viewport: IDENTITY_VIEWPORT, canvasSize: { width: 0, height: 0 } },
  render: function Render() {
    const [viewport, setViewport] = useState<IViewport>({ x: 40, y: 40, scale: 0.55 });
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

    return (
      <div className="h-[520px] border-b border-border">
        <GraphCanvas
          viewport={viewport}
          onViewportChange={setViewport}
          onSizeChange={setCanvasSize}
          overlay={
            <GraphMiniMap
              nodes={NODES}
              viewport={viewport}
              canvasSize={canvasSize}
              onViewportChange={setViewport}
              nodeColor={(node) => KIND_FILL[node.kind ?? 'step']}
              className="absolute bottom-3 right-3"
            />
          }
        >
          <GraphEdgeLayer>
            {EDGES.map((edge) => (
              <GraphEdge
                key={edge.id}
                edge={edge}
                source={byId[edge.source]}
                target={byId[edge.target]}
              />
            ))}
          </GraphEdgeLayer>

          {NODES.map((node) => (
            <GraphNode key={node.id} node={node} draggable={false}>
              <div className="flex h-full items-center px-3">
                <p className="text-xs font-medium">
                  {(node.data as { label: string }).label}
                </p>
              </div>
            </GraphNode>
          ))}
        </GraphCanvas>
      </div>
    );
  },
};

/** Without `onViewportChange` it is a read-only overview, not a control. */
export const ReadOnly: Story = {
  args: {
    nodes: NODES,
    viewport: { x: -200, y: -140, scale: 0.5 },
    canvasSize: { width: 800, height: 520 },
  },
  decorators: [
    (Story) => (
      <div className="grid h-[240px] place-items-center bg-muted/30">
        <Story />
      </div>
    ),
  ],
};

/** `highlightIds` picks out a selection or a set of search results. */
export const Highlighted: Story = {
  args: {
    nodes: NODES,
    viewport: { x: -200, y: -140, scale: 0.5 },
    canvasSize: { width: 800, height: 520 },
    highlightIds: ['n3', 'n11', 'n19', 'n27'],
  },
  decorators: [
    (Story) => (
      <div className="grid h-[240px] place-items-center bg-muted/30">
        <Story />
      </div>
    ),
  ],
};

/** `nodeColor` receives the node, so an app can colour by its own `kind`. */
export const ColouredByKind: Story = {
  args: {
    nodes: NODES,
    viewport: { x: -200, y: -140, scale: 0.5 },
    canvasSize: { width: 800, height: 520 },
    nodeColor: (node: IGraphNode) => KIND_FILL[node.kind ?? 'step'],
    width: 240,
    height: 160,
  },
  decorators: [
    (Story) => (
      <div className="grid h-[240px] place-items-center bg-muted/30">
        <Story />
      </div>
    ),
  ],
};

/**
 * Panned a long way from every node. The plotted extent unions the graph with
 * the viewport, so the indicator stays on screen instead of disappearing.
 */
export const PannedAway: Story = {
  args: {
    nodes: NODES,
    viewport: { x: -6000, y: -4000, scale: 0.5 },
    canvasSize: { width: 800, height: 520 },
  },
  decorators: [
    (Story) => (
      <div className="grid h-[240px] place-items-center bg-muted/30">
        <Story />
      </div>
    ),
  ],
};

/** The empty state: no nodes, just the viewport indicator. */
export const Empty: Story = {
  args: {
    nodes: [],
    viewport: IDENTITY_VIEWPORT,
    canvasSize: { width: 800, height: 520 },
  },
  decorators: [
    (Story) => (
      <div className="grid h-[240px] place-items-center bg-muted/30">
        <Story />
      </div>
    ),
  ],
};
