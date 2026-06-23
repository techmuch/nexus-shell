import React, { useState } from 'react';
import { Shield, Folder, Users, Share2, Save, Settings } from 'lucide-react';
import { useModalStore } from '../../core/services/ModalStoreService';
// Cleaned unused styling hooks

interface ProjectPropertiesProps {
  projectId: string;
  projectName: string;
}

export const ProjectPropertiesWidget: React.FC<ProjectPropertiesProps> = ({ projectId, projectName }) => {
  const [name, setName] = useState(projectName);
  const [shareUser, setShareUser] = useState('');
  const [shareRole, setShareRole] = useState('viewer');

  const handleShare = async () => {
    if (!shareUser.trim()) return;
    try {
      const res = await fetch('/api/projects/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          target_username: shareUser,
          role: shareRole
        })
      });
      if (res.ok) {
        useModalStore.getState().openAlert('Successfully shared project!');
        setShareUser('');
      } else {
        useModalStore.getState().openAlert('Failed to share project. Verify username exists and you have owner rights.', 'Share Error');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRename = async () => {
    try {
      const res = await fetch('/api/files', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, name })
      });
      if (res.ok) {
        useModalStore.getState().openAlert('Successfully renamed project!');
      } else {
        useModalStore.getState().openAlert('Failed to rename project.', 'Rename Error');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-background p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-8">
        
        {/* Header Section */}
        <div className="flex items-center space-x-4 pb-6 border-b border-border/50">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 backdrop-blur-md">
            <Folder size={32} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              Project Properties
            </h1>
            <p className="text-muted-foreground font-mono text-xs mt-1">ID: {projectId}</p>
          </div>
        </div>

        {/* General Settings */}
        <section className="bg-card/40 border border-border/40 p-6 rounded-2xl backdrop-blur-md shadow-sm">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Settings size={18} className="text-muted-foreground" />
            General Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Project Name</label>
              <div className="flex space-x-3">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-background/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
                <button 
                  onClick={handleRename}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <Save size={16} /> Save
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Access Control Settings */}
        <section className="bg-card/40 border border-border/40 p-6 rounded-2xl backdrop-blur-md shadow-sm">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Shield size={18} className="text-indigo-400" />
            Access Control
          </h2>
          
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4 flex flex-col space-y-3 border border-border/50">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">Share with User</label>
              <div className="flex space-x-3">
                <input 
                  type="text" 
                  placeholder="Username..."
                  value={shareUser}
                  onChange={(e) => setShareUser(e.target.value)}
                  className="flex-1 bg-background/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
                <select 
                  value={shareRole}
                  onChange={(e) => setShareRole(e.target.value)}
                  className="bg-background/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 outline-none"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="owner">Owner</option>
                </select>
                <button 
                  onClick={handleShare}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  <Share2 size={16} /> Share
                </button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border/50">
              <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                <Users size={16} className="text-muted-foreground" />
                Current Permissions
              </h3>
              <p className="text-xs text-muted-foreground">User permissions for this folder are managed securely in the backend via RBAC.</p>
              {/* Future iteration: Fetch and list actual users here */}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
