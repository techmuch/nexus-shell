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
    onNewFile?: (parentId: string | null) => void;
    onNewFolder?: (parentId: string | null) => void;
    onNewDialogueMap?: (parentId: string | null) => void;
    onRename?: (nodeId: string) => void;
    onDelete?: (nodeId: string) => void;
    onDoubleClick?: (node: ITreeNode) => void;
}
export declare const TreeWidget: React.FC<TreeWidgetProps>;
