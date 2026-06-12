import type { Meta, StoryObj } from '@storybook/react';
import { DialogueMappingShell } from '../components/layout/DialogueMappingShell';

const meta: Meta<typeof DialogueMappingShell> = {
  title: 'DialogueMapper/DialogueMappingShell',
  component: DialogueMappingShell,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DialogueMappingShell>;

export const DarkWorkspace: Story = {
  render: () => (
    <div className="h-screen w-full overflow-hidden">
      <DialogueMappingShell />
    </div>
  ),
};

export const LightWorkspace: Story = {
  render: () => (
    <div className="h-screen w-full overflow-hidden">
      <DialogueMappingShell />
    </div>
  ),
};
export const GeorgiaTechWorkspace: Story = {
  render: () => (
    <div className="h-screen w-full overflow-hidden">
      <DialogueMappingShell />
    </div>
  ),
};
