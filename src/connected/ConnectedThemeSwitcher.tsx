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
 */
export const ConnectedThemeSwitcher = (props: ConnectedThemeSwitcherProps) => {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return <ThemeSwitcher<ThemeType> {...props} value={theme} onChange={setTheme} />;
};
