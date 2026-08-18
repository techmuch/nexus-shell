import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { LucideIcon } from 'lucide-react';
import type { PaneSide } from '../../components/widgets/SidebarPane';

/**
 * The shell's docked panes, one store per edge.
 *
 * Every edge behaves identically — a registry of panels, one of which is open,
 * remembered across reloads — so they share an implementation rather than
 * drifting into three. Which edge a panel belongs to is data on the panel, not
 * a separate API per side.
 */

/** Ids the shell's own panels use by default. */
export const CHAT_PANEL_ID = 'chat';
export const TERMINAL_PANEL_ID = 'terminal';
export const SETTINGS_PANEL_ID = 'settings';

export interface IPanel {
  id: string;
  label: string;
  icon: LucideIcon;
  component: React.ComponentType<any> | React.ReactNode;
  /**
   * Which edge the panel docks to. Defaults to `"left"`.
   *
   * This is the whole placement API: move a panel by changing this, not by
   * registering it somewhere else.
   */
  side?: PaneSide;
  /**
   * Where the panel's icon sits on its rail. `"end"` pins it to the far group —
   * conventionally settings and account. Defaults to `"start"`.
   */
  align?: 'start' | 'end';
}

export interface PaneState {
  /** Id of the open panel, or `null` when the pane is collapsed. */
  activePanel: string | null;
  panels: IPanel[];
  setActivePanel: (id: string | null) => void;
  /** Open the panel, or close it if it is already open. */
  togglePanel: (id: string) => void;
  setPanels: (panels: IPanel[]) => void;
}

export type PaneStore = UseBoundStore<StoreApi<PaneState>>;

/**
 * A pane store bound to one storage key.
 *
 * Exported so an application with a docked region the shell doesn't provide
 * gets the same behaviour without reimplementing it.
 */
export const createPaneStore = (storageKey: string): PaneStore =>
  create<PaneState>((set) => {
    // Read at creation, so a restored pane is open on first paint rather than
    // flashing closed and then opening.
    const remember = (id: string | null) => {
      if (id === null) localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, id);
      return id;
    };

    return {
      activePanel: localStorage.getItem(storageKey),
      panels: [],

      setActivePanel: (id) => set({ activePanel: remember(id) }),

      togglePanel: (id) =>
        set((state) => ({
          activePanel: remember(state.activePanel === id ? null : id),
        })),

      setPanels: (panels) => set({ panels }),
    };
  });

export const useLeftPaneStore = createPaneStore('nexus-shell-pane-left');
export const useRightPaneStore = createPaneStore('nexus-shell-pane-right');
export const useBottomPaneStore = createPaneStore('nexus-shell-pane-bottom');

const STORES: Record<PaneSide, PaneStore> = {
  left: useLeftPaneStore,
  right: useRightPaneStore,
  bottom: useBottomPaneStore,
};

/** The store for one edge. */
export const paneStore = (side: PaneSide): PaneStore => STORES[side];

/** Every pane store, for code that has to look across all of them. */
export const PANE_SIDES: PaneSide[] = ['left', 'right', 'bottom'];

/**
 * Register panels across every edge at once.
 *
 * Panels arrive as one list and are routed by their `side`, so a caller never
 * has to know there are three stores. Each edge is set rather than appended,
 * matching how the rest of the shell's configuration behaves.
 */
export const setPanels = (panels: IPanel[]): void => {
  PANE_SIDES.forEach((side) => {
    paneStore(side)
      .getState()
      .setPanels(panels.filter((panel) => (panel.side ?? 'left') === side));
  });
};
