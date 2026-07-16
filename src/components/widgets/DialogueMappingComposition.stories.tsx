import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { DialogueMappingWidget } from './DialogueMappingWidget';
import { DialogueMapperLibraryWidget } from './DialogueMapperLibraryWidget';
import { ArgumentInspectorWidget } from './ArgumentInspectorWidget';

const meta: Meta = {
  title: 'Compositions/Dialogue Mapping Workbench',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockNode = {
  getConfig: () => ({
    mapId: 'default',
    hideInternalLibrary: true,
    hideInternalInspector: true,
  }),
  isVisible: () => true,
};

const UnifiedWorkbench: React.FC = () => {
  return (
    <div className="flex w-screen h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Left Sidebar: Node Library */}
      <div className="w-[300px] h-full flex-shrink-0 flex flex-col border-r border-border bg-card/30">
        <DialogueMapperLibraryWidget />
      </div>

      {/* Main Area: Dialogue Mapping Canvas */}
      <div className="flex-1 h-full flex flex-col min-w-0 relative">
        <DialogueMappingWidget mapId="default" node={mockNode as any} />
      </div>

      {/* Right Sidebar: Property/Argument Inspector */}
      <div className="w-[340px] h-full flex-shrink-0 flex flex-col border-l border-border bg-card/30">
        <div className="p-3 border-b border-border bg-card flex items-center shrink-0">
          <h3 className="font-bold text-sm tracking-tight">Argument Inspector</h3>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <ArgumentInspectorWidget node={mockNode as any} />
        </div>
      </div>
    </div>
  );
};

export const DarkTheme: Story = {
  render: () => (
    <div className="theme-dark bg-background text-foreground w-screen h-screen overflow-hidden">
      <UnifiedWorkbench />
    </div>
  ),
};

export const LightTheme: Story = {
  render: () => (
    <div className="theme-light bg-background text-foreground w-screen h-screen overflow-hidden">
      <UnifiedWorkbench />
    </div>
  ),
};

export const GeorgiaTechTheme: Story = {
  render: () => (
    <div className="theme-gt bg-background text-foreground w-screen h-screen overflow-hidden">
      <UnifiedWorkbench />
    </div>
  ),
};
