import { SidebarPane, type SidebarPaneProps } from '../components/widgets/SidebarPane';
import { SettingsPanel } from '../components/widgets/SettingsPanel';
import {
  useInspectorStore,
  useSidebarStore,
  type SidebarStore,
} from '../core/services/SidebarService';
import { useThemeStore, type ThemeType } from '../core/services/ThemeService';

export type ConnectedSidebarPaneProps = Omit<
  SidebarPaneProps,
  'title' | 'children' | 'onClose'
>;

/**
 * The shared body. Both panes are the same thing on opposite edges.
 *
 * `store` is a hook passed as a prop, which is only sound because each call
 * site passes a module-level store that never changes identity. If you add a
 * third pane, give it its own wrapper with a fixed store rather than making
 * this one switch stores at runtime — that would break the rules of hooks.
 */
const StorePane = ({
  store,
  settings,
  ...props
}: ConnectedSidebarPaneProps & { store: SidebarStore; settings?: boolean }) => {
  const activeSidebar = store((s) => s.activeSidebar);
  const panels = store((s) => s.panels);
  const setActiveSidebar = store((s) => s.setActiveSidebar);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  if (!activeSidebar) return null;

  const close = () => setActiveSidebar(null);

  if (settings && activeSidebar === 'settings') {
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

/**
 * {@link SidebarPane} bound to `useSidebarStore`, docked left.
 *
 * Renders whichever panel is active, or nothing when the sidebar is closed. The
 * reserved `"settings"` panel id renders the built-in {@link SettingsPanel}
 * wired to `useThemeStore`; every other id resolves against the panels
 * registered in the store.
 */
export const ConnectedSidebarPane = (props: ConnectedSidebarPaneProps) => (
  <StorePane {...props} store={useSidebarStore} settings side={props.side ?? 'left'} />
);

/**
 * {@link SidebarPane} bound to `useInspectorStore`, docked right.
 *
 * The same pane on the other edge, resolving against a separate panel registry
 * — so an inspector opens and closes independently of the explorer, which is
 * how anyone actually works: file tree open on the left, properties on the
 * right, both at once.
 *
 * Unlike the left pane there is no reserved `"settings"` id here; settings are
 * navigation, and navigation belongs on the left.
 *
 * @example
 * ```tsx
 * <ShellLayout
 *   inspectorPanels={[
 *     { id: 'properties', label: 'Properties', icon: Sliders, component: Inspector },
 *   ]}
 * />
 * ```
 */
export const ConnectedInspectorPane = (props: ConnectedSidebarPaneProps) => (
  <StorePane {...props} store={useInspectorStore} side={props.side ?? 'right'} />
);
