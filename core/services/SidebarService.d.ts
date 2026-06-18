import { LucideIcon } from 'lucide-react';

export interface ISidebarPanel {
    id: string;
    label: string;
    icon: LucideIcon;
    component: React.ComponentType<any> | React.ReactNode;
}
interface SidebarState {
    activeSidebar: string | null;
    panels: ISidebarPanel[];
    setActiveSidebar: (id: string | null) => void;
    toggleSidebar: (id: string) => void;
    setPanels: (panels: ISidebarPanel[]) => void;
}
export declare const useSidebarStore: import('zustand').UseBoundStore<import('zustand').StoreApi<SidebarState>>;
export {};
