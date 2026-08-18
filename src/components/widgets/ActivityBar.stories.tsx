import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Bug,
  Files,
  GitBranch,
  MessageSquare,
  Package,
  Search,
  Settings,
} from 'lucide-react';
import { ActivityBar } from './ActivityBar';

const ITEMS = [
  { id: 'files', label: 'Explorer', icon: Files },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'scm', label: 'Source Control', icon: GitBranch },
  { id: 'debug', label: 'Run and Debug', icon: Bug },
  { id: 'ext', label: 'Extensions', icon: Package },
];

const meta = {
  title: 'Primitives/ActivityBar',
  component: ActivityBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The narrow vertical icon rail at an edge of the shell. Controlled — it holds no selection state, so toggle behaviour (clicking the active item to deselect) is your decision.\n\n`side` docks it left or right; the divider and the active-item marker both mirror. See `ConnectedPaneRail` for the variant bound to a pane store, which derives its items from the panels registered on that edge.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="h-[360px] flex">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ActivityBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { items: ITEMS, activeId: 'files' },
};

/** Nothing selected — the state a shell starts in with the sidebar closed. */
export const NoSelection: Story = {
  args: { items: ITEMS, activeId: null },
};

/** Click to select, click again to deselect. This is the usual shell behaviour. */
export const Interactive: Story = {
  args: { items: ITEMS },
  render: function Render(args) {
    const [active, setActive] = useState<string | null>('files');
    return (
      <ActivityBar
        {...args}
        activeId={active}
        onSelect={(id) => setActive(id === active ? null : id)}
      />
    );
  },
};

/** `bottomItems` is the group below the spacer — conventionally settings and account. It is empty unless you supply it. */
export const CustomBottomItems: Story = {
  args: {
    items: ITEMS.slice(0, 3),
    activeId: 'search',
    bottomItems: [
      { id: 'chat', label: 'Assistant', icon: MessageSquare },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
};

/** With `bottomItems={[]}` the rail renders only the main group. */
export const NoBottomGroup: Story = {
  args: { items: ITEMS, activeId: 'scm', bottomItems: [] },
};
