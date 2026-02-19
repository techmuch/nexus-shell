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
      let draggedNode: ITreeNode | null = null;

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

      const cleaned = removeNode([...treeData]);
      if (draggedNode) {
        setTreeData(addNode(cleaned));
      }
    };

    const handleNewItem = (parentId: string, type: 'file' | 'folder') => {
      const name = window.prompt(`Enter ${type} name:`);
      if (!name) return;

      const newItem: ITreeNode = {
        id: Math.random().toString(36).substr(2, 9),
        label: name,
        type,
        isOpen: type === 'folder',
        children: type === 'folder' ? [] : undefined
      };

      const addRecursive = (items: ITreeNode[]): ITreeNode[] => {
        return items.map(item => {
          if (item.id === parentId) {
            return {
              ...item,
              isOpen: true,
              children: [...(item.children || []), newItem]
            };
          }
          if (item.children) {
            return { ...item, children: addRecursive(item.children) };
          }
          return item;
        });
      };

      setTreeData(addRecursive([...treeData]));
    };

    const handleRename = (nodeId: string) => {
      const newName = window.prompt('Enter new name:');
      if (!newName) return;

      const renameRecursive = (items: ITreeNode[]): ITreeNode[] => {
        return items.map(item => {
          if (item.id === nodeId) {
            return { ...item, label: newName };
          }
          if (item.children) {
            return { ...item, children: renameRecursive(item.children) };
          }
          return item;
        });
      };

      setTreeData(renameRecursive([...treeData]));
    };

    const handleDelete = (nodeId: string) => {
      if (!window.confirm('Are you sure you want to delete this item?')) return;

      const deleteRecursive = (items: ITreeNode[]): ITreeNode[] => {
        return items.filter(item => {
          if (item.id === nodeId) return false;
          if (item.children) {
            item.children = deleteRecursive(item.children);
          }
          return true;
        });
      };

      setTreeData(deleteRecursive([...treeData]));
    };

    return (
      <div className="theme-light w-80 h-96 border bg-background text-foreground shadow-lg rounded-lg overflow-hidden">
        <div className="p-2 bg-muted border-b text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Interactive Explorer
        </div>
        <TreeWidget 
          data={treeData} 
          onMoveNode={handleMoveNode}
          onNewFile={(id) => handleNewItem(id, 'file')}
          onNewFolder={(id) => handleNewItem(id, 'folder')}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      </div>
    );
  }
};
