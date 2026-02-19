import { create } from 'zustand'

interface TerminalState {
  isOpen: boolean;
  history: string[];
  setOpen: (open: boolean) => void;
  toggle: () => void;
  addHistory: (line: string) => void;
  clearHistory: () => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  isOpen: false,
  history: ['Welcome to Nexus Shell Terminal v0.1.0', 'Type "help" for a list of commands.'],
  setOpen: (open) => set({ isOpen: open }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  addHistory: (line) => set((state) => ({ history: [...state.history, line] })),
  clearHistory: () => set({ history: [] }),
}))
