import React, { useState, useEffect } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { ChevronRight, ChevronDown, File, Folder, Plus, FolderPlus, Edit, Trash2, Map } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ContextMenu, IContextMenuItem } from './ContextMenu';

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

export interface TreeWidgetProps {
  data: ITreeNode[];
  onMoveNode?: (draggedId: string, targetId: string) => void;
  onNewFile?: (parentId: string | null) => void;
  onNewFolder?: (parentId: string | null) => void;
  onNewDialogueMap?: (parentId: string | null) => void;
  onRename?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
  onDoubleClick?: (node: ITreeNode) => void;
}

export const TreeWidget: React.FC<TreeWidgetProps> = ({ 
  data, 
  onMoveNode,
  onNewFile,
  onNewFolder,
  onNewDialogueMap,
  onRename,
  onDelete,
  onDoubleClick
}) => {
  const [nodes, setNodes] = useState<ITreeNode[]>(flatten(data));
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, nodeId: string | null, type: 'file' | 'folder' | 'root' } | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    setNodes(flatten(data));
  }, [data]);

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

    setNodes(flatten(updateNodes(data)));
  };

  const handleDragStart = (e: React.DragEvent, nodeId: string) => {
    e.dataTransfer.setData('text/plain', nodeId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, nodeId: string, type: 'file' | 'folder') => {
    e.preventDefault();
    if (type === 'folder') {
      setDragOverId(nodeId);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string, type: 'file' | 'folder') => {
    e.preventDefault();
    setDragOverId(null);
    const draggedId = e.dataTransfer.getData('text/plain');
    
    if (draggedId && draggedId !== targetId && type === 'folder' && onMoveNode) {
      onMoveNode(draggedId, targetId);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, node: ITreeNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id, type: node.type });
  };

  const handleBackgroundContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId: null, type: 'root' });
  };

  const contextMenuItems: IContextMenuItem[] = [
    { 
      label: 'New File', 
      icon: <Plus size={14} />, 
      onClick: () => contextMenu && onNewFile?.(contextMenu.nodeId as any) 
    },
    { 
      label: 'New Folder', 
      icon: <FolderPlus size={14} />, 
      onClick: () => contextMenu && onNewFolder?.(contextMenu.nodeId as any) 
    },
    { 
      label: 'New Dialogue Map', 
      icon: <Map size={14} />, 
      onClick: () => contextMenu && onNewDialogueMap?.(contextMenu.nodeId as any) 
    },
    ...(contextMenu?.type !== 'root' ? [
      { 
        label: 'Rename', 
        icon: <Edit size={14} />, 
        divider: true, 
        onClick: () => contextMenu && contextMenu.nodeId && onRename?.(contextMenu.nodeId) 
      },
      { 
        label: 'Delete', 
        icon: <Trash2 size={14} className="text-destructive" />, 
        onClick: () => contextMenu && contextMenu.nodeId && onDelete?.(contextMenu.nodeId) 
      }
    ] : [])
  ];

  return (
    <div className="h-full w-full bg-muted/30" onContextMenu={handleBackgroundContextMenu}>
      <Virtuoso
        style={{ height: '100%' }}
        totalCount={nodes.length}
        itemContent={(index) => {
          const node = nodes[index];
          return (
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, node.id)}
              onDragOver={(e) => handleDragOver(e, node.id, node.type)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, node.id, node.type)}
              className={cn(
                "flex items-center py-1 px-2 cursor-pointer hover:bg-accent hover:text-accent-foreground select-none text-xs",
                "transition-colors duration-150 relative",
                dragOverId === node.id && "bg-primary/20 ring-1 ring-primary/50 rounded-sm"
              )}
              style={{ paddingLeft: `${(node.level || 0) * 12 + 8}px` }}
              onClick={() => node.type === 'folder' && toggleNode(node.id)}
              onDoubleClick={() => onDoubleClick?.(node)}
              onContextMenu={(e) => handleContextMenu(e, node)}
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
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
