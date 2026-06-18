import type { Meta, StoryObj } from '@storybook/react';
import { DialogueMappingWidget } from '../components/widgets/DialogueMappingWidget';

const meta: Meta<typeof DialogueMappingWidget> = {
  title: 'Widgets/DialogueMapper/DialogueMappingWidget',
  component: DialogueMappingWidget,
  argTypes: {
    defaultDragMode: {
      control: { type: 'select' },
      options: ['pan', 'select'],
      description: 'Default drag mode for the canvas',
    },
  },
  args: {
    defaultDragMode: 'select',
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DialogueMappingWidget>;

export const DarkTheme: Story = {
  render: (args) => (
    <div className="theme-dark bg-background text-foreground h-[600px] w-full border border-border overflow-hidden rounded-xl">
      <DialogueMappingWidget {...args} />
    </div>
  ),
};

export const LightTheme: Story = {
  render: (args) => (
    <div className="theme-light bg-background text-foreground h-[600px] w-full border border-border overflow-hidden rounded-xl">
      <DialogueMappingWidget {...args} />
    </div>
  ),
};

export const GeorgiaTechTheme: Story = {
  render: (args) => (
    <div className="theme-gt bg-background text-foreground h-[600px] w-full border border-border overflow-hidden rounded-xl">
      <DialogueMappingWidget {...args} />
    </div>
  ),
};
