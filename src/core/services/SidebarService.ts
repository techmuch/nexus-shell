import { create } from 'zustand'
import { LucideIcon } from 'lucide-react'

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

const STORAGE_KEY = 'nexus-shell-sidebar';

export const useSidebarStore = create<SidebarState>((set) => {
  const savedSidebar = localStorage.getItem(STORAGE_KEY);
  const initialSidebar = savedSidebar !== null ? savedSidebar : null;

  return {
    activeSidebar: initialSidebar,
    panels: [],
    setActiveSidebar: (id) => {
      if (id === null) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, id);
      }
      set({ activeSidebar: id });
    },
    toggleSidebar: (id) => set((state) => {
      const nextId = state.activeSidebar === id ? null : id;
      if (nextId === null) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, nextId);
      }
      return { activeSidebar: nextId };
    }),
    setPanels: (panels) => set({ panels }),
  };
})
