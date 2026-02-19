import type { Meta, StoryObj } from '@storybook/react';
import { CommandPalette } from '../components/widgets/CommandPalette';
import { initializeShell } from '../core/Boot';

const meta: Meta<typeof CommandPalette> = {
  title: 'Widgets/CommandPalette',
  component: CommandPalette,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof CommandPalette>;

export const DefaultGlobal: Story = {
  decorators: [
    (Story) => {
      initializeShell();
      return <Story />;
    },
  ],
  args: {
    forcedOpen: true,
  },
  render: (args) => (
    <div className="theme-light w-[600px] h-[400px]">
      <CommandPalette {...args} />
    </div>
  )
};

export const CustomCommands: Story = {
  args: {
    forcedOpen: true,
    commands: [
      { id: 'custom.1', label: 'Deploy to Production', execute: () => alert('Deploying...'), keybinding: 'Shift+Cmd+D' },
      { id: 'custom.2', label: 'Reset Local Database', execute: () => alert('Resetting...'), keybinding: 'Shift+Alt+R' },
      { id: 'custom.3', label: 'Sync with Remote', execute: () => alert('Syncing...') },
      { id: 'custom.4', label: 'Open Documentation', execute: () => alert('Opening docs...') },
    ]
  },
  render: (args) => (
    <div className="theme-light w-[600px] h-[400px]">
      <CommandPalette {...args} />
    </div>
  )
};

export const DarkTheme: Story = {
  args: {
    forcedOpen: true,
  },
  render: (args) => (
    <div className="theme-dark w-[600px] h-[400px] p-4 bg-slate-900 rounded-lg">
      <CommandPalette {...args} />
    </div>
  )
};
