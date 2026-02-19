import { create } from 'zustand'
import { LucideIcon } from 'lucide-react'

export interface IStatusBarWidget {
  id: string;
  label: string;
  icon?: LucideIcon;
  alignment: 'left' | 'center' | 'right';
  commandId?: string;
  onClick?: () => void;
  className?: string;
  priority?: number; // Higher priority items appear first in their section
}

interface StatusBarState {
  widgets: IStatusBarWidget[];
  setWidgets: (widgets: IStatusBarWidget[]) => void;
  addWidget: (widget: IStatusBarWidget) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<IStatusBarWidget>) => void;
}

export const useStatusBarStore = create<StatusBarState>((set) => ({
  widgets: [],
  setWidgets: (widgets) => set({ widgets }),
  addWidget: (widget) => set((state) => ({
    widgets: [...state.widgets, widget].sort((a, b) => (b.priority || 0) - (a.priority || 0))
  })),
  removeWidget: (id) => set((state) => ({
    widgets: state.widgets.filter(w => w.id !== id)
  })),
  updateWidget: (id, updates) => set((state) => ({
    widgets: state.widgets.map(w => w.id === id ? { ...w, ...updates } : w)
  })),
}))
