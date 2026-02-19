import type { Meta, StoryObj } from '@storybook/react';
import { UserProfile } from '../components/widgets/UserProfile';

const meta: Meta<typeof UserProfile> = {
  title: 'Widgets/UserProfile',
  component: UserProfile,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof UserProfile>;

export const Default: Story = {
  args: {
    name: 'David techmuch',
    role: 'Principal Engineer',
  },
  render: (args) => (
    <div className="theme-light p-4 border rounded bg-background">
      <UserProfile {...args} />
    </div>
  )
};

export const WithAvatar: Story = {
  args: {
    name: 'Jane Doe',
    role: 'Product Designer',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  render: (args) => (
    <div className="theme-light p-4 border rounded bg-background">
      <UserProfile {...args} />
    </div>
  )
};

export const Compact: Story = {
  args: {
    name: 'Jane Doe',
    showName: false,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  render: (args) => (
    <div className="theme-light p-4 border rounded bg-background">
      <UserProfile {...args} />
    </div>
  )
};

export const DarkTheme: Story = {
  args: {
    name: 'Alex Smith',
    role: 'Admin',
  },
  render: (args) => (
    <div className="theme-dark p-4 border rounded bg-slate-900 text-slate-100">
      <UserProfile {...args} />
    </div>
  )
};
