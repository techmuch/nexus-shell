import { useState } from 'react';
import { GitBranch, Map, Sparkles } from 'lucide-react';
import { TreeWidget, type ITreeNode } from 'nexus-shell';

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
        ],
      },
      { id: 'index', label: 'index.ts', type: 'file' },
    ],
  },
  {
    id: 'docs',
    label: 'docs',
    type: 'folder',
    children: [{ id: 'readme', label: 'README.md', type: 'file' }],
  },
  { id: 'pkg', label: 'package.json', type: 'file' },
];

// #region toggle
/**
 * TreeWidget renders expansion from each node's `isOpen` but does not own it,
 * so your file data stays the single source of truth. This is the helper you
 * need for that.
 */
const toggleNode = (items: ITreeNode[], id: string): ITreeNode[] =>
  items.map((node) =>
    node.id === id
      ? { ...node, isOpen: !node.isOpen }
      : { ...node, children: node.children && toggleNode(node.children, id) },
  );

export const Basic = () => {
  const [nodes, setNodes] = useState<ITreeNode[]>(FILES);

  return (
    <TreeWidget
      data={nodes}
      onToggle={(node) => setNodes(toggleNode(nodes, node.id))}
      onActivate={(node) => alert(`Open ${node.label}`)}
    />
  );
};
// #endregion

// #region actions
export const CustomActions = () => {
  const [nodes, setNodes] = useState<ITreeNode[]>(FILES);
  const [last, setLast] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      <TreeWidget
        data={nodes}
        onToggle={(node) => setNodes(toggleNode(nodes, node.id))}
        // `actions` replaces the default menu entirely. This is the extension
        // point for app-specific commands — add an entry, not a new prop.
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
      <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground shrink-0">
        {last ?? 'Right-click a file, a folder, or empty space.'}
      </p>
    </div>
  );
};
// #endregion

// #region dragToMove
export const DragToMove = () => {
  const [nodes, setNodes] = useState<ITreeNode[]>(FILES);
  const [moved, setMoved] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      <TreeWidget
        data={nodes}
        onToggle={(node) => setNodes(toggleNode(nodes, node.id))}
        // Only folders accept drops.
        onMoveNode={(draggedId, targetId) => setMoved(`${draggedId} → ${targetId}`)}
      />
      <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground shrink-0">
        {moved ? `Moved ${moved}` : 'Drag a file onto a folder.'}
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
      label: 'generated',
      type: 'folder',
      isOpen: true,
      // Rows are virtualised, so 2,000 nodes scroll as smoothly as ten.
      children: Array.from({ length: 2000 }, (_, i) => ({
        id: `f${i}`,
        label: `module-${String(i).padStart(4, '0')}.ts`,
        type: 'file' as const,
      })),
    },
  ]);

  return <TreeWidget data={nodes} onToggle={(node) => setNodes(toggleNode(nodes, node.id))} />;
};
// #endregion
