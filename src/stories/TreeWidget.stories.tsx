import type { Meta, StoryObj } from '@storybook/react';
import { TreeWidget, ITreeNode } from '../components/widgets/TreeWidget';

const meta: Meta<typeof TreeWidget> = {
  title: 'Widgets/TreeWidget',
  component: TreeWidget,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof TreeWidget>;

const sampleData: ITreeNode[] = [
  {
    id: 'root',
    label: 'Nexus Shell',
    type: 'folder',
    isOpen: true,
    children: [
      { id: '1', label: 'App.tsx', type: 'file' },
      { id: '2', label: 'main.tsx', type: 'file' },
      { id: '3', label: 'styles', type: 'folder', children: [
          { id: '4', label: 'index.css', type: 'file' }
      ]},
    ]
  }
];

export const Light: Story = {
  render: () => (
    <div className="theme-light w-64 h-96 border bg-background text-foreground">
      <TreeWidget data={sampleData} />
    </div>
  ),
};

export const Dark: Story = {
  render: () => (
    <div className="theme-dark w-64 h-96 border bg-background text-foreground">
      <TreeWidget data={sampleData} />
    </div>
  ),
};
