import React from 'react';
import { useWikiStore } from '../../../core/services/useWikiStore';
import { History, GitCommit, RotateCcw } from 'lucide-react';

export const WikiHistorySidebar: React.FC = () => {
  const { commits, activePageId, rollbackToCommit } = useWikiStore();
  
  if (!activePageId) return null;
  const pageCommits = commits[activePageId] || [];

  return (
    <div className="flex flex-col h-full bg-[var(--background)] border-l border-[var(--border)] overflow-y-auto">
      <div className="flex items-center gap-2 p-3 border-b border-[var(--border)]">
        <History className="w-4 h-4 text-[var(--muted-foreground)]" />
        <span className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
          Version History
        </span>
      </div>
      
      <div className="p-4 space-y-6">
        {pageCommits.slice().reverse().map((commit, index) => (
          <div key={commit.id} className="relative pl-6">
            {/* Timeline Line */}
            {index !== pageCommits.length - 1 && (
              <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-[var(--border)]" />
            )}
            
            {/* Timeline Dot */}
            <div className="absolute left-0 top-1">
              <GitCommit className="w-6 h-6 text-indigo-500" />
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{commit.message}</span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {new Date(commit.timestamp).toLocaleDateString()}
                </span>
              </div>
              <span className="text-xs text-[var(--muted-foreground)]">by {commit.author}</span>
              <p className="text-sm text-slate-400 mt-1 bg-[var(--muted)] p-2 rounded-md">
                {commit.diffSummary}
              </p>
              
              <button 
                onClick={() => rollbackToCommit(activePageId, commit.id)}
                className="mt-2 self-start flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Restore this version
              </button>
            </div>
          </div>
        ))}
        {pageCommits.length === 0 && (
          <div className="text-sm text-[var(--muted-foreground)] text-center py-8">
            No history available for this page.
          </div>
        )}
      </div>
    </div>
  );
};
