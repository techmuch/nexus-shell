import { create } from 'zustand';
import type { IStatusBarWidget } from '../../components/widgets/StatusBar';

/**
 * A status bar item as held in the shell store. Extends the presentational
 * {@link IStatusBarWidget} with `commandId`, which the connected wrapper
 * resolves against the {@link commandRegistry} at click time.
 */
export interface IStatusBarWidgetConfig extends IStatusBarWidget {
  /** Command to execute on click. Ignored if `onClick` is also provided. */
  commandId?: string;
}

interface StatusBarState {
  widgets: IStatusBarWidgetConfig[];
  setWidgets: (widgets: IStatusBarWidgetConfig[]) => void;
  addWidget: (widget: IStatusBarWidgetConfig) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<IStatusBarWidgetConfig>) => void;
}

/**
 * Shell-level store holding the status bar's items. Consumed by
 * `ConnectedStatusBar`; the presentational `StatusBar` does not read it.
 */
export const useStatusBarStore = create<StatusBarState>((set) => ({
  widgets: [],
  setWidgets: (widgets) => set({ widgets }),
  addWidget: (widget) =>
    set((state) => ({
      widgets: [...state.widgets, widget].sort(
        (a, b) => (b.priority || 0) - (a.priority || 0),
      ),
    })),
  removeWidget: (id) =>
    set((state) => ({
      widgets: state.widgets.filter((w) => w.id !== id),
    })),
  updateWidget: (id, updates) =>
    set((state) => ({
      widgets: state.widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    })),
}));

export type { IStatusBarWidget };
