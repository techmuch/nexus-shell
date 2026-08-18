import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { LucideIcon } from 'lucide-react';

/**
 * The docked side panels, one store per edge of the shell.
 *
 * Both edges behave identically — a registry of panels, one of which is active,
 * remembered across reloads — so they share an implementation rather than two
 * that drift.
 */

/**
 * Ids the shell's own panels use by default.
 *
 * Declared here rather than beside the descriptors so `core` can resolve them
 * without depending on `connected` — the dependency runs the other way.
 */
export const CHAT_PANEL_ID = 'chat';
export const TERMINAL_PANEL_ID = 'terminal';

export interface ISidebarPanel {
  id: string;
  label: string;
  icon: LucideIcon;
  component: React.ComponentType<any> | React.ReactNode;
}

export interface SidebarState {
  /** Id of the open panel, or `null` when the pane is collapsed. */
  activeSidebar: string | null;
  panels: ISidebarPanel[];
  setActiveSidebar: (id: string | null) => void;
  /** Open the panel, or close it if it is already open. */
  toggleSidebar: (id: string) => void;
  setPanels: (panels: ISidebarPanel[]) => void;
}

export type SidebarStore = UseBoundStore<StoreApi<SidebarState>>;

/**
 * A panel store bound to one storage key.
 *
 * Exported so an application with a third docked region — a bottom drawer, say
 * — gets the same behaviour without copying it.
 */
export const createSidebarStore = (storageKey: string): SidebarStore =>
  create<SidebarState>((set) => {
    // Reading at creation time means the pane is open on first paint rather
    // than flashing closed and then opening.
    const remember = (id: string | null) => {
      if (id === null) localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, id);
      return id;
    };

    return {
      activeSidebar: localStorage.getItem(storageKey),
      panels: [],

      setActiveSidebar: (id) => set({ activeSidebar: remember(id) }),

      toggleSidebar: (id) =>
        set((state) => ({
          activeSidebar: remember(state.activeSidebar === id ? null : id),
        })),

      setPanels: (panels) => set({ panels }),
    };
  });

/** The left-hand pane, beside the activity bar. */
export const useSidebarStore = createSidebarStore('nexus-shell-sidebar');

/**
 * The right-hand pane: inspectors, properties, chat transcripts — anything
 * about the current selection rather than about navigation.
 */
export const useInspectorStore = createSidebarStore('nexus-shell-inspector');
