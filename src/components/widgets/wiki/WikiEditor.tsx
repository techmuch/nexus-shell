import React, { useState } from 'react';
import { useWikiStore } from '../../../core/services/useWikiStore';
import { Wand2, Save } from 'lucide-react';

export const WikiEditor: React.FC = () => {
  const { pages, activePageId, updatePageContent, commitPageChanges, generateCompletion } = useWikiStore();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const activePage = activePageId ? pages[activePageId] : null;

  if (!activePage) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--background)] text-[var(--muted-foreground)]">
        Select a page to edit
      </div>
    );
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updatePageContent(activePage.id, e.target.value);
  };

  const handleSave = async () => {
    await commitPageChanges(activePage.id, 'Current User');
  };

  const handleAIAssist = async () => {
    setIsGenerating(true);
    const completion = await generateCompletion(activePage.content, "Expand on this topic");
    updatePageContent(activePage.id, activePage.content + '\n\n' + completion);
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)] text-[var(--foreground)]">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--card)]">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{activePage.title}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">
            {activePage.status}
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleAIAssist}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-md transition-colors disabled:opacity-50"
          >
            <Wand2 className="w-4 h-4" />
            {isGenerating ? 'Thinking...' : 'AI Assist'}
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 rounded-md transition-colors"
          >
            <Save className="w-4 h-4" />
            Save & Commit
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <textarea
          value={activePage.content}
          onChange={handleContentChange}
          className="w-full h-full min-h-[300px] p-4 bg-transparent border-none outline-none resize-none font-mono text-sm leading-relaxed"
          placeholder="Start writing your wiki page here..."
        />
      </div>
    </div>
  );
};
