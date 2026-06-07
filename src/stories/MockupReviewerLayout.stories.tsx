import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { WorkflowMapper } from '../components/widgets/mockup-reviewer/WorkflowMapper';
import { ReviewSidebar } from '../components/widgets/mockup-reviewer/ReviewSidebar';
import { ReviewToolbar } from '../components/widgets/mockup-reviewer/ReviewToolbar';
import { MockupReviewWorkspace } from '../components/widgets/mockup-reviewer/MockupReviewWorkspace';
import { ImplementationPlanWorkspace } from '../components/widgets/mockup-reviewer/ImplementationPlanWorkspace';
import { ExecutionOverlay } from '../components/widgets/mockup-reviewer/ExecutionOverlay';

const meta: Meta = {
  title: 'Widgets/MockupReviewerLayout',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

// 1. Master Composite Dashboard Layout (Workflow, Reviewer, and Plan side-by-side)
export const MasterCompositeDashboard: StoryObj = {
  render: () => {
    const [tool, setTool] = useState<'select' | 'pen' | 'rect' | 'circle' | 'arrow' | 'comment' | 'eraser'>('select');
    const [color, setColor] = useState<string>('#ef4444');
    const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionStep, setExecutionStep] = useState(0);

    return (
      <div className="theme-dark bg-background text-foreground h-screen flex flex-col p-4 overflow-hidden font-sans select-none">
        <header className="mb-3 shrink-0 flex items-center justify-between border-b pb-2 border-border/80">
          <div>
            <h1 className="text-sm font-extrabold text-primary uppercase tracking-widest font-mono">Nexus Workbench Dashboard</h1>
            <p className="text-[11px] text-muted-foreground">Recomposed Layout showing all mockup reviewer components in a unified command center</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold font-mono">
              ACTIVE STATE SYNCED
            </span>
          </div>
        </header>

        {/* Master Workspace Grid */}
        <div className="flex-1 grid grid-cols-12 gap-3 min-h-0 relative">
          {/* Left Panel: Workflow Mapper (React Flow canvas) */}
          <div className="col-span-4 border border-border/80 rounded-xl bg-card/25 flex flex-col overflow-hidden shadow-lg">
            <div className="p-3 border-b border-border/80 bg-muted/20 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-primary font-mono">1. Workflow transitions graph</span>
              <span className="text-[10px] text-muted-foreground/80 font-medium">Double-click nodes to review</span>
            </div>
            <div className="flex-1 relative">
              <WorkflowMapper setActiveTab={() => {}} />
            </div>
          </div>

          {/* Middle Panel: Mockup Reviewer (Sidebar, Toolbar, Viewport) */}
          <div className="col-span-5 border border-border/80 rounded-xl bg-card/25 flex flex-col overflow-hidden shadow-lg">
            <div className="p-3 border-b border-border/80 bg-muted/20 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-accent font-mono">2. Mockup Canvas & Annotation Viewport</span>
              <span className="text-[10px] text-muted-foreground/80 font-medium">Draw markup and comments</span>
            </div>
            <div className="flex-1 flex overflow-hidden min-h-0">
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
          </div>

          {/* Right Panel: Implementation Plan compiler and editor */}
          <div className="col-span-3 border border-border/80 rounded-xl bg-card/25 flex flex-col overflow-hidden shadow-lg">
            <div className="p-3 border-b border-border/80 bg-muted/20 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground/90 font-mono">3. Co-Pilot Compiler Workspace</span>
              <span className="text-[10px] text-muted-foreground/80 font-medium">AI code-generation planner</span>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
              <ImplementationPlanWorkspace
                setIsExecuting={setIsExecuting}
                setExecutionStep={setExecutionStep}
              />
            </div>
          </div>

          {/* Execution overlay inside layout workspace container */}
          <ExecutionOverlay
            isExecuting={isExecuting}
            setIsExecuting={setIsExecuting}
            executionStep={executionStep}
            setExecutionStep={setExecutionStep}
          />
        </div>
      </div>
    );
  },
};

// 2. React Flow Graph Canvas Story (Isolated)
export const WorkflowMapperStory: StoryObj = {
  render: () => (
    <div className="theme-dark bg-background text-foreground h-screen flex flex-col p-4">
      <div className="flex-1 border border-border rounded-xl bg-card/40 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-border bg-muted/25 font-bold text-xs uppercase tracking-wider font-mono">
          Isolated Component: WorkflowMapper
        </div>
        <div className="flex-1 relative">
          <WorkflowMapper setActiveTab={() => {}} />
        </div>
      </div>
    </div>
  ),
};

// 3. Mockup Annotation Canvas and Drawing Overlays (Isolated)
export const MockupReviewerCanvasStory: StoryObj = {
  render: () => {
    const [tool, setTool] = useState<'select' | 'pen' | 'rect' | 'circle' | 'arrow' | 'comment' | 'eraser'>('pen');
    const [color, setColor] = useState<string>('#ef4444');
    const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);

    return (
      <div className="theme-dark bg-background text-foreground h-screen flex flex-col p-4">
        <div className="flex-1 border border-border rounded-xl bg-card/40 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border bg-muted/25 font-bold text-xs uppercase tracking-wider font-mono flex items-center justify-between">
            <span>Isolated Layout: Sidebar + Toolbar + Drawing Canvas</span>
            <span className="text-[10px] text-muted-foreground/80 font-normal">Active Tool: {tool.toUpperCase()}</span>
          </div>
          <div className="flex-1 flex overflow-hidden min-h-0">
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
        </div>
      </div>
    );
  },
};

// 4. Copilot Compiler and Plan Workspace (Isolated)
export const ImplementationPlanStory: StoryObj = {
  render: () => {
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionStep, setExecutionStep] = useState(0);

    return (
      <div className="theme-dark bg-background text-foreground h-screen flex flex-col p-4 relative">
        <div className="flex-1 border border-border rounded-xl bg-card/40 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border bg-muted/25 font-bold text-xs uppercase tracking-wider font-mono">
            Isolated Component: ImplementationPlanWorkspace
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <ImplementationPlanWorkspace
              setIsExecuting={setIsExecuting}
              setExecutionStep={setExecutionStep}
            />
          </div>
        </div>

        <ExecutionOverlay
          isExecuting={isExecuting}
          setIsExecuting={setIsExecuting}
          executionStep={executionStep}
          setExecutionStep={setExecutionStep}
        />
      </div>
    );
  },
};
