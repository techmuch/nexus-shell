import { SidebarPane, type SidebarPaneProps } from '../components/widgets/SidebarPane';
import { SettingsPanel } from '../components/widgets/SettingsPanel';
import { useSidebarStore } from '../core/services/SidebarService';
import { useThemeStore, type ThemeType } from '../core/services/ThemeService';

export type ConnectedSidebarPaneProps = Omit<
  SidebarPaneProps,
  'title' | 'children' | 'onClose'
>;

/**
 * {@link SidebarPane} bound to `useSidebarStore`.
 *
 * Renders whichever panel is active, or nothing when the sidebar is closed. The
 * reserved `"settings"` panel id renders the built-in {@link SettingsPanel}
 * wired to `useThemeStore`; every other id resolves against the panels
 * registered in the store.
 */
export const ConnectedSidebarPane = (props: ConnectedSidebarPaneProps) => {
  const activeSidebar = useSidebarStore((s) => s.activeSidebar);
  const panels = useSidebarStore((s) => s.panels);
  const setActiveSidebar = useSidebarStore((s) => s.setActiveSidebar);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  if (!activeSidebar) return null;

  const close = () => setActiveSidebar(null);

  if (activeSidebar === 'settings') {
    return (
      <SidebarPane {...props} title="Settings" onClose={close}>
        <SettingsPanel
          theme={theme}
          onThemeChange={(next) => setTheme(next as ThemeType)}
        />
      </SidebarPane>
    );
  }

  const panel = panels.find((p) => p.id === activeSidebar);

  if (!panel) {
    return (
      <SidebarPane {...props} title={activeSidebar} onClose={close}>
        <div className="p-4 text-sm italic text-muted-foreground">
          Panel content not found.
        </div>
      </SidebarPane>
    );
  }

  const Component =
    typeof panel.component === 'function'
      ? (panel.component as React.ComponentType)
      : null;

  return (
    <SidebarPane {...props} title={panel.label} onClose={close}>
      {Component ? <Component /> : (panel.component as React.ReactNode)}
    </SidebarPane>
  );
};
