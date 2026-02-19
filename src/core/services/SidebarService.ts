import { create } from 'zustand'

export type SidebarType = 'files' | 'search' | 'git' | 'plugins' | 'settings' | null;

interface SidebarState {
  activeSidebar: SidebarType;
  setActiveSidebar: (type: SidebarType) => void;
  toggleSidebar: (type: SidebarType) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  activeSidebar: 'files', // Default to files
  setActiveSidebar: (type) => set({ activeSidebar: type }),
  toggleSidebar: (type) => set((state) => ({
    activeSidebar: state.activeSidebar === type ? null : type
  })),
}))
