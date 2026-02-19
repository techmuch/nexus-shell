import type { Meta, StoryObj } from '@storybook/react';
import { ActivityBar } from '../components/widgets/ActivityBar';

const meta: Meta<typeof ActivityBar> = {
  title: 'Widgets/ActivityBar',
  component: ActivityBar,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ActivityBar>;

export const Light: Story = {
  render: () => (
    <div className="theme-light h-96 border flex">
      <ActivityBar />
    </div>
  ),
};

export const Dark: Story = {
  render: () => (
    <div className="theme-dark h-96 border flex">
      <ActivityBar />
    </div>
  ),
};
