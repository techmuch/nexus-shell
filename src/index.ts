// Core Framework Components
export { ShellLayout } from './components/layout/ShellLayout';
export { MenuBar } from './components/widgets/MenuBar';
export { StatusBar } from './components/widgets/StatusBar';
export { ActivityBar } from './components/widgets/ActivityBar';
export { SidebarPane } from './components/widgets/SidebarPane';
export { TreeWidget } from './components/widgets/TreeWidget';
export { SearchWidget, type ISearchResult, type SearchWidgetProps } from './components/widgets/SearchWidget';
export { CommandPalette } from './components/widgets/CommandPalette';
export { UserProfile, type UserProfileProps } from './components/widgets/UserProfile';
export { ChatPane } from './components/widgets/ChatPane';
export { TerminalPane } from './components/widgets/TerminalPane';

// Registries (Public Singleton Instances)
export { commandRegistry, type ICommand } from './core/registry/CommandRegistry';
export { menuRegistry, type IMenuItem } from './core/registry/MenuRegistry';
export { pluginRegistry, type IPlugin } from './core/registry/PluginRegistry';

// Services & Hooks
export { initializeShell } from './core/Boot';
export { useLayoutStore } from './core/services/LayoutService';
export { useThemeStore, type ThemeType } from './core/services/ThemeService';
export { useSidebarStore, type ISidebarPanel } from './core/services/SidebarService';
export { useRightSidebarStore } from './core/services/RightSidebarService';
export { useTerminalStore } from './core/services/TerminalService';
export { useChatStore, type ISlashCommand } from './core/services/ChatService';
export { useStatusBarStore, type IStatusBarWidget } from './core/services/StatusBarService';
export { useKeyboardShortcuts } from './core/services/KeyboardService';

// Styles (Import this in your app to get the theme/base styles)
import './index.css';
