import { create } from 'zustand'
import {
  Model,
  Actions,
  DockLocation,
  TabNode,
  TabSetNode,
  type IJsonModel,
} from 'flexlayout-react'
import { readStoredJson, writeStored, STORAGE_KEYS } from '../../lib/storage'
import { componentRegistry } from '../registry/ComponentRegistry'
import type { ReactNode } from 'react'

/**
 * Config key under which a tab's reuse key is stored when it differs from its
 * component id. Stripped from the props the tab's component receives.
 */
export const REUSE_KEY_CONFIG = '_nexusReuseKey';

/** Options for {@link LayoutState.addTab}. */
export interface AddTabOptions {
  /**
   * Which existing tab counts as "the same tab".
   *
   * Defaults to the component id, so a tool opens once and is focused on
   * every later open — the behaviour almost every app wants from a dashboard,
   * a log or a settings page. Pass a string to key by something else (one tab
   * per document: `reuseKey: \`file:${path}\``), or `null` to always open a new
   * tab.
   */
  reuseKey?: string | null;
  /** Select the tab. Defaults to `true`. */
  focus?: boolean;
  /**
   * Where a *new* tab goes. `'active'` (the default) adds it to the active
   * tabset; `'right'` and `'bottom'` split the active tabset; `{ tabsetId }`
   * targets a specific tabset. Ignored when an existing tab is reused.
   */
  location?: 'active' | 'right' | 'bottom' | { tabsetId: string };
}

/**
 * What to do with a persisted tab whose component is no longer registered.
 *
 * `'placeholder'` (the default) renders a notice in the tab; `'drop'` closes
 * such tabs when the shell mounts; a function renders whatever it returns.
 */
export type UnknownComponentPolicy =
  | 'placeholder'
  | 'drop'
  | ((componentId: string) => ReactNode);

/**
 * How persisted layouts evolve between releases of an app.
 *
 * Layouts are saved as JSON naming component ids. Rename a component, split
 * a tab in two or retire a view, and every user's saved layout still names
 * the old shape. Bump `version` and let `migrate` rewrite it — it runs on the
 * raw JSON, before FlexLayout parses it, for any layout saved under an older
 * version. Layouts saved before 0.3.0 count as version 0.
 *
 * For a plain rename, prefer `componentRegistry.alias(old, new)`.
 */
export interface LayoutOptions {
  /** The current layout schema version. Defaults to 0. */
  version?: number;
  /** Rewrite a layout saved under `fromVersion` into the current shape. */
  migrate?: (json: IJsonModel, fromVersion: number) => IJsonModel;
  /** See {@link UnknownComponentPolicy}. Defaults to `'placeholder'`. */
  onUnknownComponent?: UnknownComponentPolicy;
}

/** The envelope a layout is persisted in, from 0.3.0. */
interface PersistedLayout {
  nexusLayoutVersion: number;
  layout: IJsonModel;
}

interface LayoutState {
  model: Model;
  /**
   * Bumped on every change the shell knows about — the docking view's own
   * edits, and every `workspace` or `addTab` call. Subscribe to it to react to
   * layout changes. Raw `model.doAction` calls made by app code bypass it.
   */
  revision: number;
  /** Whether the current model was restored from storage. */
  restored: boolean;
  /** The layout `workspace.reset()` returns to. */
  fallbackLayout: IJsonModel;
  /** Versioning and unknown-component policy; see {@link configureLayout}. */
  options: LayoutOptions;
  dirtyTabs: Set<string>; // Set of tab IDs with unsaved changes
  storageKey: string;     // The currently active localStorage key
  disableLocalStorage: boolean;
  initLayout: (json: any, disableStorage?: boolean) => void;
  /** Record a change to the current model: bumps `revision` and persists. */
  setModel: (model: Model) => void;
  /** Clear the persisted layout and return to the fallback layout. */
  resetLayout: () => void;
  setStorageKey: (key: string, fallbackLayout?: IJsonModel) => void;
  /**
   * Open a tab, or focus it when one with the same reuse key is already open.
   *
   * When an existing tab is reused, a passed `title` renames it and a passed
   * `config` is merged into its config, so re-opening a tab is also how it is
   * pointed at something new.
   *
   * @returns The id of the opened or focused tab, or `null` when the layout
   * has nowhere to put one.
   */
  addTab: (
    componentName: string,
    title?: string,
    config?: Record<string, any>,
    options?: AddTabOptions,
  ) => string | null;
  setTabDirty: (tabId: string, dirty: boolean) => void;
  isTabDirty: (tabId: string) => boolean;
}

/**
 * The workspace an app gets when it supplies none: one empty tabset.
 *
 * Deliberately contains no tabs. A default tab would name a component the app
 * may never register, and render "Unknown Component" on every first run. Pass
 * `initialLayoutJson` to `ShellLayout` to choose what a first run shows.
 */
export const defaultLayout: IJsonModel = {
  global: { tabEnableClose: true, tabSetEnableMaximize: false, tabSetEnableDivide: true },
  borders: [],
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "tabset",
        weight: 100,
        children: []
      }
    ]
  }
}

const DEFAULT_STORAGE_KEY = STORAGE_KEYS.layout;

/**
 * Read a persisted layout, unwrapping the versioned envelope and running the
 * app's migration when it was saved under an older version. Bare layouts —
 * everything saved before 0.3.0 — are version 0.
 */
const readLayout = (key: string, options: LayoutOptions): IJsonModel | null => {
  const stored = readStoredJson<PersistedLayout | IJsonModel>(key);
  if (!stored || typeof stored !== 'object') return null;

  const enveloped = 'nexusLayoutVersion' in stored && 'layout' in stored;
  const fromVersion = enveloped ? Number((stored as PersistedLayout).nexusLayoutVersion) || 0 : 0;
  let json = enveloped ? (stored as PersistedLayout).layout : (stored as IJsonModel);

  const target = options.version ?? 0;
  if (options.migrate && fromVersion < target) {
    try {
      json = options.migrate(json, fromVersion);
    } catch (e) {
      console.warn('Layout migration failed; using the default layout', e);
      return null;
    }
  }
  return json;
}

const writeLayout = (key: string, model: Model, options: LayoutOptions) => {
  const envelope: PersistedLayout = {
    nexusLayoutVersion: options.version ?? 0,
    layout: model.toJson(),
  };
  writeStored(key, JSON.stringify(envelope));
}

/** Parse a layout, falling back to `fallback` when it is malformed. */
const modelFrom = (json: IJsonModel | null | undefined, fallback: IJsonModel = defaultLayout): Model => {
  if (json) {
    try {
      return Model.fromJson(json);
    } catch (e) {
      console.warn("Failed to parse layout, using default", e);
    }
  }
  return Model.fromJson(fallback);
}

/** The reuse key a tab answers to. Aliased component ids resolve first. */
export const tabReuseKey = (tab: TabNode): string | null => {
  const config = tab.getConfig();
  if (config && typeof config === 'object' && REUSE_KEY_CONFIG in config) {
    return config[REUSE_KEY_CONFIG] ?? null;
  }
  const component = tab.getComponent();
  return component ? componentRegistry.resolve(component) : null;
}

/** Every tab in the model, in visit order. */
export const allTabs = (model: Model): TabNode[] => {
  const tabs: TabNode[] = [];
  model.visitNodes((node) => {
    if (node.getType() === 'tab') tabs.push(node as TabNode);
  });
  return tabs;
}

/** Where a new tab should go: the active tabset, else the first one. */
const targetTabset = (model: Model): TabSetNode | undefined => {
  const active = model.getActiveTabset();
  if (active) return active;
  let first: TabSetNode | undefined;
  model.visitNodes((node) => {
    if (!first && node.getType() === 'tabset') first = node as TabSetNode;
  });
  return first;
}

let tabCounter = 0;
const nextTabId = () => `nexus-tab-${Date.now().toString(36)}-${(tabCounter += 1)}`;

const initialSaved = readLayout(DEFAULT_STORAGE_KEY, {});

export const useLayoutStore = create<LayoutState>((set, get) => ({
  model: modelFrom(initialSaved),
  revision: 0,
  restored: initialSaved !== null,
  fallbackLayout: defaultLayout,
  options: {},
  dirtyTabs: new Set<string>(),
  storageKey: DEFAULT_STORAGE_KEY,
  disableLocalStorage: false,
  initLayout: (json, disableStorage) => {
    const hasJson = json && Object.keys(json).length > 0;
    set((state) => ({
      model: modelFrom(hasJson ? json : null),
      fallbackLayout: hasJson ? json : defaultLayout,
      restored: false,
      disableLocalStorage: disableStorage || false,
      revision: state.revision + 1,
    }));
  },
  setModel: (model) => {
    set((state) => ({ model, revision: state.revision + 1 }));
    if (!get().disableLocalStorage) {
      writeLayout(get().storageKey, model, get().options);
    }
  },
  resetLayout: () => {
    const { storageKey, fallbackLayout } = get();
    writeStored(storageKey, null);
    set((state) => ({
      model: modelFrom(fallbackLayout),
      restored: false,
      dirtyTabs: new Set<string>(),
      revision: state.revision + 1,
    }));
  },
  setStorageKey: (key, fallbackLayout) => {
    const saved = readLayout(key, get().options);
    set((state) => ({
      storageKey: key,
      model: modelFrom(saved ?? fallbackLayout, fallbackLayout || defaultLayout),
      fallbackLayout: fallbackLayout || defaultLayout,
      restored: saved !== null,
      revision: state.revision + 1,
    }));
  },
  setTabDirty: (tabId, dirty) => {
    set((state) => {
      const newDirtyTabs = new Set(state.dirtyTabs);
      if (dirty) {
        newDirtyTabs.add(tabId);
      } else {
        newDirtyTabs.delete(tabId);
      }
      return { dirtyTabs: newDirtyTabs };
    });
  },
  isTabDirty: (tabId) => get().dirtyTabs.has(tabId),
  addTab: (componentName, title, config, options = {}) => {
    const model = get().model;
    // An alias opens its target, so `addTab('mail')` finds the renamed Desk.
    componentName = componentRegistry.resolve(componentName);
    const reuseKey = options.reuseKey === undefined ? componentName : options.reuseKey;
    const focus = options.focus ?? true;

    if (reuseKey !== null) {
      const existing = allTabs(model).find((tab) => tabReuseKey(tab) === reuseKey);
      if (existing) {
        const id = existing.getId();
        if (config) {
          model.doAction(
            Actions.updateNodeAttributes(id, { config: { ...(existing.getConfig() ?? {}), ...config } }),
          );
        }
        if (title !== undefined && title !== existing.getName()) {
          model.doAction(Actions.renameTab(id, title));
        }
        if (focus) model.doAction(Actions.selectTab(id));
        get().setModel(model);
        return id;
      }
    }

    const location = options.location ?? 'active';
    const target =
      typeof location === 'object'
        ? (model.getNodeById(location.tabsetId) as TabSetNode | undefined) ?? targetTabset(model)
        : targetTabset(model);
    const dock =
      location === 'right' ? DockLocation.RIGHT : location === 'bottom' ? DockLocation.BOTTOM : DockLocation.CENTER;
    if (!target) {
      console.warn(`Cannot open "${componentName}": the layout has no tabset.`);
      return null;
    }

    const id = nextTabId();
    const tabConfig: Record<string, any> = { ...(config ?? {}) };
    // Only stored when it differs from the default, so a plain tab's config is
    // exactly what the caller passed.
    if (reuseKey !== componentName) tabConfig[REUSE_KEY_CONFIG] = reuseKey;

    model.doAction(
      Actions.addNode(
        { type: "tab", id, component: componentName, name: title || componentName, config: tabConfig },
        target.getId(),
        dock,
        -1,
        focus,
      ),
    );
    get().setModel(model);
    return id;
  }
}));

/**
 * Configure layout versioning and the unknown-component policy, then reload
 * the persisted layout through them.
 *
 * Call before the shell renders — `initializeShell({ layout })` does. The
 * store reads storage when it is first imported, before any app code runs,
 * so configuring afterwards re-reads it with the migration applied.
 */
export const configureLayout = (options: LayoutOptions): void => {
  const state = useLayoutStore.getState();
  useLayoutStore.setState({ options: { ...state.options, ...options } });
  if (state.disableLocalStorage) return;
  const saved = readLayout(state.storageKey, useLayoutStore.getState().options);
  if (saved) {
    useLayoutStore.setState((s) => ({ model: modelFrom(saved, s.fallbackLayout), restored: true, revision: s.revision + 1 }));
  }
}
