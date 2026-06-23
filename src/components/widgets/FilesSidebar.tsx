import { useEffect } from "react";
import { TreeWidget, ITreeNode } from "./TreeWidget"
import { useFileStore } from "../../core/services/FileStoreService"
import { useLayoutStore } from "../../core/services/LayoutService"
import { useModalStore } from "../../core/services/ModalStoreService"

export const FilesSidebar = () => {
  const { nodes, addFile, deleteFile, renameFile, fetchFiles } = useFileStore();
  const { addTab } = useLayoutStore();
  const { openPrompt, openConfirm } = useModalStore();

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleNewFile = async (parentId: string | null) => {
    const name = await openPrompt('New File Name:');
    if (name) addFile(parentId, { id: Date.now().toString(), label: name, type: 'file' });
  };

  const handleNewFolder = async (parentId: string | null) => {
    const name = await openPrompt('New Folder Name:');
    if (name) addFile(parentId, { id: Date.now().toString(), label: name, type: 'folder', isOpen: true, children: [] });
  };

  const handleNewDialogueMap = (parentId: string | null) => {
    // Automatically create a new Untitled.map
    const id = `map-${Date.now()}`;
    addFile(parentId, { id, label: 'Untitled.map', type: 'file' });
  };

  const handleDoubleClick = (node: ITreeNode) => {
    if (node.type === 'file' && node.label.endsWith('.map')) {
      addTab('dialogue-map', node.label, { mapId: node.id });
    } else if (node.type === 'folder') {
      addTab('project-properties', node.label + ' Properties', { projectId: node.id, projectName: node.label });
    }
  };

  const handleRename = async (id: string) => {
    const name = await openPrompt('New Name:');
    if (name) renameFile(id, name);
  };

  const handleDelete = async (id: string) => {
    if (await openConfirm('Delete this item?')) {
      deleteFile(id);
    }
  };

  return (
    <TreeWidget 
      data={nodes} 
      onNewFile={handleNewFile}
      onNewFolder={handleNewFolder}
      onNewDialogueMap={handleNewDialogueMap}
      onRename={handleRename}
      onDelete={handleDelete}
      onDoubleClick={handleDoubleClick}
    />
  );
}
