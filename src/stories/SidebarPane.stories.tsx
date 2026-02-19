import type { Meta, StoryObj } from '@storybook/react';
import { SidebarPane } from '../components/widgets/SidebarPane';
import { useSidebarStore } from '../core/services/SidebarService';
import { Home } from 'lucide-react';
import { useEffect } from 'react';

const meta: Meta<typeof SidebarPane> = {
  title: 'Widgets/SidebarPane',
  component: SidebarPane,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof SidebarPane>;

const SidebarPaneWrapper = ({ theme }: { theme: string }) => {
  useEffect(() => {
    useSidebarStore.getState().setPanels([
      {
        id: 'home',
        label: 'Home',
        icon: Home,
        component: () => <div className="p-4">Dynamic Home Content</div>,
      },
    ]);
    useSidebarStore.getState().setActiveSidebar('home');
  }, []);

  return (
    <div className={`${theme} bg-background text-foreground h-[600px] border flex`}>
      <SidebarPane />
    </div>
  );
};

export const Light: Story = {
  render: () => <SidebarPaneWrapper theme="theme-light" />,
};

export const Dark: Story = {
  render: () => <SidebarPaneWrapper theme="theme-dark" />,
};
