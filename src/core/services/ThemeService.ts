import { create } from 'zustand';
import {
  BUNDLED_THEME_CLASSES,
  themeClass,
  type BundledThemeId,
} from '../../lib/themes';

/**
 * A theme id.
 *
 * The bundled ids are suggested by autocomplete, but any string is accepted:
 * define a `.theme-yourname` block with the same custom properties and it works
 * exactly like the built-ins.
 */
export type ThemeType = BundledThemeId | (string & {});

interface ThemeState {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const STORAGE_KEY = 'nexus-shell-theme';

/**
 * Swap the theme class on `<html>`.
 *
 * Every bundled class is removed before the new one is added, plus any class
 * matching `theme-*`, so an app's own themes are cleaned up too. The class goes
 * on the document element rather than a wrapper so portalled UI — modals,
 * context menus, the command palette — inherits it as well.
 */
const applyTheme = (theme: ThemeType) => {
  const root = window.document.documentElement;

  const stale = [
    ...BUNDLED_THEME_CLASSES,
    ...Array.from(root.classList).filter((c) => c.startsWith('theme-')),
  ];
  root.classList.remove(...stale);
  root.classList.add(themeClass(theme));
};

export const useThemeStore = create<ThemeState>((set) => {
  const savedTheme = localStorage.getItem(STORAGE_KEY) as ThemeType | null;
  const initialTheme = savedTheme || 'light';

  applyTheme(initialTheme);

  return {
    theme: initialTheme,
    setTheme: (theme) => {
      localStorage.setItem(STORAGE_KEY, theme);
      applyTheme(theme);
      set({ theme });
    },
  };
});
