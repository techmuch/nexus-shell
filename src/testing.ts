import type { ComponentType } from 'react';
import type { IJsonModel } from 'flexlayout-react';
import { commandRegistry } from './core/registry/CommandRegistry';
import { componentRegistry } from './core/registry/ComponentRegistry';
import { menuRegistry } from './core/registry/MenuRegistry';
import { useChatStore } from './core/services/ChatService';
import { useCommandPaletteStore } from './core/services/CommandPaletteService';
import { defaultLayout, useLayoutStore } from './core/services/LayoutService';
import { useModalStore } from './core/services/ModalStoreService';
import { PANE_SIDES, paneStore } from './core/services/PaneService';
import { useStatusBarStore } from './core/services/StatusBarService';
import { useThemeStore } from './core/services/ThemeService';
import { DEFAULT_USER_PROFILE, useUserProfileStore } from './core/services/UserProfileService';
import { workspace } from './core/services/Workspace';
import { STORAGE_KEYS, writeStored } from './lib/storage';
import { BUNDLED_THEMES } from './lib/themes';

/**
 * Helpers for testing code built on the shell.
 *
 * The shell's state lives in module-level registries and stores, which is what
 * lets any code reach it — and what makes one test leak into the next. These
 * put it back. They work against the real stores and a real FlexLayout model,
 * so a test exercises the same code an app does; there is no need to fake
 * `useLayoutStore` or hand-build `visitNodes` mocks.
 *
 * Also importable as `nexus-shell/testing`.
 *
 * @example
 * ```ts
 * import { resetShell, createTestWorkspace } from 'nexus-shell/testing';
 *
 * beforeEach(() => resetShell());
 *
 * it('opens Desk once', () => {
 *   const ws = createTestWorkspace({ components: { desk: Desk } });
 *   openTool('desk');
 *   openTool('desk');
 *   expect(ws.find('desk')).toHaveLength(1);
 * });
 * ```
 */

/** Options for {@link resetShell}. */
export interface ResetShellOptions {
  /**
   * Also clear component registrations and aliases. Off by default, because
   * apps usually register components at module scope — once per test file —
   * and clearing them would leave later tests rendering "unknown component".
   */
  components?: boolean;
  /** Also clear registered commands. Defaults to `true`. */
  commands?: boolean;
}

/**
 * Return every shell store and registry to its initial state: an empty
 * workspace with storage disabled, no menus, panels, status items, chat or
 * open dialog, the light theme, an anonymous profile, and nothing persisted.
 */
export const resetShell = (options: ResetShellOptions = {}): void => {
  const { components = false, commands = true } = options;

  Object.values(STORAGE_KEYS).forEach((key) => writeStored(key, null));

  if (commands) commandRegistry.clear();
  if (components) componentRegistry.clear();
  menuRegistry.setMenus({});

  const modal = useModalStore.getState();
  if (modal.isOpen) modal.close();
  useCommandPaletteStore.setState({ open: false });

  useLayoutStore.setState({
    options: {},
    storageKey: STORAGE_KEYS.layout,
    dirtyTabs: new Set<string>(),
  });
  useLayoutStore.getState().initLayout(defaultLayout, true);

  PANE_SIDES.forEach((side) => {
    paneStore(side).getState().setActivePanel(null);
    paneStore(side).getState().setPanels([]);
  });

  useChatStore.setState({ messages: [], slashCommands: [], sendHandler: null });
  useStatusBarStore.getState().setWidgets([]);
  useThemeStore.setState({ themes: BUNDLED_THEMES.map((t) => ({ ...t })) });
  useThemeStore.getState().setTheme('light');
  writeStored(STORAGE_KEYS.theme, null);
  useUserProfileStore.setState({ ...DEFAULT_USER_PROFILE });
  writeStored(STORAGE_KEYS.userProfile, null);
};

/** Options for {@link createTestWorkspace}. */
export interface TestWorkspaceOptions {
  /** Starting layout. Defaults to the empty default layout. */
  layout?: IJsonModel;
  /** Components to register, by id. */
  components?: Record<string, ComponentType<any>>;
}

/**
 * A real, headless workspace to drive in a test: storage off, the given
 * components registered, the given layout loaded. Returns the `workspace`
 * facade for convenience.
 */
export const createTestWorkspace = (options: TestWorkspaceOptions = {}): typeof workspace => {
  Object.entries(options.components ?? {}).forEach(([id, component]) => {
    if (componentRegistry.get(id) !== component) componentRegistry.register(id, component);
  });
  useLayoutStore.getState().initLayout(options.layout ?? defaultLayout, true);
  return workspace;
};
