import { create } from 'zustand';

interface CommandPaletteState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

/**
 * Whether the command palette is showing.
 *
 * A store rather than component state so the palette opens through an
 * ordinary command — `shell.commandPalette`, bound to `Mod+Shift+P` — which
 * makes its shortcut rebindable and lets a menu item or button open it too.
 */
export const useCommandPaletteStore = create<CommandPaletteState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
}));

/** Id of the command that toggles the palette. */
export const COMMAND_PALETTE_COMMAND_ID = 'shell.commandPalette';
