import type { Meta, StoryObj } from '@storybook/react';
import { NexusWorkspaceTitle } from '../components/widgets/NexusWorkspaceTitle';
import { Network, Database } from 'lucide-react';

const meta: Meta<typeof NexusWorkspaceTitle> = {
  title: 'Widgets/NexusWorkspaceTitle',
  component: NexusWorkspaceTitle,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof NexusWorkspaceTitle>;

export const Default: Story = {
  render: () => (
    <div className="theme-dark p-6 rounded-xl border border-border bg-card">
      <NexusWorkspaceTitle />
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
      <NexusWorkspaceTitle {...args} />
    </div>
  ),
};

export const LightTheme: Story = {
  render: () => (
    <div className="theme-light p-6 rounded-xl border border-border bg-card text-foreground">
      <NexusWorkspaceTitle />
    </div>
  ),
};

export const DarkTheme: Story = {
  render: () => (
    <div className="theme-dark p-6 rounded-xl border border-border bg-card text-foreground">
      <NexusWorkspaceTitle />
    </div>
  ),
};

export const GeorgiaTechTheme: Story = {
  render: () => (
    <div className="theme-gt p-6 rounded-xl border border-border bg-card text-foreground">
      <NexusWorkspaceTitle icon={<Network size={16} />} />
    </div>
  ),
};
