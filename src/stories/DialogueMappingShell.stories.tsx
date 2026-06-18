import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DialogueMappingShell } from '../components/layout/DialogueMappingShell';
import { useThemeStore } from '../core/services/ThemeService';

const meta: Meta<typeof DialogueMappingShell> = {
  title: 'Compositions/DialogueMappingShell',
  component: DialogueMappingShell,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DialogueMappingShell>;

const DarkWorkspaceWrapper = () => {
  const setTheme = useThemeStore((state) => state.setTheme);
  useEffect(() => {
    setTheme('dark');
  }, [setTheme]);
  return <DialogueMappingShell />;
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
  return <DialogueMappingShell />;
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
  return <DialogueMappingShell />;
};

export const GeorgiaTechWorkspace: Story = {
  render: () => (
    <div className="h-screen w-full overflow-hidden">
      <GeorgiaTechWorkspaceWrapper />
    </div>
  ),
};
