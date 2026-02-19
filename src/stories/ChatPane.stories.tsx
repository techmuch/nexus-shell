import type { Meta, StoryObj } from '@storybook/react';
import { ChatPane } from '../components/widgets/ChatPane';
import { useRightSidebarStore } from '../core/services/RightSidebarService';
import { useEffect } from 'react';

const meta: Meta<typeof ChatPane> = {
  title: 'Widgets/ChatPane',
  component: ChatPane,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ChatPane>;

const ChatPaneWrapper = ({ theme }: { theme: string }) => {
  const { setChatOpen } = useRightSidebarStore();
  
  useEffect(() => {
    setChatOpen(true);
  }, [setChatOpen]);

  return (
    <div className={`${theme} h-[600px] border flex`}>
      <ChatPane />
    </div>
  );
};

export const Light: Story = {
  render: () => <ChatPaneWrapper theme="theme-light" />,
};

export const Dark: Story = {
  render: () => <ChatPaneWrapper theme="theme-dark" />,
};

export const GeorgiaTech: Story = {
  render: () => <ChatPaneWrapper theme="theme-gt" />,
};
