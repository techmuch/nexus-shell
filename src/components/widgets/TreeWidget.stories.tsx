import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { GitBranch, Map, Sparkles } from 'lucide-react';
import { TreeWidget, type ITreeNode } from './TreeWidget';

const FILES: ITreeNode[] = [
  {
    id: 'src',
    label: 'src',
    type: 'folder',
    isOpen: true,
    children: [
      {
        id: 'components',
        label: 'components',
        type: 'folder',
        isOpen: true,
        children: [
          { id: 'menubar', label: 'MenuBar.tsx', type: 'file' },
          { id: 'statusbar', label: 'StatusBar.tsx', type: 'file' },
          { id: 'tree', label: 'TreeWidget.tsx', type: 'file' },
        ],
      },
      { id: 'lib', label: 'lib', type: 'folder', children: [{ id: 'cn', label: 'cn.ts', type: 'file' }] },
      { id: 'index', label: 'index.ts', type: 'file' },
    ],
  },
  { id: 'docs', label: 'docs', type: 'folder', children: [{ id: 'readme', label: 'README.md', type: 'file' }] },
  { id: 'pkg', label: 'package.json', type: 'file' },
];

/** Immutably flip `isOpen` on one node anywhere in the tree. */
const toggleNode = (items: ITreeNode[], id: string): ITreeNode[] =>
  items.map((node) =>
    node.id === id
      ? { ...node, isOpen: !node.isOpen }
      : { ...node, children: node.children && toggleNode(node.children, id) },
  );

const meta = {
  title: 'Primitives/TreeWidget',
  component: TreeWidget,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A virtualised file-explorer tree with drag-to-move and a data-driven right-click menu.\n\nControlled: expansion lives on your nodes as `isOpen` and changes are reported through `onToggle`, so the tree never holds a second copy of your data. Rows are virtualised via `react-virtuoso`, so very large trees stay responsive.\n\nThe context menu is data-driven — pass `actions` to replace the defaults with your own commands rather than adding one-off props.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="h-[420px] w-[320px] border-r border-border">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TreeWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Static — folders won't expand without an `onToggle` handler. */
export const Default: Story = {
  args: { data: FILES },
};

/** Wire `onToggle` to your own state and folders expand. Right-click for the default menu. */
export const Interactive: Story = {
  args: { data: FILES },
  render: function Render() {
    const [nodes, setNodes] = useState(FILES);
    const [opened, setOpened] = useState<string | null>(null);

    return (
      <div className="h-full flex flex-col">
        <TreeWidget
          data={nodes}
          onToggle={(node) => setNodes(toggleNode(nodes, node.id))}
          onActivate={(node) => setOpened(node.label)}
          onNewFile={() => {}}
          onNewFolder={() => {}}
          onRename={() => {}}
          onDelete={() => {}}
        />
        <div className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground shrink-0">
          {opened ? `Opened: ${opened}` : 'Double-click a file to open it.'}
        </div>
      </div>
    );
  },
};

/**
 * `actions` replaces the default menu entirely. This is the extension point for
 * app-specific commands — the tree itself stays generic.
 *
 * `showFor` restricts where each entry appears: `'background'` is a right-click
 * on empty space, where `nodeId` is `null`.
 */
export const CustomActions: Story = {
  args: { data: FILES },
  render: function Render() {
    const [nodes, setNodes] = useState(FILES);
    const [last, setLast] = useState<string | null>(null);

    return (
      <div className="h-full flex flex-col">
        <TreeWidget
          data={nodes}
          onToggle={(node) => setNodes(toggleNode(nodes, node.id))}
          actions={[
            {
              id: 'new-map',
              label: 'New Dialogue Map',
              icon: <Map size={14} />,
              showFor: ['folder', 'background'],
              onSelect: (ctx) => setLast(`New map in ${ctx.node?.label ?? 'root'}`),
            },
            {
              id: 'branch',
              label: 'Create Branch From…',
              icon: <GitBranch size={14} />,
              showFor: ['file', 'folder'],
              onSelect: (ctx) => setLast(`Branch from ${ctx.node?.label}`),
            },
            {
              id: 'explain',
              label: 'Explain This File',
              icon: <Sparkles size={14} />,
              divider: true,
              showFor: ['file'],
              onSelect: (ctx) => setLast(`Explain ${ctx.node?.label}`),
            },
          ]}
        />
        <div className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground shrink-0">
          {last ?? 'Right-click a file, a folder, or empty space.'}
        </div>
      </div>
    );
  },
};

/** Drag a file onto a folder. Only folders accept drops. */
export const DragToMove: Story = {
  args: { data: FILES },
  render: function Render() {
    const [nodes, setNodes] = useState(FILES);
    const [moved, setMoved] = useState<string | null>(null);

    return (
      <div className="h-full flex flex-col">
        <TreeWidget
          data={nodes}
          onToggle={(node) => setNodes(toggleNode(nodes, node.id))}
          onMoveNode={(dragged, target) => setMoved(`${dragged} → ${target}`)}
        />
        <div className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground shrink-0">
          {moved ? `Moved ${moved}` : 'Drag a file onto a folder.'}
        </div>
      </div>
    );
  },
};

/** 2,000 nodes, to show virtualisation holding up. */
export const LargeTree: Story = {
  args: {
    data: [
      {
        id: 'root',
        label: 'generated',
        type: 'folder',
        isOpen: true,
        children: Array.from({ length: 2000 }, (_, i) => ({
          id: `f${i}`,
          label: `module-${String(i).padStart(4, '0')}.ts`,
          type: 'file' as const,
        })),
      },
    ],
  },
};

/** The empty state. */
export const Empty: Story = {
  args: { data: [] },
};
