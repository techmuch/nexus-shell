import { ThemeSwitcher, type ThemeSwitcherProps } from '../components/widgets/ThemeSwitcher';
import { useThemeStore, type ThemeType } from '../core/services/ThemeService';

export type ConnectedThemeSwitcherProps = Omit<
  ThemeSwitcherProps<ThemeType>,
  'value' | 'onChange'
>;

/**
 * {@link ThemeSwitcher} bound to `useThemeStore`.
 *
 * Selecting a theme writes it to the store, which applies the matching
 * `theme-*` class to `<html>` and persists the choice to `localStorage`.
 * Offers every theme in `useThemeStore().themes` — including those added with
 * `registerTheme` — unless `options` is passed.
 */
export const ConnectedThemeSwitcher = (props: ConnectedThemeSwitcherProps) => {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const themes = useThemeStore((s) => s.themes);
  // Bundled and registered themes alike, unless the caller chose a set.
  const options = props.options ?? themes.map((t) => ({ id: t.id, label: t.shortLabel }));

  return <ThemeSwitcher<ThemeType> {...props} options={options} value={theme} onChange={setTheme} />;
};
