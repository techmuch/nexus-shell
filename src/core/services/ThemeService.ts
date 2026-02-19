import { create } from 'zustand'

export type ThemeType = 'light' | 'dark' | 'gt';

interface ThemeState {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const STORAGE_KEY = 'nexus-shell-theme';

// Helper to apply the theme class to the document
const applyTheme = (theme: ThemeType) => {
  const root = window.document.documentElement;
  root.classList.remove('theme-light', 'theme-dark', 'theme-gt');
  root.classList.add(`theme-${theme}`);
};

export const useThemeStore = create<ThemeState>((set) => {
  const savedTheme = localStorage.getItem(STORAGE_KEY) as ThemeType;
  const initialTheme = savedTheme || 'light';
  
  // Apply initially
  applyTheme(initialTheme);

  return {
    theme: initialTheme,
    setTheme: (theme) => {
      localStorage.setItem(STORAGE_KEY, theme);
      applyTheme(theme);
      set({ theme });
    },
  }
})
