import { useEffect, useState } from 'react';
import { Edit, File, Folder, FolderPlus, Map, Plus, Trash2 } from 'lucide-react';
import {
  TreeWidget,
  type ITreeAction,
  type ITreeNode,
} from '../../../src/components/widgets/TreeWidget';
import { useFileStore } from './FileStoreService';
import { useLayoutStore } from '../../../src/core/services/LayoutService';
import { useModalStore } from '../../../src/core/services/ModalStoreService';

/** Immutably flip `isOpen` on one node anywhere in the tree. */
const toggleNode = (items: ITreeNode[], id: string): ITreeNode[] =>
  items.map((node) =>
    node.id === id
      ? { ...node, isOpen: !node.isOpen }
      : { ...node, children: node.children && toggleNode(node.children, id) },
  );

/** Give each node the icon its `kind` deserves. TreeWidget ships none. */
const withIcons = (items: ITreeNode[]): ITreeNode[] =>
  items.map((node) => ({
    ...node,
    icon: node.isBranch ? (
      <Folder size={14} className="text-blue-400 fill-blue-400/20" />
    ) : (
      <File size={14} className="text-muted-foreground" />
    ),
    children: node.children && withIcons(node.children),
  }));

/**
 * Example sidebar panel: a file explorer built on the generic `TreeWidget`.
 *
 * Everything file-shaped here — the folder and file icons, the New File and New
 * Folder actions, the `.map` handling — lives in this file, not in the library.
 * `TreeWidget` only knows about branches and leaves.
 */
export const FilesSidebar = () => {
  const { nodes, addFile, deleteFile, renameFile, fetchFiles } = useFileStore();
  const { addTab } = useLayoutStore();
  const { openPrompt, openConfirm } = useModalStore();

  // TreeWidget renders expansion but does not own it, so it lives here.
  const [tree, setTree] = useState<ITreeNode[]>(() => withIcons(nodes));

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    setTree(withIcons(nodes));
  }, [nodes]);

  const handleNewFile = async (parentId: string | null) => {
    const name = await openPrompt('New File Name:');
    if (name)
      addFile(parentId, { id: Date.now().toString(), label: name, kind: 'file' });
  };

  const handleNewFolder = async (parentId: string | null) => {
    const name = await openPrompt('New Folder Name:');
    if (name)
      addFile(parentId, {
        id: Date.now().toString(),
        label: name,
        isBranch: true,
        kind: 'folder',
        isOpen: true,
        children: [],
      });
  };

  const handleRename = async (id: string) => {
    const name = await openPrompt('New Name:');
    if (name) renameFile(id, name);
  };

  const handleDelete = async (id: string) => {
    if (await openConfirm('Delete this item?')) deleteFile(id);
  };

  const handleActivate = (node: ITreeNode) => {
    if (!node.isBranch && node.label.endsWith('.map')) {
      addTab('dialogue-map', node.label, { mapId: node.id });
    } else if (node.isBranch) {
      addTab('project-properties', `${node.label} Properties`, {
        projectId: node.id,
        projectName: node.label,
      });
    }
  };

  const actions: ITreeAction[] = [
    {
      id: 'new-file',
      label: 'New File',
      icon: <Plus size={14} />,
      onSelect: ({ nodeId }) => handleNewFile(nodeId),
    },
    {
      id: 'new-folder',
      label: 'New Folder',
      icon: <FolderPlus size={14} />,
      onSelect: ({ nodeId }) => handleNewFolder(nodeId),
    },
    {
      // The app-specific command. The library knows nothing about dialogue maps.
      id: 'new-map',
      label: 'New Dialogue Map',
      icon: <Map size={14} />,
      showFor: ['folder', 'background'],
      onSelect: ({ nodeId }) =>
        addFile(nodeId, {
          id: `map-${Date.now()}`,
          label: 'Untitled.map',
          kind: 'file',
        }),
    },
    {
      id: 'rename',
      label: 'Rename',
      icon: <Edit size={14} />,
      divider: true,
      showFor: ['branch', 'leaf'],
      onSelect: ({ nodeId }) => nodeId && handleRename(nodeId),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 size={14} className="text-destructive" />,
      showFor: ['branch', 'leaf'],
      onSelect: ({ nodeId }) => nodeId && handleDelete(nodeId),
    },
  ];

  return (
    <TreeWidget
      data={tree}
      actions={actions}
      onToggle={(node) => setTree((t) => toggleNode(t, node.id))}
      onActivate={handleActivate}
    />
  );
};
