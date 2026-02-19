// Core Framework Components
export { ShellLayout } from './components/layout/ShellLayout';
export { MenuBar } from './components/widgets/MenuBar';
export { StatusBar } from './components/widgets/StatusBar';
export { ActivityBar } from './components/widgets/ActivityBar';
export { SidebarPane } from './components/widgets/SidebarPane';
export { TreeWidget } from './components/widgets/TreeWidget';
export { CommandPalette } from './components/widgets/CommandPalette';
export { ChatPane } from './components/widgets/ChatPane';

// Registries (Public Singleton Instances)
export { commandRegistry, type ICommand } from './core/registry/CommandRegistry';
export { menuRegistry, type IMenuItem } from './core/registry/MenuRegistry';
export { pluginRegistry, type IPlugin } from './core/registry/PluginRegistry';

// Services & Hooks
export { initializeShell } from './core/Boot';
export { useLayoutStore } from './core/services/LayoutService';
export { useThemeStore, type ThemeType } from './core/services/ThemeService';
export { useSidebarStore, type SidebarType } from './core/services/SidebarService';
export { useRightSidebarStore } from './core/services/RightSidebarService';
export { useKeyboardShortcuts } from './core/services/KeyboardService';

// Styles (Import this in your app to get the theme/base styles)
import './index.css';
