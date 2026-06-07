import React, { useState } from 'react';
import { Eye, Pencil, Sparkles, Play } from 'lucide-react';
import { useMockupReviewStore } from '../../../core/services/MockupReviewService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ImplementationPlanWorkspaceProps {
  setIsExecuting: (val: boolean) => void;
  setExecutionStep: (step: number) => void;
}

export const ImplementationPlanWorkspace: React.FC<ImplementationPlanWorkspaceProps> = ({
  setIsExecuting,
  setExecutionStep,
}) => {
  const {
    implementationPlan,
    setImplementationPlan,
    generateImplementationPlanAction,
    refineImplementationPlanAction,
  } = useMockupReviewStore();

  const [planEditMode, setPlanEditMode] = useState<'edit' | 'preview'>('preview');
  const [refinementText, setRefinementText] = useState('');

  const handleExecute = () => {
    setIsExecuting(true);
    setExecutionStep(0);
  };

  return (
    <div className="flex flex-1 overflow-hidden bg-card/40 relative select-none">
      
      {/* Edit/Preview Markdown Workspace (Left) */}
      <div className="flex-1 flex flex-col border-r border-border min-w-0 bg-background/50">
        <div className="flex justify-between items-center p-3 border-b border-border bg-muted/10">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">Plan Editor & Document</span>
          <div className="flex gap-1.5 border rounded p-0.5 bg-muted/20">
            <button
              onClick={() => setPlanEditMode('preview')}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors",
                planEditMode === 'preview' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent"
              )}
            >
              <Eye size={12} /> Preview
            </button>
            <button
              onClick={() => setPlanEditMode('edit')}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors",
                planEditMode === 'edit' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent"
              )}
            >
              <Pencil size={12} /> Edit
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto min-h-0 flex flex-col select-text">
          {planEditMode === 'edit' ? (
            <textarea
              className="w-full flex-1 bg-secondary/20 border border-border rounded-lg p-4 font-mono text-xs text-foreground outline-none resize-none focus:ring-1 focus:ring-ring"
              value={implementationPlan}
              onChange={(e) => setImplementationPlan(e.target.value)}
              placeholder="Draft system implementation plan..."
            />
          ) : (
            <div className="w-full flex-1 bg-secondary/10 border border-border/40 rounded-lg p-6 font-sans text-xs text-foreground overflow-auto select-text prose prose-invert max-w-none">
              {implementationPlan ? (
                // Simple Styled Markdown Previewer
                implementationPlan.split('\n').map((line, idx) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={idx} className="text-xl font-bold border-b border-border pb-2 mb-4 mt-2 text-primary">{line.substring(2)}</h1>;
                  }
                  if (line.startsWith('## ')) {
                    return <h2 key={idx} className="text-lg font-bold mt-5 mb-2.5 text-accent">{line.substring(3)}</h2>;
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={idx} className="text-sm font-bold mt-4 mb-2 text-foreground/90">{line.substring(4)}</h3>;
                  }
                  if (line.startsWith('- ')) {
                    // Check if it's a checkbox task
                    const isTask = line.startsWith('- [ ] ') || line.startsWith('- [x] ');
                    if (isTask) {
                      const isDone = line.startsWith('- [x]');
                      return (
                        <div key={idx} className="flex items-start gap-2 my-1 pl-4">
                          <input type="checkbox" checked={isDone} disabled className="mt-0.5" />
                          <span className={cn(isDone ? "line-through text-muted-foreground/60" : "text-foreground/85")}>
                            {line.substring(6)}
                          </span>
                        </div>
                      );
                    }
                    return <li key={idx} className="ml-4 list-disc my-0.5 text-foreground/80">{line.substring(2)}</li>;
                  }
                  if (line.trim() === '') {
                    return <div key={idx} className="h-2" />;
                  }
                  return <p key={idx} className="my-1 leading-relaxed text-foreground/80 pl-1">{line}</p>;
                })
              ) : (
                <div className="italic text-muted-foreground text-center pt-8">No plan generated yet. Select "Generate Plan from Mockups" on the right panel.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Console Sidebar (Right) */}
      <aside className="w-80 p-4 flex flex-col gap-4 bg-card/60 overflow-y-auto">
        <div className="border border-border/60 bg-muted/10 rounded-lg p-3.5 space-y-3 shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-mono">
            <Sparkles size={14} className="text-primary" />
            Copilot Plan Compiler
          </h4>
          <p className="text-[11px] text-muted-foreground/90 leading-relaxed">
            Analyze active workflow nodes, template generalization hierarchies, HTML views, and reviewer notes to compile the detailed project specifications.
          </p>
          <button
            onClick={() => {
              generateImplementationPlanAction();
              setPlanEditMode('preview');
            }}
            className="w-full py-2 px-3 bg-primary hover:bg-primary/95 text-primary-foreground rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-shadow hover:shadow-md border border-primary/20"
          >
            <Sparkles size={13} /> Generate Plan from Mockups
          </button>
        </div>

        <div className="border border-border/60 bg-muted/10 rounded-lg p-3.5 space-y-3 shadow-sm flex-1 flex flex-col min-h-0">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-mono">
            <Pencil size={14} className="text-primary" />
            AI Refinement Prompt
          </h4>
          <p className="text-[11px] text-muted-foreground/95">
            Add custom design rules, mobile specifications, security guidelines, or specific task lists.
          </p>
          <textarea
            placeholder="e.g. Include mobile responsive overrides for settings grids, or write Playwright tests for Login Portal navigation..."
            className="w-full flex-1 min-h-[80px] bg-secondary/50 border rounded-lg p-2.5 text-xs text-foreground outline-none resize-none focus:ring-1 focus:ring-ring"
            value={refinementText}
            onChange={(e) => setRefinementText(e.target.value)}
          />
          <button
            onClick={() => {
              if (!refinementText) return;
              refineImplementationPlanAction(refinementText);
              setRefinementText('');
              setPlanEditMode('preview');
            }}
            className="w-full py-1.5 px-3 bg-secondary hover:bg-secondary/80 text-foreground border rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            Refine Plan with AI
          </button>
        </div>

        <button
          onClick={handleExecute}
          className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/10 transition-transform active:scale-[0.98]"
        >
          <Play size={13} fill="currentColor" /> Execute Implementation Plan
        </button>
      </aside>
    </div>
  );
};
