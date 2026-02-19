import type { Meta, StoryObj } from '@storybook/react';
import { StatusBar } from '../components/widgets/StatusBar';

const meta: Meta<typeof StatusBar> = {
  title: 'Widgets/StatusBar',
  component: StatusBar,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof StatusBar>;

export const Default: Story = {
  render: () => (
    <div className="theme-light">
      <StatusBar />
    </div>
  ),
};

export const Dark: Story = {
  render: () => (
    <div className="theme-dark">
      <StatusBar />
    </div>
  ),
};

export const GeorgiaTech: Story = {
  render: () => (
    <div className="theme-gt">
      <StatusBar />
    </div>
  ),
};
