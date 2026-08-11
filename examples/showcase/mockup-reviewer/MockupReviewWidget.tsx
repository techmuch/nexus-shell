import React, { useState } from 'react';
import { GitFork, Eye, Sparkles, Download } from 'lucide-react';
import { useMockupReviewStore } from './MockupReviewService';
import { ReviewSidebar } from './components/ReviewSidebar';
import { ReviewToolbar } from './components/ReviewToolbar';
import { MockupReviewWorkspace } from './components/MockupReviewWorkspace';
import { WorkflowMapper } from './components/WorkflowMapper';
import { ImplementationPlanWorkspace } from './components/ImplementationPlanWorkspace';
import { ExecutionOverlay } from './components/ExecutionOverlay';
import { cn } from '../../../src/lib/cn';

export const MockupReviewWidget: React.FC = () => {
  const { exportHistoryJson, activeViewId } = useMockupReviewStore();
  const [activeTab, setActiveTab] = useState<'workflow' | 'review' | 'implementation'>('workflow');
  
  // Shared annotation states for review tab
  const [tool, setTool] = useState<'select' | 'pen' | 'rect' | 'circle' | 'arrow' | 'comment' | 'eraser'>('select');
  const [color, setColor] = useState<string>('#ef4444');
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);

  // Execution overlay states
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);

  const triggerExport = () => {
    const jsonStr = exportHistoryJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mockup-feedback-${activeViewId || 'system'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground border border-border overflow-hidden rounded-lg relative">
      
      {/* Header Tabs */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20 shrink-0 select-none">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('workflow')}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors",
              activeTab === 'workflow' 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-accent text-muted-foreground hover:text-foreground"
            )}
          >
            <GitFork size={14} /> Workflow Mapper
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors",
              activeTab === 'review' 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-accent text-muted-foreground hover:text-foreground"
            )}
          >
            <Eye size={14} /> Mockup Reviewer
          </button>
          <button
            onClick={() => setActiveTab('implementation')}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors",
              activeTab === 'implementation' 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-accent text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles size={14} /> Implementation Plan
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={triggerExport}
            className="p-1.5 rounded bg-secondary/80 hover:bg-secondary text-foreground text-xs font-semibold flex items-center gap-1.5 border border-border"
            title="Export feedback report JSON"
          >
            <Download size={14} /> Export Feedback Report
          </button>
        </div>
      </div>

      {/* Main tab content */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {activeTab === 'workflow' ? (
          <WorkflowMapper setActiveTab={setActiveTab} />
        ) : activeTab === 'review' ? (
          <div className="flex flex-1 overflow-hidden">
            <ReviewSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <ReviewToolbar 
                tool={tool}
                setTool={setTool}
                color={color}
                setColor={setColor}
                selectedAnnotationId={selectedAnnotationId}
                setSelectedAnnotationId={setSelectedAnnotationId}
              />
              <MockupReviewWorkspace 
                tool={tool}
                color={color}
                selectedAnnotationId={selectedAnnotationId}
                setSelectedAnnotationId={setSelectedAnnotationId}
              />
            </div>
          </div>
        ) : (
          <ImplementationPlanWorkspace 
            setIsExecuting={setIsExecuting}
            setExecutionStep={setExecutionStep}
          />
        )}
      </div>

      {/* Global Execution progress animations overlay */}
      <ExecutionOverlay 
        isExecuting={isExecuting}
        setIsExecuting={setIsExecuting}
        executionStep={executionStep}
        setExecutionStep={setExecutionStep}
      />

    </div>
  );
};
