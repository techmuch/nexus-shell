import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NexusWorkspaceShell } from '../components/layout/NexusWorkspaceShell';
import { useThemeStore } from '../core/services/ThemeService';

const meta: Meta<typeof NexusWorkspaceShell> = {
  title: 'Compositions/NexusWorkspaceShell',
  component: NexusWorkspaceShell,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof NexusWorkspaceShell>;

const DarkWorkspaceWrapper = () => {
  const setTheme = useThemeStore((state) => state.setTheme);
  useEffect(() => {
    setTheme('dark');
  }, [setTheme]);
  return <NexusWorkspaceShell />;
};

export const DarkWorkspace: Story = {
  render: () => (
    <div className="h-screen w-full overflow-hidden">
      <DarkWorkspaceWrapper />
    </div>
  ),
};

const LightWorkspaceWrapper = () => {
  const setTheme = useThemeStore((state) => state.setTheme);
  useEffect(() => {
    setTheme('light');
  }, [setTheme]);
  return <NexusWorkspaceShell />;
};

export const LightWorkspace: Story = {
  render: () => (
    <div className="h-screen w-full overflow-hidden">
      <LightWorkspaceWrapper />
    </div>
  ),
};

const GeorgiaTechWorkspaceWrapper = () => {
  const setTheme = useThemeStore((state) => state.setTheme);
  useEffect(() => {
    setTheme('gt');
  }, [setTheme]);
  return <NexusWorkspaceShell />;
};

export const GeorgiaTechWorkspace: Story = {
  render: () => (
    <div className="h-screen w-full overflow-hidden">
      <GeorgiaTechWorkspaceWrapper />
    </div>
  ),
};
