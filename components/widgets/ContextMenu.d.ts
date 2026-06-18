import { default as React } from '../../../node_modules/react';

export interface IContextMenuItem {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    divider?: boolean;
}
interface ContextMenuProps {
    x: number;
    y: number;
    items: IContextMenuItem[];
    onClose: () => void;
}
export declare const ContextMenu: React.FC<ContextMenuProps>;
export {};
