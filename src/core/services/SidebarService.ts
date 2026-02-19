import { create } from 'zustand'

export type SidebarType = 'files' | 'search' | 'git' | 'plugins' | 'settings' | null;

interface SidebarState {
  activeSidebar: SidebarType;
  setActiveSidebar: (type: SidebarType) => void;
  toggleSidebar: (type: SidebarType) => void;
}

const STORAGE_KEY = 'nexus-shell-sidebar';

export const useSidebarStore = create<SidebarState>((set) => {
  const savedSidebar = localStorage.getItem(STORAGE_KEY) as SidebarType;
  const initialSidebar = savedSidebar !== null ? savedSidebar : 'files';

  return {
    activeSidebar: initialSidebar,
    setActiveSidebar: (type) => {
      if (type === null) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, type);
      }
      set({ activeSidebar: type });
    },
    toggleSidebar: (type) => set((state) => {
      const nextType = state.activeSidebar === type ? null : type;
      if (nextType === null) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, nextType);
      }
      return { activeSidebar: nextType };
    }),
  };
})
