import type { Meta, StoryObj } from '@storybook/react';
import { ChatPane } from '../components/widgets/ChatPane';
import { useRightSidebarStore } from '../core/services/RightSidebarService';
import { useChatStore } from '../core/services/ChatService';
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

const ChatPaneWrapper = ({ theme, customCommands }: { theme: string, customCommands?: boolean }) => {
  const { setChatOpen } = useRightSidebarStore();
  const { setSlashCommands } = useChatStore();
  
  useEffect(() => {
    setChatOpen(true);
    if (customCommands) {
      setSlashCommands([
        { command: 'help', description: 'Show help', execute: () => {} },
        { command: 'clear', description: 'Clear history', execute: () => {} },
        { command: 'status', description: 'System status', execute: () => {} },
        { command: 'joke', description: 'Tell a joke', execute: () => {} },
      ]);
    }
  }, [setChatOpen, setSlashCommands, customCommands]);

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

export const SlashCommands: Story = {
  render: () => <ChatPaneWrapper theme="theme-light" customCommands />,
};
