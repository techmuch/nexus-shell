import React, { useState } from 'react';
import { Plus, History } from 'lucide-react';
import { useMockupReviewStore } from '../../../core/services/MockupReviewService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ReviewSidebar: React.FC = () => {
  const {
    views,
    activeViewId,
    compareVersionId,
    setActiveViewId,
    setActiveVersionId,
    setCompareVersionId,
    addMockupView,
    addMockupVersion,
  } = useMockupReviewStore();

  const [showAddScreen, setShowAddScreen] = useState(false);
  const [newScreenName, setNewScreenName] = useState('');
  const [newScreenDesc, setNewScreenDesc] = useState('');

  const activeView = views.find((v) => v.id === activeViewId) || null;
  const activeVersion = activeView
    ? activeView.versions.find((v) => v.id === activeView.activeVersionId) || null
    : null;

  const handleAddScreen = () => {
    if (!newScreenName) return;
    addMockupView(newScreenName, newScreenDesc);
    setShowAddScreen(false);
    setNewScreenName('');
    setNewScreenDesc('');
  };

  const handleAddNewVersion = () => {
    if (!activeView || !activeVersion) return;
    const nextVerLabel = `v${activeView.versions.length + 1}.0`;
    addMockupVersion(activeView.id, nextVerLabel, activeVersion.htmlContent);
  };

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col overflow-y-auto shrink-0 select-none">
      {/* Screen View Explorer */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">Mockup Screens</span>
          <button
            onClick={() => setShowAddScreen(true)}
            className="p-1 rounded hover:bg-accent text-primary transition-colors"
            title="Add Mockup Screen Node"
          >
            <Plus size={14} />
          </button>
        </div>

        {showAddScreen && (
          <div className="p-2 border border-border/80 bg-muted/20 rounded mb-2 space-y-2">
            <input
              type="text"
              placeholder="Screen Name"
              className="w-full bg-background border rounded px-2 py-1 text-xs outline-none text-foreground"
              value={newScreenName}
              onChange={(e) => setNewScreenName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Description (Optional)"
              className="w-full bg-background border rounded px-2 py-1 text-xs outline-none text-foreground"
              value={newScreenDesc}
              onChange={(e) => setNewScreenDesc(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowAddScreen(false)}
                className="px-2 py-1 text-[10px] rounded hover:bg-accent border border-border text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleAddScreen}
                className="px-2 py-1 text-[10px] rounded bg-primary text-primary-foreground font-semibold"
              >
                Create
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveViewId(view.id)}
              className={cn(
                "w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-between border border-transparent",
                view.id === activeViewId 
                  ? "bg-accent/80 text-foreground border-l-2 border-primary font-semibold" 
                  : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
              )}
            >
              <span className="truncate">{view.name}</span>
              <span className="text-[10px] text-muted-foreground/60">
                {view.versions.length} revs
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Version Revision History */}
      {activeView && (
        <div className="p-3 border-b border-border flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">Revision Log</span>
            <button
              onClick={handleAddNewVersion}
              className="p-1 rounded hover:bg-accent text-primary text-[10px] font-semibold flex items-center gap-0.5"
              title="Create Revision Version"
            >
              <Plus size={10} /> Add Rev
            </button>
          </div>

          <div className="space-y-1 overflow-y-auto flex-1 min-h-0 pr-1">
            {activeView.versions.map((ver) => (
              <button
                key={ver.id}
                onClick={() => setActiveVersionId(activeView.id, ver.id)}
                className={cn(
                  "w-full text-left px-2.5 py-2 rounded border text-xs flex flex-col gap-0.5 transition-colors",
                  ver.id === activeView.activeVersionId 
                    ? "bg-primary/5 border-primary text-primary font-medium" 
                    : "border-transparent text-muted-foreground hover:bg-accent/30"
                )}
              >
                <span className="font-semibold flex items-center gap-1.5 text-foreground">
                  <History size={12} className="text-muted-foreground" />
                  {ver.label}
                </span>
                <span className="text-[10px] text-muted-foreground/80 font-mono">
                  {new Date(ver.timestamp).toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                  {ver.annotations.length} Annotations
                </span>
              </button>
            ))}
          </div>

          {/* Compare Overlay Revision Selector */}
          <div className="mt-3 pt-3 border-t border-border">
            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 font-mono">
              Compare/Overlay Rev
            </label>
            <select
              className="w-full bg-secondary/60 border border-border rounded px-2 py-1 text-xs outline-none text-foreground"
              value={compareVersionId || ''}
              onChange={(e) => setCompareVersionId(e.target.value || null)}
            >
              <option value="">(None - Select version)</option>
              {activeView.versions
                .filter((v) => v.id !== activeView.activeVersionId)
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label} (compare)
                  </option>
                ))}
            </select>
            <p className="text-[10px] text-muted-foreground/80 mt-1 leading-relaxed">
              Overlays annotations of the selected version in dashed transparent red.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
