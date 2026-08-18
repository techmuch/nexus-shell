import { SettingsPanel, type SettingsPanelProps } from '../components/widgets/SettingsPanel';
import { useThemeStore, type ThemeType } from '../core/services/ThemeService';

export type ConnectedSettingsPanelProps = Omit<
  SettingsPanelProps,
  'theme' | 'onThemeChange'
>;

/**
 * {@link SettingsPanel} bound to `useThemeStore`.
 *
 * This used to be reached through a reserved `"settings"` panel id that the
 * pane special-cased. Making it an ordinary connected component means the pane
 * has no privileged ids left, and both rails behave identically — register it
 * with `settingsPanel()`, or don't, and nothing else changes.
 */
export const ConnectedSettingsPanel = (props: ConnectedSettingsPanelProps) => {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <SettingsPanel
      {...props}
      theme={theme}
      onThemeChange={(next) => setTheme(next as ThemeType)}
    />
  );
};
