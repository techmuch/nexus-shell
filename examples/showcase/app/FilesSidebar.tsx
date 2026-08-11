import { useEffect, useState } from 'react';
import { Map, Plus, FolderPlus, Edit, Trash2 } from 'lucide-react';
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

/**
 * Example sidebar panel: the file explorer for the showcase app.
 *
 * Shows how an app-specific command ("New Dialogue Map") is contributed to the
 * generic `TreeWidget` through its `actions` prop, rather than the library
 * carrying a dedicated prop for it.
 */
export const FilesSidebar = () => {
  const { nodes, addFile, deleteFile, renameFile, fetchFiles } = useFileStore();
  const { addTab } = useLayoutStore();
  const { openPrompt, openConfirm } = useModalStore();

  // TreeWidget renders expansion but does not own it, so it lives here.
  const [tree, setTree] = useState<ITreeNode[]>(nodes);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    setTree(nodes);
  }, [nodes]);

  const handleNewFile = async (parentId: string | null) => {
    const name = await openPrompt('New File Name:');
    if (name) addFile(parentId, { id: Date.now().toString(), label: name, type: 'file' });
  };

  const handleNewFolder = async (parentId: string | null) => {
    const name = await openPrompt('New Folder Name:');
    if (name)
      addFile(parentId, {
        id: Date.now().toString(),
        label: name,
        type: 'folder',
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
    if (node.type === 'file' && node.label.endsWith('.map')) {
      addTab('dialogue-map', node.label, { mapId: node.id });
    } else if (node.type === 'folder') {
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
      onSelect: ({ nodeId }) =>
        addFile(nodeId, {
          id: `map-${Date.now()}`,
          label: 'Untitled.map',
          type: 'file',
        }),
    },
    {
      id: 'rename',
      label: 'Rename',
      icon: <Edit size={14} />,
      divider: true,
      showFor: ['file', 'folder'],
      onSelect: ({ nodeId }) => nodeId && handleRename(nodeId),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 size={14} className="text-destructive" />,
      showFor: ['file', 'folder'],
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
