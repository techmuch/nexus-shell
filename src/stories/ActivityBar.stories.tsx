import type { Meta, StoryObj } from '@storybook/react';
import { ActivityBar } from '../components/widgets/ActivityBar';
import { useSidebarStore } from '../core/services/SidebarService';
import { Home, User, Bell } from 'lucide-react';

const meta: Meta<typeof ActivityBar> = {
  title: 'Widgets/ActivityBar',
  component: ActivityBar,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ActivityBar>;

export const Light: Story = {
  render: () => (
    <div className="theme-light h-96 border flex">
      <ActivityBar />
    </div>
  ),
};

export const Dark: Story = {
  render: () => (
    <div className="theme-dark h-96 border flex">
      <ActivityBar />
    </div>
  ),
};

export const CustomPanels: Story = {
  render: () => {
    // Set custom panels for this story
    useSidebarStore.getState().setPanels([
      { id: 'h', label: 'Home', icon: Home, component: 'Home' },
      { id: 'u', label: 'User', icon: User, component: 'User' },
      { id: 'b', label: 'Bell', icon: Bell, component: 'Bell' },
    ]);
    
    return (
      <div className="theme-light h-96 border flex">
        <ActivityBar />
      </div>
    );
  },
};
