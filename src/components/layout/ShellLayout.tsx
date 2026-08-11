import { useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  Layout,
  Actions,
  Model,
  TabNode,
  type Action,
  type IJsonModel,
} from 'flexlayout-react';
import 'flexlayout-react/style/light.css';
import '../../styles/flexlayout-theme.css';

import { ConnectedActivityBar } from '../../connected/ConnectedActivityBar';
import { ConnectedChatPane } from '../../connected/ConnectedChatPane';
import { ConnectedMenuBar } from '../../connected/ConnectedMenuBar';
import { ConnectedSidebarPane } from '../../connected/ConnectedSidebarPane';
import { ConnectedStatusBar } from '../../connected/ConnectedStatusBar';
import { ConnectedTerminalPane } from '../../connected/ConnectedTerminalPane';

import { componentRegistry } from '../../core/registry/ComponentRegistry';
import { menuRegistry, type IMenuItemConfig } from '../../core/registry/MenuRegistry';
import { useChatStore, type ISlashCommandConfig } from '../../core/services/ChatService';
import { useLayoutStore } from '../../core/services/LayoutService';
import { useModalStore } from '../../core/services/ModalStoreService';
import { useSidebarStore, type ISidebarPanel } from '../../core/services/SidebarService';
import {
  useStatusBarStore,
  type IStatusBarWidgetConfig,
} from '../../core/services/StatusBarService';
import { useThemeStore } from '../../core/services/ThemeService';

export interface ShellLayoutProps {
  /**
   * Sidebar panels to register. Each becomes an icon in the activity bar and
   * renders its `component` in the sidebar when selected.
   */
  panels?: ISidebarPanel[];
  /** Slash commands available in the chat pane. */
  slashCommands?: ISlashCommandConfig[];
  /** Menu structure, keyed by top-level menu name. Items dispatch by `commandId`. */
  menuConfig?: Record<string, IMenuItemConfig[]>;
  /** Items for the status bar, grouped by their `alignment`. */
  statusBarConfig?: IStatusBarWidgetConfig[];
  /** Branding shown at the far left of the menu bar. */
  title?: ReactNode;
  /** Slot at the far right of the menu bar, for actions or a theme switcher. */
  rightMenuBarContent?: ReactNode;
  /** Widget rendered between the menus and the right slot, sized for search. */
  centerMenuBarContent?: ReactNode;
  /**
   * Take control of the docking layout. When provided, the shell renders this
   * model and stops writing changes to `useLayoutStore` — useful for tests and
   * stories. Omit it to use the store's persisted model.
   */
  layoutModel?: Model;
  /**
   * Starting workspace, as a `flexlayout-react` JSON model. Applied once on
   * mount and only when nothing has been restored from storage, so it seeds a
   * first run without overwriting a layout the user has since arranged.
   *
   * Ignored when `layoutModel` is provided, which takes control outright.
   */
  initialLayoutJson?: IJsonModel;
  /**
   * Stop persisting the layout to `localStorage`. The workspace then resets to
   * `initialLayoutJson` on every load — useful for embedded or multi-tenant
   * shells where a per-browser layout would be wrong. Defaults to `false`.
   */
  disableLocalStorage?: boolean;
  /**
   * Called with the serialised model whenever the user moves, splits, opens or
   * closes a tab. Use it to persist the layout somewhere of your own — a user
   * profile on the server, say — instead of, or alongside, `localStorage`.
   */
  onLayoutChange?: (layout: IJsonModel) => void;
}

/**
 * The complete application shell: menu bar, activity bar, sidebar, a
 * `flexlayout-react` docking workspace, terminal, chat pane and status bar.
 *
 * **This is where an application starts.** Call {@link initializeShell} once to
 * register your commands, menus and panels, render this component, and add
 * features by registering them rather than by restructuring the layout. Tab
 * contents resolve through the {@link componentRegistry}, so a new view is a
 * registration and a menu entry — the shell never needs to import it.
 *
 * Configuration can arrive either way. Props are convenient for values that
 * change with your app's state; {@link initializeShell} is better for the fixed
 * set, since it runs once and works outside React. Props passed here are
 * written into the same stores on mount, so the two are interchangeable.
 *
 * Internally this composes the `Connected*` component variants, which read from
 * the shell stores. Those components — and the pure ones beneath them — are
 * exported too, for the cases where you need to rearrange the frame itself.
 *
 * Closing a tab marked dirty via `useLayoutStore().setTabDirty` prompts for
 * confirmation before the tab is removed.
 *
 * @example
 * ```tsx
 * // main.tsx — a complete application
 * import { initializeShell, ShellLayout, componentRegistry, AppTitle } from 'nexus-shell';
 * import 'nexus-shell/style.css';
 *
 * componentRegistry.register('editor', Editor);
 *
 * initializeShell({
 *   panels: [{ id: 'files', label: 'Explorer', icon: Files, component: FileTree }],
 *   commands: [{ id: 'file.save', label: 'File: Save', keybinding: 'Control+s', execute: save }],
 *   menus: { File: [{ id: 'save', label: 'Save', commandId: 'file.save' }] },
 *   statusBar: [{ id: 'branch', label: 'main', alignment: 'left' }],
 * });
 *
 * createRoot(document.getElementById('root')!).render(
 *   <ShellLayout title={<AppTitle title="Acme Studio" icon={<Boxes size={16} />} />} />,
 * );
 * ```
 */
export const ShellLayout = ({
  panels,
  slashCommands,
  menuConfig,
  statusBarConfig,
  title,
  rightMenuBarContent,
  centerMenuBarContent,
  layoutModel,
  initialLayoutJson,
  disableLocalStorage = false,
  onLayoutChange,
}: ShellLayoutProps) => {
  const { model, setModel, initLayout, isTabDirty, setTabDirty } = useLayoutStore();
  const theme = useThemeStore((s) => s.theme);
  const setPanels = useSidebarStore((s) => s.setPanels);
  const setSlashCommands = useChatStore((s) => s.setSlashCommands);
  const setWidgets = useStatusBarStore((s) => s.setWidgets);

  useEffect(() => {
    if (panels) setPanels(panels);
  }, [panels, setPanels]);

  useEffect(() => {
    if (slashCommands) setSlashCommands(slashCommands);
  }, [slashCommands, setSlashCommands]);

  useEffect(() => {
    if (menuConfig) menuRegistry.setMenus(menuConfig);
  }, [menuConfig]);

  useEffect(() => {
    if (statusBarConfig) setWidgets(statusBarConfig);
  }, [statusBarConfig, setWidgets]);

  // Seed the workspace once on mount. Deliberately not reactive to
  // `initialLayoutJson`: re-running it would discard the arrangement the user
  // has since made every time the prop's identity changed.
  useEffect(() => {
    if (layoutModel) return;
    if (!initialLayoutJson && !disableLocalStorage) return;
    initLayout(initialLayoutJson, disableLocalStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Resolves a docked tab to its registered component. */
  const factory = (node: TabNode) => {
    try {
      const componentId = node.getComponent();
      const config = node.getConfig() || {};
      const RegisteredComponent = componentId
        ? componentRegistry.get(componentId)
        : undefined;

      if (RegisteredComponent) {
        return <RegisteredComponent node={node} {...config} />;
      }
      return <div className="p-4 text-sm">Unknown Component: {componentId}</div>;
    } catch (e) {
      console.error('Error in component factory:', e);
      return (
        <div className="p-8 text-destructive bg-destructive/10 border border-destructive/20 h-full flex items-center justify-center">
          Error rendering component: {e instanceof Error ? e.message : 'Unknown error'}
        </div>
      );
    }
  };

  /** Intercepts tab close so dirty tabs can prompt before being discarded. */
  const onAction = (action: Action) => {
    if (action.type !== Actions.DELETE_TAB) return action;

    const node = model.getNodeById(action.data.node) as TabNode;
    if (!node || !isTabDirty(node.getId())) return action;

    useModalStore
      .getState()
      .openConfirm(
        `Tab "${node.getName()}" has unsaved changes. Are you sure you want to close it?`,
      )
      .then((confirmed) => {
        if (!confirmed) return;
        // Clear dirty first so the re-dispatched action doesn't prompt again.
        setTabDirty(node.getId(), false);
        model.doAction(action);
      });

    return undefined;
  };

  return (
    <div
      className={`flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden theme-${theme}`}
    >
      <ConnectedMenuBar
        title={title}
        center={centerMenuBarContent}
        right={rightMenuBarContent}
      />
      <div className="flex-1 flex overflow-hidden">
        <ConnectedActivityBar />
        <ConnectedSidebarPane />
        <div className="flex-1 flex flex-col min-w-0 bg-card">
          <div className="flex-1 relative h-full w-full">
            <Layout
              model={layoutModel || model}
              factory={factory}
              onModelChange={(m) => {
                // A caller-supplied model is controlled; don't write it back.
                if (!layoutModel) setModel(m);
                onLayoutChange?.(m.toJson());
              }}
              onAction={onAction}
            />
          </div>
          <ConnectedTerminalPane />
        </div>
        <ConnectedChatPane />
      </div>
      <ConnectedStatusBar />
    </div>
  );
};
