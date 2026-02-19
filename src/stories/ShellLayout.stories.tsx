import type { Meta, StoryObj } from '@storybook/react';
import { ShellLayout } from '../components/layout/ShellLayout';
import { initializeShell } from '../core/Boot';
import { Home, User, Bell, Activity, Info, RefreshCcw } from 'lucide-react';
import { UserProfile } from '../components/widgets/UserProfile';

const meta: Meta<typeof ShellLayout> = {
  title: 'Layout/ShellLayout',
  component: ShellLayout,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ShellLayout>;

export const Default: Story = {
  decorators: [
    (Story) => {
      initializeShell();
      return <Story />;
    },
  ],
  render: () => <ShellLayout />,
};

export const WithUserProfile: Story = {
  decorators: [
    (Story) => {
      initializeShell();
      return <Story />;
    },
  ],
  render: () => (
    <ShellLayout 
      rightMenuBarContent={
        <UserProfile 
          name="David Tech" 
          role="Shell Architect" 
          avatarUrl="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
          onClick={() => alert('Profile Clicked!')}
        />
      }
    />
  )
};

export const CustomStatusBar: Story = {
  decorators: [
    (Story) => {
      initializeShell();
      return <Story />;
    },
  ],
  args: {
    statusBarConfig: [
      {
        id: 'health',
        label: 'System: OK',
        icon: Activity,
        alignment: 'left',
        onClick: () => alert('System health is 100%'),
      },
      {
        id: 'version',
        label: 'v1.2.3',
        icon: Info,
        alignment: 'center',
      },
      {
        id: 'sync',
        label: 'Synced',
        icon: RefreshCcw,
        alignment: 'right',
        className: 'text-green-400',
      },
    ],
  },
};

export const CustomConfiguration: Story = {
  decorators: [
    (Story) => {
      initializeShell();
      return <Story />;
    },
  ],
  args: {
    panels: [
      {
        id: 'home',
        label: 'Home',
        icon: Home,
        component: () => <div className="p-4 text-sm">Welcome to your custom Home sidebar!</div>,
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: User,
        component: () => <div className="p-4 text-sm">This is the User Profile panel.</div>,
      },
      {
        id: 'notifications',
        label: 'Alerts',
        icon: Bell,
        component: () => <div className="p-4 text-sm font-bold text-destructive">System Alert: All systems are operational.</div>,
      },
    ],
  },
};

export const CustomMenus: Story = {
  decorators: [
    (Story) => {
      initializeShell();
      return <Story />;
    },
  ],
  args: {
    menuConfig: {
      'App': [
        { id: 'app.about', label: 'About App', commandId: 'nexus.about' },
        { id: 'app.sep', label: '---', commandId: '' },
        { id: 'app.quit', label: 'Quit', commandId: '' },
      ],
      'Project': [
        { id: 'proj.new', label: 'New Project', commandId: 'nexus.new-tab' },
        { 
          id: 'proj.recent', 
          label: 'Open Recent', 
          submenu: [
            { id: 'recent.1', label: 'Nexus Shell v1', commandId: 'nexus.new-tab' },
            { id: 'recent.2', label: 'Legacy Project', commandId: 'nexus.new-tab' },
          ]
        }
      ],
      'Actions': [
        { id: 'act.chat', label: 'Toggle Chat', commandId: 'nexus.toggle-chat' },
      ]
    }
  }
};

export const CustomSlashCommands: Story = {
  decorators: [
    (Story) => {
      initializeShell();
      return <Story />;
    },
  ],
  args: {
    slashCommands: [
      {
        command: 'ping',
        description: 'Test the application response',
        execute: () => alert('Custom Pong!'),
      },
      {
        command: 'echo',
        description: 'Repeat back what you type',
        execute: (args) => alert(`Echo: ${args.join(' ')}`),
      },
    ],
  },
};

