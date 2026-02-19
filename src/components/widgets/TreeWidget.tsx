import React, { useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ITreeNode {
  id: string;
  label: string;
  type: 'file' | 'folder';
  children?: ITreeNode[];
  isOpen?: boolean;
  level?: number;
}

interface TreeWidgetProps {
  data: ITreeNode[];
}

export const TreeWidget: React.FC<TreeWidgetProps> = ({ data }) => {
  const [nodes, setNodes] = useState<ITreeNode[]>(flatten(data));

  function flatten(items: ITreeNode[], level = 0): ITreeNode[] {
    return items.reduce<ITreeNode[]>((acc, item) => {
      const node = { ...item, level };
      acc.push(node);
      if (node.isOpen && node.children) {
        acc.push(...flatten(node.children, level + 1));
      }
      return acc;
    }, []);
  }

  const toggleNode = (nodeId: string) => {
    const updateNodes = (items: ITreeNode[]): ITreeNode[] => {
      return items.map((item) => {
        if (item.id === nodeId) {
          return { ...item, isOpen: !item.isOpen };
        }
        if (item.children) {
          return { ...item, children: updateNodes(item.children) };
        }
        return item;
      });
    };

    const newData = updateNodes(data);
    // In a real app, 'data' would be managed in a store.
    // For this prototype, we'll just recalculate.
    setNodes(flatten(newData));
  };

  return (
    <div className="h-full w-full bg-muted/30">
      <Virtuoso
        style={{ height: '100%' }}
        totalCount={nodes.length}
        itemContent={(index) => {
          const node = nodes[index];
          return (
            <div
              className={cn(
                "flex items-center py-1 px-2 cursor-pointer hover:bg-accent hover:text-accent-foreground select-none text-xs",
                "transition-colors duration-150"
              )}
              style={{ paddingLeft: `${(node.level || 0) * 12 + 8}px` }}
              onClick={() => node.type === 'folder' && toggleNode(node.id)}
            >
              <div className="w-4 h-4 mr-1 flex items-center justify-center">
                {node.type === 'folder' ? (
                  node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                ) : null}
              </div>
              <div className="mr-2">
                {node.type === 'folder' ? (
                  <Folder size={14} className="text-blue-400 fill-blue-400/20" />
                ) : (
                  <File size={14} className="text-muted-foreground" />
                )}
              </div>
              <span className="truncate">{node.label}</span>
            </div>
          );
        }}
      />
    </div>
  );
};
