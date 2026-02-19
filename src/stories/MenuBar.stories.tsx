import type { Meta, StoryObj } from '@storybook/react';
import { MenuBar } from '../components/widgets/MenuBar';
import { initializeShell } from '../core/Boot';
import { menuRegistry } from '../core/registry/MenuRegistry';

// Initialize core for the story
initializeShell();

const meta: Meta<typeof MenuBar> = {
  title: 'Widgets/MenuBar',
  component: MenuBar,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof MenuBar>;

export const Default: Story = {
  render: () => (
    <div className="theme-light bg-background text-foreground h-16">
      <MenuBar />
    </div>
  ),
};

export const CustomConfiguration: Story = {
  render: () => {
    menuRegistry.setMenus({
      'File': [
        { id: 'f.new', label: 'New Project', commandId: 'nexus.new-tab' },
        { id: 'f.save', label: 'Save', keybinding: 'Control+S' },
      ],
      'Plugins': [
        { 
          id: 'p.manage', 
          label: 'Extension Manager', 
          submenu: [
            { id: 'p.1', label: 'Theme Store' },
            { id: 'p.2', label: 'Icon Packs' },
          ]
        },
      ]
    });
    return (
      <div className="theme-light bg-background text-foreground h-16">
        <MenuBar />
      </div>
    );
  },
};

export const Dark: Story = {
  render: () => (
    <div className="theme-dark bg-background text-foreground h-16">
      <MenuBar />
    </div>
  ),
};

export const GeorgiaTech: Story = {
  render: () => (
    <div className="theme-gt bg-background text-foreground h-16">
      <MenuBar />
    </div>
  ),
};
