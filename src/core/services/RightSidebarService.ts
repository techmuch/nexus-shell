import { create } from 'zustand'

interface RightSidebarState {
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  toggleChat: () => void;
}

export const useRightSidebarStore = create<RightSidebarState>((set) => ({
  isChatOpen: false, // Default closed
  setChatOpen: (open) => set({ isChatOpen: open }),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
}))
