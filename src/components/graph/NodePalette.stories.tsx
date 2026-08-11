import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Circle, Diamond, Server, Square, Triangle, Workflow } from 'lucide-react';
import { NodePalette, type ResolvedOrientation } from './NodePalette';

const ITEMS = [
  { kind: 'service', label: 'Service', icon: <Server size={13} />, description: 'A running process' },
  { kind: 'queue', label: 'Queue', icon: <Square size={13} />, description: 'A buffer' },
  { kind: 'gate', label: 'Gate', icon: <Diamond size={13} />, description: 'A decision' },
  { kind: 'store', label: 'Store', icon: <Circle size={13} />, description: 'Persistent state' },
  { kind: 'job', label: 'Job', icon: <Triangle size={13} />, description: 'Scheduled work' },
  { kind: 'flow', label: 'Flow', icon: <Workflow size={13} />, description: 'A sub-graph' },
];

const meta = {
  title: 'Graph/NodePalette',
  component: NodePalette,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A palette of node types that can be dragged onto a `GraphCanvas`, or activated with the keyboard.\n\nThe palette carries only the item’s `kind` on the drag; what a node of that kind actually *is* is decided by your drop handler. Every item is a real button, so `onSelect` fires on click or Enter — a drag-only palette is unreachable without a pointer.\n\n**Orientation.** `auto` (the default) measures the space its container gives it and picks a row if the items fit the width, otherwise a column if they fit the height, otherwise a wrapping row. Pass `horizontal` or `vertical` when you already know.',
      },
    },
  },
} satisfies Meta<typeof NodePalette>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A row, wrapping when it runs out of width. */
export const Horizontal: Story = {
  args: { items: ITEMS, orientation: 'horizontal' },
  decorators: [
    (Story) => (
      <div className="w-[560px] p-4 bg-muted/30">
        <Story />
      </div>
    ),
  ],
};

/** A column, for a narrow rail beside the canvas. */
export const Vertical: Story = {
  args: { items: ITEMS, orientation: 'vertical' },
  decorators: [
    (Story) => (
      <div className="w-[160px] p-4 bg-muted/30">
        <Story />
      </div>
    ),
  ],
};

/** Icons only, for the narrowest rails. Labels stay in the accessibility tree. */
export const IconOnly: Story = {
  args: { items: ITEMS, orientation: 'vertical', iconOnly: true },
  decorators: [
    (Story) => (
      <div className="w-[80px] p-4 bg-muted/30">
        <Story />
      </div>
    ),
  ],
};

/**
 * The same palette in three containers. `auto` measures each and picks the axis
 * that fits — wide goes to a row, narrow to a column, small to a wrapping row.
 */
export const Auto: Story = {
  args: { items: ITEMS },
  render: function Render(args) {
    const [wide, setWide] = useState<ResolvedOrientation>('horizontal');
    const [narrow, setNarrow] = useState<ResolvedOrientation>('horizontal');
    const [tiny, setTiny] = useState<ResolvedOrientation>('horizontal');

    const Caption = ({ label, value }: { label: string; value: string }) => (
      <p className="mb-2 text-[11px] text-muted-foreground">
        {label} → <span className="font-mono text-foreground">{value}</span>
      </p>
    );

    return (
      <div className="flex gap-6 items-start p-4 bg-muted/30">
        <div style={{ width: 620 }}>
          <Caption label="620px wide" value={wide} />
          <NodePalette {...args} onOrientationChange={setWide} />
        </div>

        <div style={{ width: 150, height: 320 }}>
          <Caption label="150px wide, 320 tall" value={narrow} />
          <NodePalette {...args} onOrientationChange={setNarrow} />
        </div>

        <div style={{ width: 150, height: 90 }}>
          <Caption label="150 × 90" value={tiny} />
          <NodePalette {...args} onOrientationChange={setTiny} />
        </div>
      </div>
    );
  },
};

/** Drag the handle to resize, and watch `auto` switch axis as the room changes. */
export const AutoResizable: Story = {
  args: { items: ITEMS },
  render: function Render(args) {
    const [orientation, setOrientation] = useState<ResolvedOrientation>('horizontal');

    return (
      <div className="p-4 bg-muted/30">
        <p className="mb-2 text-[11px] text-muted-foreground">
          Resolved: <span className="font-mono text-foreground">{orientation}</span> — drag
          the bottom-right corner.
        </p>
        <div
          style={{ resize: 'both', overflow: 'auto', width: 560, height: 260, minWidth: 90 }}
          className="rounded-lg border border-dashed border-border p-3"
        >
          <NodePalette {...args} onOrientationChange={setOrientation} />
        </div>
      </div>
    );
  },
};

/** A single item fits anywhere, so `auto` always resolves to a row. */
export const SingleItem: Story = {
  args: { items: [ITEMS[0]] },
  decorators: [
    (Story) => (
      <div className="w-[300px] p-4 bg-muted/30">
        <Story />
      </div>
    ),
  ],
};
