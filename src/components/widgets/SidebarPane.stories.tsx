import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SidebarPane } from './SidebarPane';
import { SettingsPanel } from './SettingsPanel';
import { TreeWidget, type ITreeNode } from './TreeWidget';

const meta = {
  title: 'Primitives/SidebarPane',
  component: SidebarPane,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The collapsible panel beside the activity bar: a titled header with an optional close button, over a scrolling body. A pure container — it decides nothing about which panel is showing. See `ConnectedSidebarPane` for the variant that resolves the active panel from `useSidebarStore`.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="h-[420px] flex">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SidebarPane>;

export default meta;
type Story = StoryObj<typeof meta>;

const FILES: ITreeNode[] = [
  {
    id: 'src',
    label: 'src',
    isBranch: true,
    kind: 'folder',
    isOpen: true,
    children: [
      { id: 'app', label: 'App.tsx', kind: 'file' },
      { id: 'main', label: 'main.tsx', kind: 'file' },
    ],
  },
  { id: 'readme', label: 'README.md', kind: 'file' },
];

export const Default: Story = {
  args: {
    title: 'Explorer',
    onClose: () => {},
    children: (
      <div className="p-4 text-sm text-muted-foreground">Panel content goes here.</div>
    ),
  },
};

/** Omitting `onClose` hides the close button, for panes that are always visible. */
export const NotClosable: Story = {
  args: {
    title: 'Outline',
    children: <div className="p-4 text-sm text-muted-foreground">No close button.</div>,
  },
};

/** The pane is a container: drop any component in as `children`. */
export const WithFileTree: Story = {
  args: { title: 'Explorer', onClose: () => {} },
  render: function Render(args) {
    const [nodes, setNodes] = useState(FILES);
    const toggle = (items: ITreeNode[], id: string): ITreeNode[] =>
      items.map((n) =>
        n.id === id
          ? { ...n, isOpen: !n.isOpen }
          : { ...n, children: n.children && toggle(n.children, id) },
      );

    return (
      <SidebarPane {...args}>
        <TreeWidget data={nodes} onToggle={(n) => setNodes(toggle(nodes, n.id))} />
      </SidebarPane>
    );
  },
};

/** The Settings panel body is its own component, so the pane stays generic. */
export const WithSettings: Story = {
  args: { title: 'Settings', onClose: () => {} },
  render: function Render(args) {
    const [theme, setTheme] = useState('light');
    return (
      <SidebarPane {...args}>
        <SettingsPanel theme={theme} onThemeChange={setTheme} />
      </SidebarPane>
    );
  },
};

/** Long titles truncate rather than pushing the close button off the edge. */
export const LongTitle: Story = {
  args: {
    title: 'A Panel With An Unreasonably Long Title',
    onClose: () => {},
    children: <div className="p-4 text-sm text-muted-foreground">Content.</div>,
  },
};

/** `width` accepts any CSS length. */
export const Wide: Story = {
  args: {
    title: 'Inspector',
    width: '420px',
    onClose: () => {},
    children: <div className="p-4 text-sm text-muted-foreground">A wider pane.</div>,
  },
};
