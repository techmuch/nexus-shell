/**
 * Nexus Shell — a React component library for building IDE-style application
 * shells.
 *
 * The surface is deliberately two-tier:
 *
 * 1. **Primitives** — pure, prop-driven components with no global state. Use
 *    these to build your own layout. They are the supported public API.
 * 2. **Shell** — `ShellLayout` plus the stores and registries behind it, for
 *    when you want the whole assembled application frame.
 *
 * Import the stylesheet once in your app entry:
 * ```ts
 * import 'nexus-shell/style.css';
 * ```
 */

// ---------------------------------------------------------------------------
// Primitives — pure, controlled, no store access
// ---------------------------------------------------------------------------

export { ActivityBar, type ActivityBarProps, type IActivityBarItem } from './components/widgets/ActivityBar';
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
export { AppTitle, type AppTitleProps } from './components/widgets/AppTitle';

// Utilities
export { cn } from './lib/cn';

// ---------------------------------------------------------------------------
// Shell — the assembled layout and its store-connected pieces
// ---------------------------------------------------------------------------

export { ShellLayout, type ShellLayoutProps } from './components/layout/ShellLayout';
export * from './connected';

// Registries — singletons the shell reads from
export { commandRegistry, CommandRegistry, type ICommand } from './core/registry/CommandRegistry';
export { menuRegistry, MenuRegistry, type IMenuItemConfig } from './core/registry/MenuRegistry';
export { pluginRegistry, type IPlugin, type PluginStatus } from './core/registry/PluginRegistry';
export { componentRegistry, type ComponentConstructor } from './core/registry/ComponentRegistry';

// Stores — shell state, all zustand hooks
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

// Styles — bundled into dist/style.css by the library build
import './index.css';
