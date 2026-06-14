import type { Meta, StoryObj } from '@storybook/react';
import { DialogueMapperTitle } from '../components/widgets/DialogueMapperTitle';
import { Network, Database } from 'lucide-react';

const meta: Meta<typeof DialogueMapperTitle> = {
  title: 'Widgets/DialogueMapperTitle',
  component: DialogueMapperTitle,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof DialogueMapperTitle>;

export const Default: Story = {
  render: () => (
    <div className="theme-dark p-6 rounded-xl border border-border bg-card">
      <DialogueMapperTitle />
    </div>
  ),
};

export const CustomTextAndIcon: Story = {
  args: {
    title: 'Custom Workspace Title',
    subtitle: 'This is a custom sub-heading details',
    icon: <Database size={16} />,
  },
  render: (args) => (
    <div className="theme-dark p-6 rounded-xl border border-border bg-card">
      <DialogueMapperTitle {...args} />
    </div>
  ),
};

export const LightTheme: Story = {
  render: () => (
    <div className="theme-light p-6 rounded-xl border border-border bg-card text-foreground">
      <DialogueMapperTitle />
    </div>
  ),
};

export const DarkTheme: Story = {
  render: () => (
    <div className="theme-dark p-6 rounded-xl border border-border bg-card text-foreground">
      <DialogueMapperTitle />
    </div>
  ),
};

export const GeorgiaTechTheme: Story = {
  render: () => (
    <div className="theme-gt p-6 rounded-xl border border-border bg-card text-foreground">
      <DialogueMapperTitle icon={<Network size={16} />} />
    </div>
  ),
};
