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
  togglePanel,
  DEFAULT_COMMAND_IDS,
  type InitializeShellOptions,
} from './core/Boot';
export {
  PaneHostProvider,
  usePaneHost,
  useHostChrome,
  type IPaneHost,
  type PaneHostProviderProps,
} from './components/layout/PaneHost';

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
export {
  useSidebarStore,
  useInspectorStore,
  createSidebarStore,
  CHAT_PANEL_ID,
  TERMINAL_PANEL_ID,
  type ISidebarPanel,
  type SidebarState,
  type SidebarStore,
} from './core/services/SidebarService';
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
export { SidebarPane, type SidebarPaneProps, type PaneSide } from './components/widgets/SidebarPane';
export { StatusBar, type StatusBarProps, type IStatusBarWidget } from './components/widgets/StatusBar';
export { TerminalPane, type TerminalPaneProps } from './components/widgets/TerminalPane';
export { ThemeSwitcher, type ThemeSwitcherProps, type IThemeOption, DEFAULT_THEME_OPTIONS } from './components/widgets/ThemeSwitcher';
export { TreeWidget, type TreeWidgetProps, type ITreeNode, type ITreeAction, type ITreeContext } from './components/widgets/TreeWidget';
export { UserProfile, type UserProfileProps, type IUserProfile, type IUserProfileAction } from './components/widgets/UserProfile';

// ---------------------------------------------------------------------------
// Graph — node-and-edge editing primitives
//
// An infinite canvas, positioned nodes, edges, keyboard-driven navigation and
// drag-to-create. Decomposed so an argument map, a pipeline editor and a scene
// graph can share them.
// ---------------------------------------------------------------------------

export * from './components/graph';
export {
  BUILT_IN_LAYOUTS,
  gridLayout,
  layeredLayout,
  type GraphLayout,
  type GridLayoutOptions,
  type LayeredLayoutOptions,
  type LayoutDirection,
} from './lib/layout';
export {
  DEFAULT_NODE_SIZE,
  IDENTITY_VIEWPORT,
  clampScale,
  edgesOf,
  findNeighbour,
  fitViewport,
  graphBounds,
  isConnected,
  nextId,
  nodeRect,
  placeRelativeTo,
  portPoint,
  rectCenter,
  removeNode,
  resolvePorts,
  toGraphSpace,
  toScreenSpace,
  unionRect,
  viewportRect,
  centerOn,
  zoomAt,
  type Direction,
  type GraphPort,
  type IGraphEdge,
  type IGraphNode,
  type IPoint,
  type IRect,
  type IViewport,
} from './lib/graph';

// ---------------------------------------------------------------------------
// Properties — inspectors for whatever is selected
//
// Composable fields, plus a descriptor-driven panel built on them. Handles the
// empty, single and multiple selection cases, including mixed values.
// ---------------------------------------------------------------------------

export * from './components/properties';
export {
  getPath,
  setPath,
  readValue,
  readValues,
  writeValue,
  writeValues,
  type IPropertyAccessor,
  type IPropertyValue,
} from './lib/properties';

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
