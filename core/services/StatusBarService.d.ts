import { LucideIcon } from 'lucide-react';

export interface IStatusBarWidget {
    id: string;
    label: string;
    icon?: LucideIcon;
    alignment: 'left' | 'center' | 'right';
    commandId?: string;
    onClick?: () => void;
    className?: string;
    priority?: number;
}
interface StatusBarState {
    widgets: IStatusBarWidget[];
    setWidgets: (widgets: IStatusBarWidget[]) => void;
    addWidget: (widget: IStatusBarWidget) => void;
    removeWidget: (id: string) => void;
    updateWidget: (id: string, updates: Partial<IStatusBarWidget>) => void;
}
export declare const useStatusBarStore: import('zustand').UseBoundStore<import('zustand').StoreApi<StatusBarState>>;
export {};
