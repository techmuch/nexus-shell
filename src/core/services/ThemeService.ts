import { useMemo } from 'react';
import { create } from 'zustand';
import {
  BUNDLED_THEMES,
  BUNDLED_THEME_CLASSES,
  themeClass,
  type BundledThemeId,
  type IBundledTheme,
} from '../../lib/themes';
import { readStored, writeStored, STORAGE_KEYS } from '../../lib/storage';
import { commandRegistry } from '../registry/CommandRegistry';

/**
 * A theme id.
 *
 * The bundled ids are suggested by autocomplete, but any string is accepted:
 * define a `.theme-yourname` block with the same custom properties and it works
 * exactly like the built-ins. Call {@link registerTheme} so pickers, commands
 * and `scheme` know about it.
 */
export type ThemeType = BundledThemeId | (string & {});

/** A theme the shell knows about: bundled, or added with {@link registerTheme}. */
export interface IThemeInfo {
  id: string;
  label: string;
  shortLabel: string;
  description?: string;
  scheme: 'light' | 'dark';
}

interface ThemeState {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  /** Every known theme, bundled first then registered, for building pickers. */
  themes: IThemeInfo[];
  /** The current theme's `scheme`; `'light'` for an unregistered id. */
  scheme: 'light' | 'dark';
}

const STORAGE_KEY = STORAGE_KEYS.theme;

const schemeOf = (id: string, themes: IThemeInfo[]): 'light' | 'dark' =>
  themes.find((t) => t.id === id)?.scheme ?? 'light';

/**
 * Swap the theme class on `<html>`.
 *
 * Every bundled class is removed before the new one is added, plus any class
 * matching `theme-*`, so an app's own themes are cleaned up too. The class goes
 * on the document element rather than a wrapper so portalled UI — modals,
 * context menus, the command palette — inherits it as well. `color-scheme` is
 * set too, so native controls and scrollbars match.
 */
const applyTheme = (theme: ThemeType, scheme: 'light' | 'dark') => {
  // No document during SSR or in a DOM-less test; the class is applied on the
  // first `setTheme` in a real browser instead.
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  const stale = [
    ...BUNDLED_THEME_CLASSES,
    ...Array.from(root.classList).filter((c) => c.startsWith('theme-')),
  ];
  root.classList.remove(...stale);
  root.classList.add(themeClass(theme));
  root.style.colorScheme = scheme;
};

const BUNDLED_INFO: IThemeInfo[] = (BUNDLED_THEMES as readonly IBundledTheme[]).map((t) => ({ ...t }));

export const useThemeStore = create<ThemeState>((set, get) => {
  const savedTheme = readStored(STORAGE_KEY) as ThemeType | null;
  const initialTheme = savedTheme || 'light';
  const scheme = schemeOf(initialTheme, BUNDLED_INFO);

  applyTheme(initialTheme, scheme);

  return {
    theme: initialTheme,
    themes: BUNDLED_INFO,
    scheme,
    setTheme: (theme) => {
      writeStored(STORAGE_KEY, theme);
      const next = schemeOf(theme, get().themes);
      applyTheme(theme, next);
      set({ theme, scheme: next });
    },
  };
});

/**
 * Tell the shell about an application theme — a `.theme-<id>` block in your
 * own CSS defining the same custom properties as the bundled ones.
 *
 * Registered themes appear in `useThemeStore().themes` (and so in pickers
 * built from it, including `ConnectedThemeSwitcher`), report their `scheme`,
 * and get a `theme.<id>` command. Registering
 * an id again replaces it.
 */
export const registerTheme = (definition: Omit<IThemeInfo, 'shortLabel'> & { shortLabel?: string }): void => {
  const info: IThemeInfo = { shortLabel: definition.label, ...definition };
  useThemeStore.setState((state) => {
    const themes = [...state.themes.filter((t) => t.id !== info.id), info];
    return { themes, scheme: schemeOf(state.theme, themes) };
  });
  commandRegistry.registerCommand({
    id: `theme.${info.id}`,
    label: `Preferences: ${info.label} Theme`,
    execute: () => useThemeStore.getState().setTheme(info.id),
  });
  const { theme, scheme } = useThemeStore.getState();
  if (theme === info.id) applyTheme(theme, scheme);
};

/**
 * The current theme's colour tokens, resolved to CSS colour strings.
 *
 * For code that draws outside CSS's reach — chart libraries, canvas, WebGL —
 * and so cannot write `hsl(var(--muted))`. Values are `hsl(...)` strings read
 * from the document's computed style, so they include an app's own overrides.
 */
export interface ThemeTokens {
  scheme: 'light' | 'dark';
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
}

const TOKEN_NAMES: Record<Exclude<keyof ThemeTokens, 'scheme'>, string> = {
  background: '--background',
  foreground: '--foreground',
  card: '--card',
  cardForeground: '--card-foreground',
  popover: '--popover',
  popoverForeground: '--popover-foreground',
  primary: '--primary',
  primaryForeground: '--primary-foreground',
  secondary: '--secondary',
  secondaryForeground: '--secondary-foreground',
  muted: '--muted',
  mutedForeground: '--muted-foreground',
  accent: '--accent',
  accentForeground: '--accent-foreground',
  destructive: '--destructive',
  destructiveForeground: '--destructive-foreground',
  border: '--border',
  input: '--input',
  ring: '--ring',
};

/**
 * Read the current theme's tokens. Outside React, or to re-read after
 * changing tokens yourself. Empty strings when there is no document.
 */
export const getThemeTokens = (): ThemeTokens => {
  const scheme = useThemeStore.getState().scheme;
  const style =
    typeof document !== 'undefined' && typeof getComputedStyle === 'function'
      ? getComputedStyle(document.documentElement)
      : null;
  const tokens = { scheme } as ThemeTokens;
  for (const [key, name] of Object.entries(TOKEN_NAMES)) {
    const raw = style?.getPropertyValue(name).trim() ?? '';
    (tokens as unknown as Record<string, string>)[key] = raw ? `hsl(${raw})` : '';
  }
  return tokens;
};

/**
 * {@link getThemeTokens} as a hook: re-reads, and re-renders, when the theme
 * changes.
 *
 * @example
 * ```tsx
 * const t = useThemeTokens();
 * <ResponsiveCalendar emptyColor={t.muted} theme={{ text: { fill: t.mutedForeground } }} />
 * ```
 */
export const useThemeTokens = (): ThemeTokens => {
  const theme = useThemeStore((s) => s.theme);
  const scheme = useThemeStore((s) => s.scheme);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => getThemeTokens(), [theme, scheme]);
};
