import React, { useState } from 'react';
import { 
  Trash2, 
  Tag 
} from 'lucide-react';
import { getMapStore, IbisNodeType } from '../../core/services/DialogueMappingService';

export const DialogueMapperInspector: React.FC<{ mapId?: string }> = ({ mapId }) => {
  const useStore = React.useMemo(() => getMapStore(mapId), [mapId]);
  const { nodes, updateNodeData, deleteNode } = useStore();
  
  const selectedNodes = nodes.filter((n) => n.selected);
  const activeNode = selectedNodes.length === 1 ? selectedNodes[0] : null;
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (!activeNode || !newTag.trim()) return;
    const currentTags = activeNode.data.tags || [];
    if (!currentTags.includes(newTag.trim().toLowerCase())) {
      updateNodeData(activeNode.id, {
        tags: [...currentTags, newTag.trim().toLowerCase()],
      });
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!activeNode) return;
    const currentTags = activeNode.data.tags || [];
    updateNodeData(activeNode.id, {
      tags: currentTags.filter((t) => t !== tagToRemove),
    });
  };

  return (
    <div className="w-full h-full bg-card/45 flex flex-col overflow-hidden relative font-sans text-foreground">
      <div className="p-3 border-b border-border bg-card flex items-center shrink-0">
        <h3 className="font-bold text-sm tracking-tight">Argument Inspector</h3>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4 select-text">
        {selectedNodes.length > 1 ? (
          <div className="text-center italic text-muted-foreground/60 pt-10 text-xs space-y-2">
            <div className="font-semibold text-primary">Multiple Nodes Selected</div>
            <div>({selectedNodes.length} nodes selected)</div>
            <div className="text-[10px] mt-2">Node arguments cannot be edited simultaneously. Select a single node to view and edit its logical properties.</div>
          </div>
        ) : activeNode ? (
          <div className="space-y-4">
            {/* 1. Node Title */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Node Label</label>
              <input
                type="text"
                value={activeNode.data.title}
                onChange={(e) => updateNodeData(activeNode.id, { title: e.target.value })}
                className="w-full bg-secondary border border-border rounded-lg p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring select-text"
                placeholder="Enter node title..."
              />
            </div>

            {/* 2. Type Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Argument Logic Class</label>
              <select
                value={activeNode.data.type}
                onChange={(e) => updateNodeData(activeNode.id, { type: e.target.value as IbisNodeType })}
                className="w-full bg-secondary border border-border rounded-lg p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="question">Question / Issue</option>
                <option value="idea">Idea / Position</option>
                <option value="pro">Pro Argument</option>
                <option value="con">Con Argument</option>
                <option value="note">Note / Evidence</option>
                <option value="decision">Decision / Resolve</option>
                <option value="link">Link / Reference</option>
                <option value="image">Image / Diagram</option>
                <option value="map">Map / Sub-Map</option>
              </select>
            </div>

            {/* 3. Decision Status (Conditional) */}
            {(activeNode.data.type === 'question' || activeNode.data.type === 'idea' || activeNode.data.type === 'decision') && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Resolution status</label>
                <select
                  value={activeNode.data.status || 'pending'}
                  onChange={(e) => updateNodeData(activeNode.id, { status: e.target.value as any })}
                  className="w-full bg-secondary border border-border rounded-lg p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted / Chosen</option>
                  <option value="rejected">Rejected / Dropped</option>
                </select>
              </div>
            )}

            {/* 4. Description Detail Notes */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Description & Notes</label>
              <textarea
                value={activeNode.data.description || ''}
                onChange={(e) => updateNodeData(activeNode.id, { description: e.target.value })}
                className="w-full bg-secondary border border-border rounded-lg p-2.5 text-xs text-foreground outline-none h-24 resize-none focus:ring-1 focus:ring-ring select-text"
                placeholder="Provide details, facts, URLs, or evidence context..."
              />
            </div>

            {/* Link URL (Conditional) */}
            {activeNode.data.type === 'link' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Link URL</label>
                <input
                  type="text"
                  value={activeNode.data.url || ''}
                  onChange={(e) => updateNodeData(activeNode.id, { url: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring select-text"
                  placeholder="https://example.com"
                />
              </div>
            )}

            {/* Image URL (Conditional) */}
            {activeNode.data.type === 'image' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Image URL</label>
                <input
                  type="text"
                  value={activeNode.data.imageUrl || ''}
                  onChange={(e) => updateNodeData(activeNode.id, { imageUrl: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring select-text"
                  placeholder="Image URL or local path..."
                />
              </div>
            )}

            {/* 5. Tag Editor */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Tags / Categories</label>
              
              {/* Active tags badges */}
              <div className="flex flex-wrap gap-1 mb-2">
                {activeNode.data.tags && activeNode.data.tags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => handleRemoveTag(tag)}
                    className="text-[9px] bg-secondary text-foreground hover:bg-destructive/15 hover:text-destructive border border-border/80 px-2 py-0.5 rounded-md font-mono cursor-pointer flex items-center gap-1 transition-colors"
                    title="Click to remove tag"
                  >
                    #{tag} <span className="opacity-60 text-[8px]">×</span>
                  </span>
                ))}
              </div>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. database"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 bg-secondary border border-border rounded-lg p-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  onClick={handleAddTag}
                  className="px-2.5 py-1 bg-secondary hover:bg-accent border rounded-lg text-xs font-bold transition-colors"
                >
                  <Tag size={12} />
                </button>
              </div>
            </div>

            {/* 6. Node Delete */}
            <div className="pt-4 border-t border-border/40">
              <button
                onClick={() => deleteNode(activeNode.id)}
                className="w-full py-2 bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground text-destructive border border-destructive/20 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
              >
                <Trash2 size={13} /> Delete Node from Map
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center italic text-muted-foreground/60 pt-10 text-xs">
            No node selected. Click on a node in the mapping canvas to view and edit its logical properties.
          </div>
        )}
      </div>
    </div>
  );
};
