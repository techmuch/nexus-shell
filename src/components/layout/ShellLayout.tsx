import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Layout, Actions, Model, TabNode, type Action } from 'flexlayout-react';
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
}

/**
 * The complete application shell: menu bar, activity bar, sidebar, a
 * `flexlayout-react` docking area, terminal, chat pane and status bar.
 *
 * This is the batteries-included composition. It registers whatever you pass
 * into the shell stores on mount, then renders the `Connected*` component
 * variants, which read from those stores. Tab contents come from the
 * {@link componentRegistry}, so plugins can contribute views without the shell
 * importing them.
 *
 * If you want the pieces without the wiring, import the individual components
 * and compose them yourself — every one of them is prop-driven and works
 * standalone.
 *
 * Closing a tab marked dirty via `useLayoutStore().setTabDirty` prompts for
 * confirmation before the tab is removed.
 *
 * @example
 * ```tsx
 * <ShellLayout
 *   title={<Logo />}
 *   panels={[{ id: 'files', label: 'Explorer', icon: Files, component: FileTree }]}
 *   menuConfig={{ File: [{ id: 'save', label: 'Save', commandId: 'file.save' }] }}
 *   statusBarConfig={[{ id: 'branch', label: 'main', alignment: 'left' }]}
 * />
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
}: ShellLayoutProps) => {
  const { model, setModel, isTabDirty, setTabDirty } = useLayoutStore();
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
