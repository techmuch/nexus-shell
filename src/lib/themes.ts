/**
 * The themes bundled in the library's stylesheet.
 *
 * This is the single source of truth. `ThemeService` derives its union type and
 * its class-swapping from it, `ThemeSwitcher` and `SettingsPanel` derive their
 * default options, `initializeShell` derives its theme commands and View menu,
 * and Storybook derives its toolbar. Adding a theme is a block in `index.css`
 * plus one entry here.
 *
 * It lives in `lib/` rather than `core/services/` because the presentational
 * components need it, and they are forbidden from importing stores.
 *
 * Themes are not a closed set — see {@link ThemeSwitcher}'s `options` prop and
 * {@link SettingsPanel}'s `themes` prop for supplying your own.
 */
export interface IBundledTheme {
  /** Matches the `.theme-<id>` class in the stylesheet. */
  id: string;
  /** Full name, for menus and the settings panel. */
  label: string;
  /** Abbreviated name, for the compact segmented switcher. */
  shortLabel: string;
  /** One line on what the theme is, used in documentation. */
  description: string;
}

export const BUNDLED_THEMES = [
  {
    id: 'light',
    label: 'Light',
    shortLabel: 'Light',
    description: 'Neutral light theme. The default.',
  },
  {
    id: 'dark',
    label: 'Dark',
    shortLabel: 'Dark',
    description: 'Low-glare dark theme on a soft grey base.',
  },
  {
    id: 'gt',
    label: 'Georgia Tech',
    shortLabel: 'GT',
    description: 'Buzz Gold (#EAAA00) on Tech Tower White.',
  },
  {
    id: 'tamu',
    label: 'Texas A&M',
    shortLabel: 'TAMU',
    description: 'Aggie Maroon (#500000) on white.',
  },
] as const satisfies readonly IBundledTheme[];

/** Ids of the themes that ship in the stylesheet. */
export type BundledThemeId = (typeof BUNDLED_THEMES)[number]['id'];

/** Every bundled theme's class name, e.g. `["theme-light", …]`. */
export const BUNDLED_THEME_CLASSES = BUNDLED_THEMES.map((t) => `theme-${t.id}`);

/**
 * The class name for a theme id.
 *
 * Accepts any string, not just a bundled id, so an app that defines its own
 * `.theme-*` block can use it too.
 */
export const themeClass = (id: string): string => `theme-${id}`;
