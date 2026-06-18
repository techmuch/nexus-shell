import type { Meta, StoryObj } from '@storybook/react';
import { MockupReviewWidget } from '../components/widgets/MockupReviewWidget';

const meta: Meta<typeof MockupReviewWidget> = {
  title: 'Widgets/General/MockupReviewWidget',
  component: MockupReviewWidget,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof MockupReviewWidget>;

export const Light: Story = {
  render: () => (
    <div className="theme-light bg-background text-foreground p-2 rounded border h-[650px] w-full">
      <MockupReviewWidget />
    </div>
  ),
};

export const Dark: Story = {
  render: () => (
    <div className="theme-dark bg-background text-foreground p-2 rounded border h-[650px] w-full">
      <MockupReviewWidget />
    </div>
  ),
};

export const GeorgiaTech: Story = {
  render: () => (
    <div className="theme-gt bg-background text-foreground p-2 rounded border h-[650px] w-full">
      <MockupReviewWidget />
    </div>
  ),
};
