import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { DialogueMappingWidget } from './DialogueMappingWidget';
import { DialogueMapperLibraryWidget } from './DialogueMapperLibraryWidget';
import { ArgumentInspectorWidget } from './ArgumentInspectorWidget';
import { SidebarPane } from '../../../src/index';

const meta: Meta = {
  title: 'Examples/Dialogue Mapper/Workbench',
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

export const UnifiedWorkbench: React.FC = () => {
  return (
    <div className="flex w-screen h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Both rails are the same component. Only `side` differs — which is the
          whole point of composing a workbench out of the library's own pieces
          rather than hand-rolling each edge. */}
      <SidebarPane title="IBIS Node Library" width="300px" className="bg-card/30">
        <DialogueMapperLibraryWidget />
      </SidebarPane>

      <div className="flex-1 h-full flex flex-col min-w-0 relative">
        <DialogueMappingWidget mapId="default" node={mockNode as any} />
      </div>

      <SidebarPane
        title="Argument Inspector"
        side="right"
        width="340px"
        className="bg-card/30"
      >
        <ArgumentInspectorWidget node={mockNode as any} />
      </SidebarPane>
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
