import type { Meta, StoryObj } from '@storybook/react';
import { FlowControlToolbar } from '../components/widgets/FlowControlToolbar';
import { useState } from 'react';
import { useThemeStore } from '../core/services/ThemeService';

const meta: Meta<typeof FlowControlToolbar> = {
  title: 'Widgets/DialogueMapper/FlowControlToolbar',
  component: FlowControlToolbar,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof FlowControlToolbar>;

const InteractiveHeaderWrapper = () => {
  const [dragMode, setDragMode] = useState<'pan' | 'select'>('pan');
  const [canUndo, setCanUndo] = useState(true);
  const theme = useThemeStore((state) => state.theme);

  return (
    <div className={`theme-${theme} w-[800px] border border-border bg-card p-4 rounded-xl shadow-xl flex items-center justify-between`}>
      <FlowControlToolbar
        variant="header"
        dragMode={dragMode}
        onDragModeChange={setDragMode}
        autoLayoutMode="freeform"
        onAutoLayoutModeChange={(dir) => {
          alert(`Trigger layout: ${dir}`);
          setCanUndo(true);
        }}
        onUndo={() => {
          alert('Undo triggered');
          setCanUndo(false);
        }}
        canUndo={canUndo}

      />
      <div className="text-[10px] text-muted-foreground font-mono">
        Active Drag: {dragMode}
      </div>
    </div>
  );
};

const InteractiveFloatingWrapper = () => {
  const [dragMode, setDragMode] = useState<'pan' | 'select'>('pan');
  const [canUndo, setCanUndo] = useState(true);
  const theme = useThemeStore((state) => state.theme);

  return (
    <div className={`theme-${theme} w-[800px] h-[350px] border border-border bg-background p-6 rounded-xl shadow-xl relative overflow-hidden flex flex-col justify-between`}>
      <div className="absolute top-4 right-4 z-10">
        <FlowControlToolbar
          variant="floating"
          dragMode={dragMode}
          onDragModeChange={setDragMode}
          autoLayoutMode="freeform"
          onAutoLayoutModeChange={(dir) => {
            alert(`Trigger layout: ${dir}`);
            setCanUndo(true);
          }}
          onUndo={() => {
            alert('Undo triggered');
            setCanUndo(false);
          }}
          canUndo={canUndo}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center font-sans">
        <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Canvas Area Preview
        </span>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          Toggled Drag Mode is: <strong className="text-primary font-mono">{dragMode}</strong>. Use the floating control toolbar in the top right to change drag mode, arrange items, or revert actions.
        </p>
      </div>
    </div>
  );
};

export const InteractiveHeader: Story = {
  render: () => <InteractiveHeaderWrapper />,
};

export const InteractiveFloating: Story = {
  render: () => <InteractiveFloatingWrapper />,
};

export const StaticHeaderLight: Story = {
  render: () => (
    <div className="theme-light w-[800px] border border-border bg-card p-4 rounded-xl shadow-md flex items-center justify-between">
      <FlowControlToolbar
        variant="header"
        dragMode="pan"
        onDragModeChange={() => {}}
        autoLayoutMode="freeform"
        onAutoLayoutModeChange={() => {}}
        onUndo={() => {}}
        canUndo={true}

      />
    </div>
  ),
};

export const StaticHeaderDark: Story = {
  render: () => (
    <div className="theme-dark w-[800px] border border-border bg-card p-4 rounded-xl shadow-md flex items-center justify-between">
      <FlowControlToolbar
        variant="header"
        dragMode="pan"
        onDragModeChange={() => {}}
        autoLayoutMode="freeform"
        onAutoLayoutModeChange={() => {}}
        onUndo={() => {}}
        canUndo={true}

      />
    </div>
  ),
};

export const StaticHeaderGeorgiaTech: Story = {
  render: () => (
    <div className="theme-gt w-[800px] border border-border bg-card p-4 rounded-xl shadow-md flex items-center justify-between">
      <FlowControlToolbar
        variant="header"
        dragMode="pan"
        onDragModeChange={() => {}}
        autoLayoutMode="freeform"
        onAutoLayoutModeChange={() => {}}
        onUndo={() => {}}
        canUndo={true}

      />
    </div>
  ),
};

export const StaticFloatingLight: Story = {
  render: () => (
    <div className="theme-light w-[800px] h-[150px] border border-border bg-background p-6 rounded-xl shadow-md flex items-center justify-center relative">
      <div className="absolute top-4 right-4 z-10">
        <FlowControlToolbar
          variant="floating"
          dragMode="select"
          onDragModeChange={() => {}}
          autoLayoutMode="freeform"
          onAutoLayoutModeChange={() => {}}
          onUndo={() => {}}
          canUndo={true}
        />
      </div>
      <span className="text-xs text-muted-foreground font-mono">Light Floating Preview</span>
    </div>
  ),
};

export const StaticFloatingDark: Story = {
  render: () => (
    <div className="theme-dark w-[800px] h-[150px] border border-border bg-background p-6 rounded-xl shadow-md flex items-center justify-center relative">
      <div className="absolute top-4 right-4 z-10">
        <FlowControlToolbar
          variant="floating"
          dragMode="select"
          onDragModeChange={() => {}}
          autoLayoutMode="freeform"
          onAutoLayoutModeChange={() => {}}
          onUndo={() => {}}
          canUndo={true}
        />
      </div>
      <span className="text-xs text-muted-foreground font-mono">Dark Floating Preview</span>
    </div>
  ),
};

export const StaticFloatingGeorgiaTech: Story = {
  render: () => (
    <div className="theme-gt w-[800px] h-[150px] border border-border bg-background p-6 rounded-xl shadow-md flex items-center justify-center relative">
      <div className="absolute top-4 right-4 z-10">
        <FlowControlToolbar
          variant="floating"
          dragMode="select"
          onDragModeChange={() => {}}
          autoLayoutMode="freeform"
          onAutoLayoutModeChange={() => {}}
          onUndo={() => {}}
          canUndo={true}
        />
      </div>
      <span className="text-xs text-muted-foreground font-mono">GT Floating Preview</span>
    </div>
  ),
};
