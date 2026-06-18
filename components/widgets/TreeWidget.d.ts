import { default as React } from '../../../node_modules/react';

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
    onNewFile?: (parentId: string) => void;
    onNewFolder?: (parentId: string) => void;
    onRename?: (nodeId: string) => void;
    onDelete?: (nodeId: string) => void;
}
export declare const TreeWidget: React.FC<TreeWidgetProps>;
