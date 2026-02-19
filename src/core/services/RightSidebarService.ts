import { create } from 'zustand'

interface RightSidebarState {
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  toggleChat: () => void;
}

const STORAGE_KEY = 'nexus-shell-right-sidebar';

export const useRightSidebarStore = create<RightSidebarState>((set) => {
  const savedChatState = localStorage.getItem(STORAGE_KEY);
  const initialChatOpen = savedChatState === 'true';

  return {
    isChatOpen: initialChatOpen,
    setChatOpen: (open) => {
      localStorage.setItem(STORAGE_KEY, String(open));
      set({ isChatOpen: open });
    },
    toggleChat: () => set((state) => {
      const nextOpen = !state.isChatOpen;
      localStorage.setItem(STORAGE_KEY, String(nextOpen));
      return { isChatOpen: nextOpen };
    }),
  };
})
