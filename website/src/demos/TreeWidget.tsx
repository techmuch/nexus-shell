import { useState } from 'react';
import {
  Building2,
  Circle,
  File,
  Folder,
  Lightbulb,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  User,
  Users,
} from 'lucide-react';
import { TreeWidget, type ITreeNode } from 'nexus-shell';

// #region toggle
/**
 * Expansion lives on your nodes as `isOpen`, so the tree never holds a second
 * copy of your data. This helper is the one piece of boilerplate that asks for.
 */
const toggleNode = (items: ITreeNode[], id: string): ITreeNode[] =>
  items.map((node) =>
    node.id === id
      ? { ...node, isOpen: !node.isOpen }
      : { ...node, children: node.children && toggleNode(node.children, id) },
  );
// #endregion

/* -------------------------------------------------------------------------- */
/* Org chart                                                                  */
/* -------------------------------------------------------------------------- */

// #region orgChart
const ORG: ITreeNode[] = [
  {
    id: 'acme',
    label: 'Acme Corp',
    // `isBranch` is the component's only structural concept: branches expand
    // and accept drops, leaves do neither.
    isBranch: true,
    // `kind` is your vocabulary. The library never interprets it — it exists so
    // context-menu actions can target your own node types.
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

export const OrgChart = () => {
  const [nodes, setNodes] = useState<ITreeNode[]>(ORG);
  const [last, setLast] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      <TreeWidget
        data={nodes}
        aria-label="Organisation"
        onToggle={(node) => setNodes(toggleNode(nodes, node.id))}
        onActivate={(node) => setLast(`Opened ${node.label}`)}
        actions={[
          {
            // `showFor` matches your `kind` values as readily as 'branch'/'leaf'.
            id: 'add-report',
            label: 'Add direct report',
            showFor: ['department'],
            onSelect: (ctx) => setLast(`Add a report under ${ctx.node?.label}`),
          },
          {
            id: 'profile',
            label: 'View profile',
            showFor: ['person'],
            onSelect: (ctx) => setLast(`Profile: ${ctx.node?.label}`),
          },
        ]}
      />
      <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground shrink-0">
        {last ?? 'Right-click a department, then a person — the menus differ.'}
      </p>
    </div>
  );
};
// #endregion

/* -------------------------------------------------------------------------- */
/* Argument map                                                               */
/* -------------------------------------------------------------------------- */

// #region argumentMap
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
          {
            id: 'p1',
            label: 'Real feedback before we commit the API',
            kind: 'pro',
            icon: <ThumbsUp size={12} className="text-green-500" />,
          },
          {
            id: 'c1',
            label: 'Two migration paths to support',
            kind: 'con',
            icon: <ThumbsDown size={12} className="text-red-500" />,
          },
        ],
      },
      {
        id: 'i2',
        label: 'Cut scope and ship the whole thing',
        isBranch: true,
        kind: 'idea',
        icon: <Lightbulb size={13} className="text-amber-400" />,
        children: [
          {
            id: 'p2',
            label: 'One release to document',
            kind: 'pro',
            icon: <ThumbsUp size={12} className="text-green-500" />,
          },
        ],
      },
    ],
  },
];

export const ArgumentMap = () => {
  const [nodes, setNodes] = useState<ITreeNode[]>(ARGUMENT);

  return (
    <TreeWidget
      data={nodes}
      aria-label="Argument map"
      onToggle={(node) => setNodes(toggleNode(nodes, node.id))}
      // Nothing about this hierarchy is a file, and the component doesn't care.
      actions={[
        {
          id: 'add-pro',
          label: 'Add supporting argument',
          icon: <ThumbsUp size={14} />,
          showFor: ['idea'],
          onSelect: () => {},
        },
        {
          id: 'add-con',
          label: 'Add objection',
          icon: <ThumbsDown size={14} />,
          showFor: ['idea'],
          onSelect: () => {},
        },
        {
          id: 'add-idea',
          label: 'Add idea',
          icon: <Lightbulb size={14} />,
          showFor: ['question'],
          onSelect: () => {},
        },
      ]}
    />
  );
};
// #endregion

/* -------------------------------------------------------------------------- */
/* File explorer                                                              */
/* -------------------------------------------------------------------------- */

// #region fileExplorer
/** File and folder icons live in your app, not in the library. */
const fileIcon = (node: { isBranch?: boolean }) =>
  node.isBranch ? (
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
    icon: fileIcon({ isBranch: true }),
    children: [
      {
        id: 'components',
        label: 'components',
        isBranch: true,
        kind: 'folder',
        isOpen: true,
        icon: fileIcon({ isBranch: true }),
        children: [
          { id: 'menubar', label: 'MenuBar.tsx', kind: 'file', icon: fileIcon({}) },
          { id: 'statusbar', label: 'StatusBar.tsx', kind: 'file', icon: fileIcon({}) },
        ],
      },
      { id: 'index', label: 'index.ts', kind: 'file', icon: fileIcon({}) },
    ],
  },
  { id: 'pkg', label: 'package.json', kind: 'file', icon: fileIcon({}) },
];

export const FileExplorer = () => {
  const [nodes, setNodes] = useState<ITreeNode[]>(FILES);
  const [last, setLast] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      <TreeWidget
        data={nodes}
        aria-label="Files"
        onToggle={(node) => setNodes(toggleNode(nodes, node.id))}
        onActivate={(node) => setLast(`Open ${node.label}`)}
        actions={[
          {
            id: 'new-file',
            label: 'New File',
            showFor: ['folder', 'background'],
            onSelect: (ctx) => setLast(`New file in ${ctx.node?.label ?? 'root'}`),
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
      <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground shrink-0">
        {last ?? 'A file explorer is just one shape this takes.'}
      </p>
    </div>
  );
};
// #endregion

/* -------------------------------------------------------------------------- */
/* Drag and scale                                                             */
/* -------------------------------------------------------------------------- */

// #region dragToMove
export const DragToMove = () => {
  const [nodes, setNodes] = useState<ITreeNode[]>(ORG);
  const [moved, setMoved] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      <TreeWidget
        data={nodes}
        onToggle={(node) => setNodes(toggleNode(nodes, node.id))}
        // Only branches accept drops. Reparenting is yours to perform.
        onMoveNode={(draggedId, targetBranchId) =>
          setMoved(`${draggedId} → ${targetBranchId}`)
        }
      />
      <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground shrink-0">
        {moved ? `Moved ${moved}` : 'Drag a person onto a department.'}
      </p>
    </div>
  );
};
// #endregion

// #region large
export const LargeTree = () => {
  const [nodes, setNodes] = useState<ITreeNode[]>([
    {
      id: 'root',
      label: 'Generated nodes',
      isBranch: true,
      isOpen: true,
      icon: <Circle size={12} className="text-muted-foreground" />,
      // Rows are virtualised, so 5,000 nodes scroll as smoothly as ten.
      children: Array.from({ length: 5000 }, (_, i) => ({
        id: `n${i}`,
        label: `Node ${String(i).padStart(4, '0')}`,
      })),
    },
  ]);

  return <TreeWidget data={nodes} onToggle={(node) => setNodes(toggleNode(nodes, node.id))} />;
};
// #endregion
