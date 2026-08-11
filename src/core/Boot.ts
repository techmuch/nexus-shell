import { commandRegistry, type ICommand } from './registry/CommandRegistry';
import { menuRegistry, type IMenuItemConfig } from './registry/MenuRegistry';
import { useChatStore, type ISlashCommandConfig } from './services/ChatService';
import { useRightSidebarStore } from './services/RightSidebarService';
import { useSidebarStore, type ISidebarPanel } from './services/SidebarService';
import {
  useStatusBarStore,
  type IStatusBarWidgetConfig,
} from './services/StatusBarService';
import { useTerminalStore } from './services/TerminalService';
import { useThemeStore, type ThemeType } from './services/ThemeService';

export interface InitializeShellOptions {
  /**
   * Sidebar panels to register. Each becomes an icon in the activity bar and
   * renders its `component` in the sidebar when selected.
   */
  panels?: ISidebarPanel[];
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

/** The command ids `initializeShell` registers unless told not to. */
export const DEFAULT_COMMAND_IDS = [
  'view.toggleTerminal',
  'view.toggleChat',
  'view.toggleSidebar',
  'theme.light',
  'theme.dark',
  'theme.gt',
] as const;

const setTheme = (theme: ThemeType) => () => useThemeStore.getState().setTheme(theme);

const DEFAULT_COMMANDS: ICommand[] = [
  {
    id: 'view.toggleTerminal',
    label: 'View: Toggle Terminal',
    keybinding: 'Control+`',
    execute: () => useTerminalStore.getState().toggle(),
  },
  {
    id: 'view.toggleChat',
    label: 'View: Toggle Chat',
    execute: () => useRightSidebarStore.getState().toggleChat(),
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
  { id: 'theme.light', label: 'Preferences: Light Theme', execute: setTheme('light') },
  { id: 'theme.dark', label: 'Preferences: Dark Theme', execute: setTheme('dark') },
  { id: 'theme.gt', label: 'Preferences: Georgia Tech Theme', execute: setTheme('gt') },
];

const DEFAULT_MENUS: Record<string, IMenuItemConfig[]> = {
  View: [
    { id: 'view.terminal', label: 'Toggle Terminal', commandId: 'view.toggleTerminal' },
    { id: 'view.chat', label: 'Toggle Chat', commandId: 'view.toggleChat' },
    { id: 'view.sidebar', label: 'Toggle Sidebar', commandId: 'view.toggleSidebar' },
    {
      id: 'view.theme',
      label: 'Theme',
      submenu: [
        { id: 'view.theme.light', label: 'Light', commandId: 'theme.light' },
        { id: 'view.theme.dark', label: 'Dark', commandId: 'theme.dark' },
        { id: 'view.theme.gt', label: 'Georgia Tech', commandId: 'theme.gt' },
      ],
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
  if (statusBar) useStatusBarStore.getState().setWidgets(statusBar);
  if (slashCommands) useChatStore.getState().setSlashCommands(slashCommands);
};
