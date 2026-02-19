import type { Meta, StoryObj } from '@storybook/react';
import { MenuBar } from '../components/widgets/MenuBar';
import { initializeShell } from '../core/Boot';

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
