import React from 'react';
import { useWikiStore } from '../../../core/services/useWikiStore';
import { FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export const WikiNavigator: React.FC = () => {
  const { pages, activePageId, setActivePage } = useWikiStore();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Published': return <CheckCircle className="w-3 h-3 text-emerald-500" />;
      case 'Draft': return <Clock className="w-3 h-3 text-amber-500" />;
      case 'Outdated': return <AlertCircle className="w-3 h-3 text-rose-500" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)] border-r border-[var(--border)] overflow-y-auto">
      <div className="p-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider border-b border-[var(--border)]">
        Wiki Pages
      </div>
      <div className="p-2 space-y-1">
        {Object.values(pages).map((page) => {
          const isActive = page.id === activePageId;
          return (
            <button
              key={page.id}
              onClick={() => setActivePage(page.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors ${
                isActive 
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' 
                  : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="flex-1 text-left truncate">{page.title}</span>
              {getStatusIcon(page.status)}
            </button>
          );
        })}
      </div>
    </div>
  );
};
