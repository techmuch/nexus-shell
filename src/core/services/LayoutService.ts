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
}

interface LayoutState {
  model: Model;
  dirtyTabs: Set<string>; // Set of tab IDs with unsaved changes
  storageKey: string;     // The currently active localStorage key
  disableLocalStorage: boolean;
  initLayout: (json: any, disableStorage?: boolean) => void;
  setModel: (model: Model) => void;
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

/** The reuse key a tab answers to. */
export const tabReuseKey = (tab: TabNode): string | null => {
  const config = tab.getConfig();
  if (config && typeof config === 'object' && REUSE_KEY_CONFIG in config) {
    return config[REUSE_KEY_CONFIG] ?? null;
  }
  return tab.getComponent() ?? null;
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

export const useLayoutStore = create<LayoutState>((set, get) => ({
  model: modelFrom(readStoredJson<IJsonModel>(DEFAULT_STORAGE_KEY)),
  dirtyTabs: new Set<string>(),
  storageKey: DEFAULT_STORAGE_KEY,
  disableLocalStorage: false,
  initLayout: (json, disableStorage) => {
    const hasJson = json && Object.keys(json).length > 0;
    set({ model: modelFrom(hasJson ? json : null), disableLocalStorage: disableStorage || false });
  },
  setModel: (model) => {
    set({ model });
    if (!get().disableLocalStorage) {
      writeStored(get().storageKey, JSON.stringify(model.toJson()));
    }
  },
  setStorageKey: (key, fallbackLayout) => {
    const saved = readStoredJson<IJsonModel>(key);
    set({ storageKey: key, model: modelFrom(saved ?? fallbackLayout, fallbackLayout || defaultLayout) });
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
        return id;
      }
    }

    const target = targetTabset(model);
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
        DockLocation.CENTER,
        -1,
        focus,
      ),
    );
    return id;
  }
}));
