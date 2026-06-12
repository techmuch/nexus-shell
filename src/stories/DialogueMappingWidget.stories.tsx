import type { Meta, StoryObj } from '@storybook/react';
import { DialogueMappingWidget } from '../components/widgets/DialogueMappingWidget';

const meta: Meta<typeof DialogueMappingWidget> = {
  title: 'DialogueMapper/DialogueMappingWidget',
  component: DialogueMappingWidget,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DialogueMappingWidget>;

export const DarkTheme: Story = {
  render: () => (
    <div className="theme-dark bg-background text-foreground h-[600px] w-full border border-border overflow-hidden rounded-xl">
      <DialogueMappingWidget />
    </div>
  ),
};

export const LightTheme: Story = {
  render: () => (
    <div className="theme-light bg-background text-foreground h-[600px] w-full border border-border overflow-hidden rounded-xl">
      <DialogueMappingWidget />
    </div>
  ),
};

export const GeorgiaTechTheme: Story = {
  render: () => (
    <div className="theme-gt bg-background text-foreground h-[600px] w-full border border-border overflow-hidden rounded-xl">
      <DialogueMappingWidget />
    </div>
  ),
};
