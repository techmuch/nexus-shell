import { create } from 'zustand';

/**
 * The terminal's scrollback.
 *
 * Visibility used to live here too, back when the terminal had exactly one
 * place it could be. It is now registered like any other panel, so whatever
 * hosts it owns whether it is showing — see `terminalPanel()` and
 * `togglePanel()`.
 */
interface TerminalState {
  history: string[];
  addHistory: (line: string) => void;
  clearHistory: () => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  history: [
    'Welcome to Nexus Shell Terminal v0.1.0',
    'Type "help" for a list of commands.',
  ],
  addHistory: (line) => set((state) => ({ history: [...state.history, line] })),
  clearHistory: () => set({ history: [] }),
}));
