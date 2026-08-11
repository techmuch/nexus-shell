/**
 * Nexus Shell — a React component library for building IDE-style application
 * shells.
 *
 * **Start with {@link ShellLayout}.** It is the whole application frame — menu
 * bar, activity bar, sidebar, docking workspace, terminal, chat pane and status
 * bar — and the intended starting point for an app built on this library. Call
 * {@link initializeShell} once to register your commands, menus and panels,
 * render `ShellLayout`, and grow from there.
 *
 * ```ts
 * import { initializeShell, ShellLayout } from 'nexus-shell';
 * import 'nexus-shell/style.css';
 *
 * initializeShell({ panels, menus, commands });
 * createRoot(el).render(<ShellLayout title={<AppTitle title="Acme" />} />);
 * ```
 *
 * Everything the shell is built from is also exported on its own. Those
 * components are pure and prop-driven, and they are the escape hatch: reach for
 * them when you are embedding one piece into an app you already have, or when
 * you need a layout the shell cannot express. Most applications should not need
 * to.
 */

// ---------------------------------------------------------------------------
// The shell — start here
// ---------------------------------------------------------------------------

export { ShellLayout, ShellLayout as NexusWorkspaceShell, type ShellLayoutProps } from './components/layout/ShellLayout';
export {
  initializeShell,
  DEFAULT_COMMAND_IDS,
  type InitializeShellOptions,
} from './core/Boot';

// Registries — how features register themselves with the shell
export { commandRegistry, CommandRegistry, type ICommand } from './core/registry/CommandRegistry';
export { menuRegistry, MenuRegistry, type IMenuItemConfig } from './core/registry/MenuRegistry';
export { pluginRegistry, type IPlugin, type PluginStatus } from './core/registry/PluginRegistry';
export { componentRegistry, type ComponentConstructor } from './core/registry/ComponentRegistry';

// Stores — the shell's state, as zustand hooks. Read or drive them from
// anywhere, including outside React.
export { useChatStore, type ISlashCommandConfig } from './core/services/ChatService';
export { useLayoutStore } from './core/services/LayoutService';
export { useModalStore, type ModalType as ModalStoreType } from './core/services/ModalStoreService';
export { useRightSidebarStore } from './core/services/RightSidebarService';
export { useSidebarStore, type ISidebarPanel } from './core/services/SidebarService';
export { useStatusBarStore, type IStatusBarWidgetConfig } from './core/services/StatusBarService';
export { useTerminalStore } from './core/services/TerminalService';
export { useThemeStore, type ThemeType } from './core/services/ThemeService';
export { useUserProfileStore, type UserProfileState } from './core/services/UserProfileService';
export { useKeyboardShortcuts } from './core/services/KeyboardService';

// ---------------------------------------------------------------------------
// Store-connected pieces
//
// What ShellLayout is assembled from. Use these to rearrange the shell's own
// parts while keeping its behaviour — a different frame around the same stores.
// ---------------------------------------------------------------------------

export * from './connected';

// ---------------------------------------------------------------------------
// Components — the escape hatch
//
// Pure and prop-driven: no store access, no registry lookups. Reach for these
// when you are adopting one piece into an existing app, or building a layout
// the shell cannot express.
// ---------------------------------------------------------------------------

export { ActivityBar, type ActivityBarProps, type IActivityBarItem } from './components/widgets/ActivityBar';
export { AppTitle, type AppTitleProps } from './components/widgets/AppTitle';
export { ChatPane, type ChatPaneProps, type IChatMessage, type ISlashCommand } from './components/widgets/ChatPane';
export { CommandPalette, type CommandPaletteProps, type ICommandItem } from './components/widgets/CommandPalette';
export { ContextMenu, type ContextMenuProps, type IContextMenuItem } from './components/widgets/ContextMenu';
export { DataGrid, type DataGridProps, type IDataGridColumn } from './components/widgets/DataGrid';
export { MenuBar, type MenuBarProps, type IMenuItem } from './components/widgets/MenuBar';
export { Modal, type ModalProps, type ModalType } from './components/widgets/Modal';
export { QuickSearch, type QuickSearchProps, type IQuickSearchResult } from './components/widgets/QuickSearch';
export { SearchWidget, type SearchWidgetProps, type ISearchResult } from './components/widgets/SearchWidget';
export { SettingsPanel, type SettingsPanelProps, type ISettingsThemeOption, DEFAULT_SETTINGS_THEMES } from './components/widgets/SettingsPanel';
export { SidebarPane, type SidebarPaneProps } from './components/widgets/SidebarPane';
export { StatusBar, type StatusBarProps, type IStatusBarWidget } from './components/widgets/StatusBar';
export { TerminalPane, type TerminalPaneProps } from './components/widgets/TerminalPane';
export { ThemeSwitcher, type ThemeSwitcherProps, type IThemeOption, DEFAULT_THEME_OPTIONS } from './components/widgets/ThemeSwitcher';
export { TreeWidget, type TreeWidgetProps, type ITreeNode, type ITreeAction, type ITreeContext } from './components/widgets/TreeWidget';
export { UserProfile, type UserProfileProps, type IUserProfile, type IUserProfileAction } from './components/widgets/UserProfile';

// Utilities
export { cn } from './lib/cn';
export {
  BUNDLED_THEMES,
  BUNDLED_THEME_CLASSES,
  themeClass,
  type IBundledTheme,
  type BundledThemeId,
} from './lib/themes';

// Styles — bundled into dist/style.css by the library build
import './index.css';
