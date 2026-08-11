import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Building2,
  Circle,
  File,
  Folder,
  Lightbulb,
  ThumbsDown,
  ThumbsUp,
  User,
  Users,
} from 'lucide-react';
import { TreeWidget, type ITreeNode } from './TreeWidget';

/** Immutably flip `isOpen` on one node anywhere in the tree. */
const toggleNode = (items: ITreeNode[], id: string): ITreeNode[] =>
  items.map((node) =>
    node.id === id
      ? { ...node, isOpen: !node.isOpen }
      : { ...node, children: node.children && toggleNode(node.children, id) },
  );

const ORG: ITreeNode[] = [
  {
    id: 'acme',
    label: 'Acme Corp',
    isBranch: true,
    kind: 'company',
    isOpen: true,
    icon: <Building2 size={14} className="text-primary" />,
    children: [
      {
        id: 'eng',
        label: 'Engineering',
        isBranch: true,
        kind: 'department',
        isOpen: true,
        icon: <Users size={14} className="text-blue-400" />,
        children: [
          { id: 'ada', label: 'Ada Lovelace', kind: 'person', icon: <User size={14} /> },
          { id: 'alan', label: 'Alan Turing', kind: 'person', icon: <User size={14} /> },
        ],
      },
      {
        id: 'design',
        label: 'Design',
        isBranch: true,
        kind: 'department',
        icon: <Users size={14} className="text-purple-400" />,
        children: [
          { id: 'kai', label: 'Kai Chen', kind: 'person', icon: <User size={14} /> },
        ],
      },
    ],
  },
];

const ARGUMENT: ITreeNode[] = [
  {
    id: 'q',
    label: 'Should we ship v1 this quarter?',
    isBranch: true,
    kind: 'question',
    isOpen: true,
    icon: <Circle size={12} className="text-sky-400 fill-sky-400/30" />,
    children: [
      {
        id: 'i1',
        label: 'Ship a limited beta first',
        isBranch: true,
        kind: 'idea',
        isOpen: true,
        icon: <Lightbulb size={13} className="text-amber-400" />,
        children: [
          { id: 'p1', label: 'Real feedback before we commit the API', kind: 'pro', icon: <ThumbsUp size={12} className="text-green-500" /> },
          { id: 'c1', label: 'Two migration paths to support', kind: 'con', icon: <ThumbsDown size={12} className="text-red-500" /> },
        ],
      },
    ],
  },
];

const fileIcon = (isBranch?: boolean) =>
  isBranch ? (
    <Folder size={14} className="text-blue-400 fill-blue-400/20" />
  ) : (
    <File size={14} className="text-muted-foreground" />
  );

const FILES: ITreeNode[] = [
  {
    id: 'src',
    label: 'src',
    isBranch: true,
    kind: 'folder',
    isOpen: true,
    icon: fileIcon(true),
    children: [
      { id: 'index', label: 'index.ts', kind: 'file', icon: fileIcon() },
      { id: 'app', label: 'App.tsx', kind: 'file', icon: fileIcon() },
    ],
  },
  { id: 'pkg', label: 'package.json', kind: 'file', icon: fileIcon() },
];

const meta = {
  title: 'Primitives/TreeWidget',
  component: TreeWidget,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A virtualised, domain-neutral tree with drag-to-move and a data-driven right-click menu.\n\n**This is not a file explorer.** The component knows about branches and leaves and nothing else — an org chart, a scene graph, a category picker and an argument map are all the same shape here.\n\n`isBranch` is the only structural concept: branches expand and accept drops, leaves do neither. `kind` is your own vocabulary, which the library never interprets — it exists so context-menu actions can target your node types through `showFor`. Icons are per-node, so nothing file-shaped ships in the component.\n\nControlled: expansion lives on your nodes as `isOpen` and changes are reported through `onToggle`.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="h-[400px] w-[340px] border-r border-border">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TreeWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Three node kinds, and a context menu that differs by kind. */
export const OrgChart: Story = {
  args: { data: ORG },
  render: function Render() {
    const [nodes, setNodes] = useState(ORG);
    return (
      <TreeWidget
        data={nodes}
        aria-label="Organisation"
        onToggle={(node) => setNodes(toggleNode(nodes, node.id))}
        actions={[
          { id: 'hire', label: 'Add direct report', showFor: ['department'], onSelect: () => {} },
          { id: 'profile', label: 'View profile', showFor: ['person'], onSelect: () => {} },
        ]}
      />
    );
  },
};

/** Nothing here is a file, and the component does not care. */
export const ArgumentMap: Story = {
  args: { data: ARGUMENT },
  render: function Render() {
    const [nodes, setNodes] = useState(ARGUMENT);
    return (
      <TreeWidget
        data={nodes}
        aria-label="Argument map"
        onToggle={(node) => setNodes(toggleNode(nodes, node.id))}
      />
    );
  },
};

/** The familiar case, built the same way — icons come from the app. */
export const FileExplorer: Story = {
  args: { data: FILES },
  render: function Render() {
    const [nodes, setNodes] = useState(FILES);
    return (
      <TreeWidget
        data={nodes}
        aria-label="Files"
        onToggle={(node) => setNodes(toggleNode(nodes, node.id))}
        actions={[
          { id: 'new', label: 'New File', showFor: ['folder', 'background'], onSelect: () => {} },
          { id: 'del', label: 'Delete', divider: true, showFor: ['file'], onSelect: () => {} },
        ]}
      />
    );
  },
};

/** Without `icon`, rows are label-only. The component ships no default glyphs. */
export const NoIcons: Story = {
  args: {
    data: [
      {
        id: 'a',
        label: 'Category A',
        isBranch: true,
        isOpen: true,
        children: [
          { id: 'a1', label: 'Item one' },
          { id: 'a2', label: 'Item two' },
        ],
      },
      { id: 'b', label: 'Category B', isBranch: true, children: [{ id: 'b1', label: 'Item three' }] },
    ],
  },
};

/** With no `actions`, right-clicking does nothing — there is no built-in menu. */
export const NoContextMenu: Story = {
  args: { data: ORG },
};

/** Only branches accept drops. */
export const DragToMove: Story = {
  args: { data: ORG },
  render: function Render() {
    const [nodes, setNodes] = useState(ORG);
    const [moved, setMoved] = useState<string | null>(null);
    return (
      <div className="h-full flex flex-col">
        <TreeWidget
          data={nodes}
          onToggle={(node) => setNodes(toggleNode(nodes, node.id))}
          onMoveNode={(dragged, target) => setMoved(`${dragged} → ${target}`)}
        />
        <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground shrink-0">
          {moved ?? 'Drag a person onto a department.'}
        </p>
      </div>
    );
  },
};

/** 5,000 nodes, to show virtualisation holding up. */
export const LargeTree: Story = {
  args: {
    data: [
      {
        id: 'root',
        label: 'Generated nodes',
        isBranch: true,
        isOpen: true,
        children: Array.from({ length: 5000 }, (_, i) => ({
          id: `n${i}`,
          label: `Node ${String(i).padStart(4, '0')}`,
        })),
      },
    ],
  },
};

/** The empty state. */
export const Empty: Story = {
  args: { data: [] },
};
