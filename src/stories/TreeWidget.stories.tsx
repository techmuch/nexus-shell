import type { Meta, StoryObj } from '@storybook/react';
import { TreeWidget, ITreeNode } from '../components/widgets/TreeWidget';
import { useState } from 'react';

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

export const Interactive: Story = {
  render: () => {
    const [treeData, setTreeData] = useState<ITreeNode[]>(sampleData);

    const handleMoveNode = (draggedId: string, targetId: string) => {
      console.log(`Moving ${draggedId} to ${targetId}`);
      
      const newData = [...treeData];
      let draggedNode: ITreeNode | null = null;

      // Recursive remove
      const removeNode = (items: ITreeNode[]): ITreeNode[] => {
        return items.filter(item => {
          if (item.id === draggedId) {
            draggedNode = item;
            return false;
          }
          if (item.children) {
            item.children = removeNode(item.children);
          }
          return true;
        });
      };

      // Recursive add
      const addNode = (items: ITreeNode[]): ITreeNode[] => {
        return items.map(item => {
          if (item.id === targetId && draggedNode) {
            return {
              ...item,
              isOpen: true,
              children: [...(item.children || []), draggedNode]
            };
          }
          if (item.children) {
            return { ...item, children: addNode(item.children) };
          }
          return item;
        });
      };

      const removed = removeNode(newData);
      if (draggedNode) {
        setTreeData(addNode(removed));
      }
    };

    return (
      <div className="theme-light w-64 h-96 border bg-background text-foreground">
        <TreeWidget data={treeData} onMoveNode={handleMoveNode} />
      </div>
    );
  }
};
