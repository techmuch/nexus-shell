import type { Meta, StoryObj } from '@storybook/react';
import { StatusBar } from '../components/widgets/StatusBar';
import { useStatusBarStore } from '../core/services/StatusBarService';
import { Info, Check } from 'lucide-react';

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

export const CustomWidgets: Story = {
  render: () => {
    useStatusBarStore.getState().setWidgets([
      { id: '1', label: 'Left Widget', icon: Info, alignment: 'left' },
      { id: '2', label: 'Center Widget', alignment: 'center' },
      { id: '3', label: 'Right Widget', icon: Check, alignment: 'right', className: 'text-green-500' },
    ]);
    return (
      <div className="theme-light">
        <StatusBar />
      </div>
    );
  },
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
