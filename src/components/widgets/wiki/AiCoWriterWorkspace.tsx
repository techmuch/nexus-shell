import React, { useState } from 'react';
import { useWikiStore } from '../../../core/services/useWikiStore';
import { Sparkles, Loader2, Link as LinkIcon, FileCheck } from 'lucide-react';

export const AiCoWriterWorkspace: React.FC = () => {
  const { activePageId, pages, generateCompletion, updatePageContent } = useWikiStore();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [actionType, setActionType] = useState('refine'); // refine, outline, links

  const activePage = activePageId ? pages[activePageId] : null;

  const handleGenerate = async () => {
    if (!activePage || !prompt.trim()) return;
    setIsGenerating(true);
    const result = await generateCompletion(activePage.content, `Action: ${actionType}, Request: ${prompt}`);
    updatePageContent(activePage.id, activePage.content + '\n\n' + result);
    setIsGenerating(false);
    setPrompt('');
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)] border-l border-[var(--border)]">
      <div className="flex items-center gap-2 p-3 border-b border-[var(--border)]">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
          AI Co-Writer
        </span>
      </div>
      
      <div className="p-4 flex flex-col gap-4 flex-1 overflow-y-auto">
        <div className="space-y-2">
          <label className="text-xs text-[var(--muted-foreground)] uppercase">Task Type</label>
          <select 
            className="w-full bg-[var(--card)] border border-[var(--border)] text-sm rounded-md p-2 outline-none"
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
          >
            <option value="refine">Refine Content</option>
            <option value="outline">Generate Outline</option>
            <option value="links">Suggest Wiki Links</option>
            <option value="audit">Cross-Reference Audit</option>
          </select>
        </div>

        <div className="space-y-2 flex-1 flex flex-col">
          <label className="text-xs text-[var(--muted-foreground)] uppercase">Instructions</label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full flex-1 min-h-[100px] bg-[var(--card)] border border-[var(--border)] text-sm rounded-md p-3 outline-none resize-none"
            placeholder="E.g. Make this technical and formal..."
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating || !activePage}
          className="flex items-center justify-center gap-2 w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-md py-2 px-4 transition-colors disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isGenerating ? 'Generating...' : 'Run Task'}
        </button>

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-2">
          <label className="text-xs text-[var(--muted-foreground)] uppercase">Quick Actions</label>
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-1.5 p-2 text-xs bg-[var(--muted)] hover:bg-[var(--accent)] rounded transition-colors text-[var(--foreground)]">
              <LinkIcon className="w-3 h-3 text-teal-400" /> Auto-Link
            </button>
            <button className="flex items-center justify-center gap-1.5 p-2 text-xs bg-[var(--muted)] hover:bg-[var(--accent)] rounded transition-colors text-[var(--foreground)]">
              <FileCheck className="w-3 h-3 text-emerald-400" /> Fact Check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
