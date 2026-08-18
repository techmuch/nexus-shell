import { commandRegistry, type ICommand } from './registry/CommandRegistry';
import { menuRegistry, type IMenuItemConfig } from './registry/MenuRegistry';
import { componentRegistry } from './registry/ComponentRegistry';
import { useChatStore, type ISlashCommandConfig } from './services/ChatService';
import { useLayoutStore } from './services/LayoutService';
import {
  CHAT_PANEL_ID,
  TERMINAL_PANEL_ID,
  useInspectorStore,
  useSidebarStore,
  type ISidebarPanel,
} from './services/SidebarService';
import {
  useStatusBarStore,
  type IStatusBarWidgetConfig,
} from './services/StatusBarService';
import { useThemeStore, type ThemeType } from './services/ThemeService';
import { BUNDLED_THEMES } from '../lib/themes';

export interface InitializeShellOptions {
  /**
   * Sidebar panels to register. Each becomes an icon in the activity bar and
   * renders its `component` in the sidebar when selected.
   */
  panels?: ISidebarPanel[];
  /**
   * Right-hand panels — inspectors and properties, as opposed to navigation.
   * Registered against `useInspectorStore`, so they open and close
   * independently of the left-hand sidebar.
   */
  inspectorPanels?: ISidebarPanel[];
  /** Menus keyed by top-level name. Items dispatch through their `commandId`. */
  menus?: Record<string, IMenuItemConfig[]>;
  /** Commands available to the palette, menus and keybindings. */
  commands?: ICommand[];
  /** Items for the status bar, grouped by their `alignment`. */
  statusBar?: IStatusBarWidgetConfig[];
  /** Slash commands offered in the chat pane. */
  slashCommands?: ISlashCommandConfig[];
  /**
   * Register the built-in view and theme commands listed in
   * {@link DEFAULT_COMMAND_IDS}. Defaults to `true`. Turn it off if your app
   * wants to own every command id.
   */
  defaultCommands?: boolean;
  /**
   * Register a default **View** menu exposing the built-in commands. Defaults
   * to `true`, and is ignored when `defaultCommands` is `false`.
   */
  defaultMenus?: boolean;
}

/** One `theme.<id>` command per bundled theme, generated from the registry. */
const THEME_COMMANDS: ICommand[] = BUNDLED_THEMES.map((theme) => ({
  id: `theme.${theme.id}`,
  label: `Preferences: ${theme.label} Theme`,
  execute: () => useThemeStore.getState().setTheme(theme.id as ThemeType),
}));

/** The command ids `initializeShell` registers unless told not to. */
export const DEFAULT_COMMAND_IDS = [
  'view.toggleTerminal',
  'view.toggleChat',
  'view.toggleSidebar',
  ...THEME_COMMANDS.map((c) => c.id),
] as const;

/**
 * Toggle a panel wherever it happens to be registered.
 *
 * Chat and terminal are no longer nailed to one edge, so a command that toggled
 * a fixed slot would be wrong the moment you moved them. This looks the id up
 * in the left rail, then the right, and finally opens it as a tab — which is
 * also what makes `Control+\`` keep working when the terminal is a tab.
 *
 * Returns `false` when the id is registered nowhere, so a caller can tell the
 * difference between "toggled" and "nothing to toggle".
 */
export const togglePanel = (id: string): boolean => {
  for (const store of [useSidebarStore, useInspectorStore]) {
    if (store.getState().panels.some((panel) => panel.id === id)) {
      store.getState().toggleSidebar(id);
      return true;
    }
  }

  if (componentRegistry.get(id)) {
    // A tab, then. `addTab` focuses an existing one rather than duplicating it.
    useLayoutStore.getState().addTab(id);
    return true;
  }

  return false;
};

const DEFAULT_COMMANDS: ICommand[] = [
  {
    id: 'view.toggleTerminal',
    label: 'View: Toggle Terminal',
    keybinding: 'Control+`',
    execute: () => togglePanel(TERMINAL_PANEL_ID),
  },
  {
    id: 'view.toggleChat',
    label: 'View: Toggle Chat',
    execute: () => togglePanel(CHAT_PANEL_ID),
  },
  {
    id: 'view.toggleSidebar',
    label: 'View: Toggle Sidebar',
    keybinding: 'Control+b',
    execute: () => {
      const { activeSidebar, panels, setActiveSidebar } = useSidebarStore.getState();
      // Reopen the first registered panel when nothing is showing.
      setActiveSidebar(activeSidebar ? null : (panels[0]?.id ?? null));
    },
  },
  ...THEME_COMMANDS,
];

const DEFAULT_MENUS: Record<string, IMenuItemConfig[]> = {
  View: [
    { id: 'view.terminal', label: 'Toggle Terminal', commandId: 'view.toggleTerminal' },
    { id: 'view.chat', label: 'Toggle Chat', commandId: 'view.toggleChat' },
    { id: 'view.sidebar', label: 'Toggle Sidebar', commandId: 'view.toggleSidebar' },
    {
      id: 'view.theme',
      label: 'Theme',
      submenu: BUNDLED_THEMES.map((theme) => ({
        id: `view.theme.${theme.id}`,
        label: theme.label,
        commandId: `theme.${theme.id}`,
      })),
    },
  ],
};

/**
 * Boot the shell: register commands, menus, panels and status bar items into
 * the shell registries and stores.
 *
 * This is the usual first call in a Nexus Shell application. `ShellLayout` can
 * take the same configuration as props, but doing it here has two advantages:
 * it runs once rather than on every render, and it happens outside React, so
 * plugins and other non-component code can contribute in exactly the same way.
 *
 * Call it once, before rendering. It is safe to call again — the registries
 * warn on duplicate ids rather than throwing — but it is not a reset: nothing
 * previously registered is removed.
 *
 * @example
 * ```ts
 * // main.tsx
 * import { initializeShell, componentRegistry } from 'nexus-shell';
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
 * createRoot(el).render(<ShellLayout title={<AppTitle title="Acme" />} />);
 * ```
 */
export const initializeShell = (options: InitializeShellOptions = {}): void => {
  const {
    panels,
    inspectorPanels,
    menus,
    commands,
    statusBar,
    slashCommands,
    defaultCommands = true,
    defaultMenus = true,
  } = options;

  if (defaultCommands) {
    DEFAULT_COMMANDS.forEach((command) => commandRegistry.registerCommand(command));
  }

  commands?.forEach((command) => commandRegistry.registerCommand(command));

  // Menus are set rather than appended, so the caller's config wins outright.
  const mergedMenus = {
    ...(defaultCommands && defaultMenus ? DEFAULT_MENUS : {}),
    ...(menus ?? {}),
  };
  if (Object.keys(mergedMenus).length > 0) {
    menuRegistry.setMenus(mergedMenus);
  }

  if (panels) useSidebarStore.getState().setPanels(panels);
  if (inspectorPanels) useInspectorStore.getState().setPanels(inspectorPanels);
  if (statusBar) useStatusBarStore.getState().setWidgets(statusBar);
  if (slashCommands) useChatStore.getState().setSlashCommands(slashCommands);
};
