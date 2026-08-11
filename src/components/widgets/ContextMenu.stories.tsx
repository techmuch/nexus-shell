import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Copy, Scissors, Trash2 } from 'lucide-react';
import { ContextMenu } from './ContextMenu';

const meta = {
  title: 'Primitives/ContextMenu',
  component: ContextMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A floating menu positioned at viewport coordinates. Renders `position: fixed` at the given point and closes on outside click or Escape. It does not decide when to appear — mount it conditionally from your own `onContextMenu` handler and store the coordinates yourself.',
      },
    },
  },
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const ITEMS = [
  { label: 'Cut', icon: <Scissors size={14} />, onClick: () => {} },
  { label: 'Copy', icon: <Copy size={14} />, onClick: () => {} },
  {
    label: 'Delete',
    icon: <Trash2 size={14} className="text-destructive" />,
    divider: true,
    onClick: () => {},
  },
];

/** Pinned in place so the menu can be inspected without right-clicking. */
export const Default: Story = {
  args: { x: 40, y: 40, items: ITEMS, onClose: () => {} },
  decorators: [
    (Story) => (
      <div className="h-[260px] relative">
        <Story />
      </div>
    ),
  ],
};

/** `disabled` greys an entry out and makes it non-interactive. */
export const WithDisabledItems: Story = {
  args: {
    x: 40,
    y: 40,
    onClose: () => {},
    items: [
      { label: 'Cut', icon: <Scissors size={14} />, onClick: () => {} },
      { label: 'Paste', onClick: () => {}, disabled: true },
      { label: 'Delete', divider: true, onClick: () => {}, disabled: true },
    ],
  },
  decorators: [
    (Story) => (
      <div className="h-[260px] relative">
        <Story />
      </div>
    ),
  ],
};

/** Right-click the surface to open the menu where you clicked. */
export const Interactive: Story = {
  args: { x: 0, y: 0, items: ITEMS, onClose: () => {} },
  render: function Render() {
    const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
    const [action, setAction] = useState<string | null>(null);

    return (
      <div
        onContextMenu={(e) => {
          e.preventDefault();
          setMenu({ x: e.clientX, y: e.clientY });
        }}
        className="h-[320px] flex items-center justify-center bg-muted/30 text-sm text-muted-foreground select-none"
      >
        {action ? `Chose: ${action}` : 'Right-click anywhere in this area.'}
        {menu && (
          <ContextMenu
            x={menu.x}
            y={menu.y}
            items={ITEMS.map((item) => ({
              ...item,
              onClick: () => setAction(item.label),
            }))}
            onClose={() => setMenu(null)}
          />
        )}
      </div>
    );
  },
};
