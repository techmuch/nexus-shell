import type { Meta, StoryObj } from '@storybook/react';
import { TerminalPane } from '../components/widgets/TerminalPane';
import { useTerminalStore } from '../core/services/TerminalService';
import { useEffect } from 'react';

const meta: Meta<typeof TerminalPane> = {
  title: 'Widgets/TerminalPane',
  component: TerminalPane,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof TerminalPane>;

const TerminalWrapper = ({ theme }: { theme: string }) => {
  const { setOpen, addHistory } = useTerminalStore();
  
  useEffect(() => {
    setOpen(true);
    // Add some dummy history for the story
    addHistory('ls -la');
    addHistory('total 48');
    addHistory('drwxr-xr-x  10 user  staff   320 Feb 19 15:45 .');
    addHistory('drwxr-xr-x   5 user  staff   160 Feb 19 10:20 ..');
    addHistory('-rw-r--r--   1 user  staff  1024 Feb 19 15:45 package.json');
  }, [setOpen, addHistory]);

  return (
    <div className={`${theme} w-[800px] border flex flex-col bg-background text-foreground`}>
      <div className="h-40 bg-muted/20 flex items-center justify-center italic text-muted-foreground">Main Content Area Area Above</div>
      <TerminalPane />
    </div>
  );
};

export const Light: Story = {
  render: () => <TerminalWrapper theme="theme-light" />,
};

export const Dark: Story = {
  render: () => <TerminalWrapper theme="theme-dark" />,
};

export const GeorgiaTech: Story = {
  render: () => <TerminalWrapper theme="theme-gt" />,
};
