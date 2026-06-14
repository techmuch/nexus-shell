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
export { AgentManager, type Agent, type AgentManagerProps } from './components/widgets/AgentManager';
export { WargameMap, type WargameMapProps, type UnitData, type AttackData, type TerrainHexData } from './components/widgets/WargameMap';
export { DataGrid, type DataGridProps, type IDataGridColumn } from './components/widgets/DataGrid';
export { MockupReviewWidget } from './components/widgets/MockupReviewWidget';
export { useMockupReviewStore, type IMockupAnnotation, type IMockupVersion, type IMockupView } from './core/services/MockupReviewService';
export { DialogueMappingWidget } from './components/widgets/DialogueMappingWidget';
export { DialogueMapperLibraryWidget } from './components/widgets/DialogueMapperLibraryWidget';
export { ArgumentInspectorWidget } from './components/widgets/ArgumentInspectorWidget';
export { DialogueMapperLibrary, type DialogueMapperLibraryProps } from './components/widgets/DialogueMapperLibrary';
export { FlowControlToolbar, type FlowControlToolbarProps } from './components/widgets/FlowControlToolbar';
export { DialogueMappingShell } from './components/layout/DialogueMappingShell';
export { ThemeSwitcher, type ThemeSwitcherProps } from './components/widgets/ThemeSwitcher';
export { DialogueMapperTitle, type DialogueMapperTitleProps } from './components/widgets/DialogueMapperTitle';
export { useDialogueMappingStore, type IDialogueNodeData, type IbisNodeType } from './core/services/DialogueMappingService';

// Registries (Public Singleton Instances)
export { commandRegistry, type ICommand } from './core/registry/CommandRegistry';
export { menuRegistry, type IMenuItem } from './core/registry/MenuRegistry';
export { pluginRegistry, type IPlugin, type PluginStatus } from './core/registry/PluginRegistry';
export { componentRegistry, type ComponentConstructor } from './core/registry/ComponentRegistry';

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
export { useUserProfileStore, type UserProfileState } from './core/services/UserProfileService';

// Styles (Import this in your app to get the theme/base styles)
import './index.css';
