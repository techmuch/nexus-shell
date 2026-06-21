import { useEffect } from "react";
import { TreeWidget, ITreeNode } from "./TreeWidget"
import { useFileStore } from "../../core/services/FileStoreService"
import { useLayoutStore } from "../../core/services/LayoutService"

export const FilesSidebar = () => {
  const { nodes, addFile, deleteFile, renameFile, fetchFiles } = useFileStore();
  const { addTab } = useLayoutStore();

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleNewFile = (parentId: string | null) => {
    const name = window.prompt('New File Name:');
    if (name) addFile(parentId, { id: Date.now().toString(), label: name, type: 'file' });
  };

  const handleNewFolder = (parentId: string | null) => {
    const name = window.prompt('New Folder Name:');
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

  const handleRename = (id: string) => {
    const name = window.prompt('New Name:');
    if (name) renameFile(id, name);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this item?')) {
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
