import { create } from 'zustand';
import { ITreeNode } from '../../components/widgets/TreeWidget';

interface FileStoreState {
  nodes: ITreeNode[];
  fetchFiles: () => Promise<void>;
  addFile: (parentId: string | null, file: ITreeNode) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  renameFile: (id: string, newName: string) => Promise<void>;
}

export const useFileStore = create<FileStoreState>((set, get) => ({
  nodes: [],
  
  fetchFiles: async () => {
    try {
      const projRes = await fetch('/api/projects');
      const projects = await projRes.json() || [];
      
      const fileRes = await fetch('/api/files');
      const files = await fileRes.json() || [];

      // Construct the tree: Projects are root folders
      const rootNodes: ITreeNode[] = projects.map((p: any) => ({
        id: p.id,
        label: p.name,
        type: 'folder',
        isOpen: true,
        children: []
      }));

      // Map files to their parents
      const fileMap = new Map<string, ITreeNode>();
      files.forEach((f: any) => {
        fileMap.set(f.id, {
          id: f.id,
          label: f.name,
          type: f.type,
          children: f.type === 'folder' ? [] : undefined
        });
      });

      // Attach files to projects or parent folders
      files.forEach((f: any) => {
        const node = fileMap.get(f.id)!;
        if (f.parent_id) {
          const parent = fileMap.get(f.parent_id);
          if (parent && parent.children) {
            parent.children.push(node);
          }
        } else if (f.project_id) {
          const project = rootNodes.find(p => p.id === f.project_id);
          if (project && project.children) {
            project.children.push(node);
          }
        }
      });

      set({ nodes: rootNodes });
    } catch (e) {
      console.error("Failed to fetch tree:", e);
    }
  },
  
  addFile: async (parentId, file) => {
    if (!parentId) {
      // If no parent, we are creating a root Project
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: file.label })
      });
    } else {
      // Find which project this file ultimately belongs to
      let projectId = parentId;
      const state = get();
      const findProject = (nodes: ITreeNode[], targetId: string, currentProj: string): string => {
        for (const n of nodes) {
          if (n.id === targetId) return currentProj;
          if (n.children) {
            const found = findProject(n.children, targetId, currentProj);
            if (found) return found;
          }
        }
        return '';
      };
      
      for (const root of state.nodes) {
        if (root.id === parentId) {
          projectId = root.id;
          break;
        }
        const found = findProject(root.children || [], parentId, root.id);
        if (found) {
          projectId = found;
          break;
        }
      }

      await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          parent_id: parentId === projectId ? null : parentId,
          name: file.label,
          type: file.type
        })
      });
    }
    await get().fetchFiles();
  },
  
  deleteFile: async (id) => {
    await fetch(`/api/files?id=${id}`, { method: 'DELETE' });
    await get().fetchFiles();
  },
  
  renameFile: async (id, newName) => {
    await fetch('/api/files', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: newName })
    });
    await get().fetchFiles();
  }
}));
