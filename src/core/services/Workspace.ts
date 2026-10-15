import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
} from 'react';
import { Actions, type Model, type TabNode, type TabSetNode } from 'flexlayout-react';
import { componentRegistry } from '../registry/ComponentRegistry';
import {
  allTabs,
  REUSE_KEY_CONFIG,
  useLayoutStore,
  type AddTabOptions,
} from './LayoutService';
import { useModalStore } from './ModalStoreService';

/**
 * The docking workspace, as an API.
 *
 * Everything an application does with tabs — open one or bring it forward,
 * close it, rename it, point it at something new, ask what is on screen —
 * without learning FlexLayout's model or its action wire format. Every
 * FlexLayout call the shell makes on an app's behalf lives in this file, so a
 * FlexLayout upgrade is absorbed here rather than in every consumer.
 *
 * Usable outside React, like the registries. `useLayoutStore().model` stays
 * exported as an escape hatch, but is not a stable API.
 */

/** A tab, as the workspace describes it. */
export interface TabRef {
  /** FlexLayout node id. Stable for the life of the tab. */
  id: string;
  /** Registered component id (aliases resolved). */
  component: string;
  /** Text on the tab. */
  title: string;
  /** The tab's config, without the shell's own bookkeeping keys. */
  config: Record<string, unknown>;
  /** The tabset holding it. */
  tabsetId: string;
  /** Selected within its tabset, so currently rendered. */
  selected: boolean;
  /** Selected within the active tabset: the tab the user is working in. */
  active: boolean;
  /** Marked dirty with `setDirty` / `useLayoutStore().setTabDirty`. */
  dirty: boolean;
}

/** What is open, and which tab is active. */
export interface WorkspaceSnapshot {
  tabs: TabRef[];
  /** Id of the active tab, or `null` when nothing is open. */
  active: string | null;
}

/** Options for {@link workspace.open}. */
export interface OpenTabOptions extends AddTabOptions {
  /** Tab title. Defaults to the component id for a new tab. */
  title?: string;
  /** Config for a new tab, or merged into a reused tab's config. */
  config?: Record<string, unknown>;
}

const model = (): Model => useLayoutStore.getState().model;

const cleanConfig = (tab: TabNode): Record<string, unknown> => {
  const { [REUSE_KEY_CONFIG]: _reuseKey, ...config } = (tab.getConfig() ?? {}) as Record<string, unknown>;
  return config;
};

const selectedIn = (tab: TabNode): boolean => {
  const parent = tab.getParent() as TabSetNode | undefined;
  return parent?.getType() === 'tabset' && parent.getSelectedNode() === tab;
};

const activeTab = (m: Model): TabNode | undefined => {
  const node = m.getActiveTabset()?.getSelectedNode();
  return node?.getType() === 'tab' ? (node as TabNode) : undefined;
};

const describe = (tab: TabNode, active: TabNode | undefined): TabRef => ({
  id: tab.getId(),
  component: componentRegistry.resolve(tab.getComponent() ?? ''),
  title: tab.getName(),
  config: cleanConfig(tab),
  tabsetId: tab.getParent()?.getId() ?? '',
  selected: selectedIn(tab),
  active: tab === active,
  dirty: useLayoutStore.getState().isTabDirty(tab.getId()),
});

const tabById = (id: string): TabNode | undefined => {
  const node = model().getNodeById(id);
  return node?.getType() === 'tab' ? (node as TabNode) : undefined;
};

/* ------------------------------------------------------------------------ */
/* Change and activation events                                             */
/* ------------------------------------------------------------------------ */

type ActivateListener = (tab: TabRef) => void;
const activateListeners = new Set<ActivateListener>();

/** The active tab id the last time anyone looked, to detect changes. */
let lastActive: string | null = null;
/** While > 0, an explicit open/focus is in progress and will emit itself. */
let explicit = 0;

const emitActivate = (id: string | null) => {
  lastActive = id;
  if (!id) return;
  const tab = tabById(id);
  if (!tab) return;
  const ref = describe(tab, activeTab(model()));
  activateListeners.forEach((l) => l(ref));
};

// Activation the user caused — a click on a tab, a drag — arrives as a
// layout change. Explicit `open`/`focus` calls emit for themselves, even
// when the tab was already active, so "bring this forward and focus its
// input" works the second time too.
useLayoutStore.subscribe(() => {
  if (explicit > 0) return;
  const id = activeTab(model())?.getId() ?? null;
  if (id !== lastActive) emitActivate(id);
});

const explicitly = <T>(fn: () => T): T => {
  explicit += 1;
  try {
    return fn();
  } finally {
    explicit -= 1;
  }
};

/* ------------------------------------------------------------------------ */
/* Snapshot, cached per revision so hooks can subscribe to it               */
/* ------------------------------------------------------------------------ */

let cached: { revision: number; dirty: Set<string>; model: Model; snapshot: WorkspaceSnapshot } | null = null;

const snapshot = (): WorkspaceSnapshot => {
  const { revision, dirtyTabs, model: m } = useLayoutStore.getState();
  if (cached && cached.revision === revision && cached.dirty === dirtyTabs && cached.model === m) {
    return cached.snapshot;
  }
  const active = activeTab(m);
  const value: WorkspaceSnapshot = {
    tabs: allTabs(m).map((t) => describe(t, active)),
    active: active?.getId() ?? null,
  };
  cached = { revision, dirty: dirtyTabs, model: m, snapshot: value };
  return value;
};

/* ------------------------------------------------------------------------ */
/* The facade                                                               */
/* ------------------------------------------------------------------------ */

export const workspace = {
  /**
   * Open a tab, or bring forward the one already open with the same reuse
   * key (by default, the same component). See {@link AddTabOptions}.
   *
   * @returns The tab id, or `null` when the layout has nowhere to put it.
   */
  open(component: string, options: OpenTabOptions = {}): string | null {
    const { title, config, ...rest } = options;
    const focus = rest.focus ?? true;
    const id = explicitly(() =>
      useLayoutStore.getState().addTab(component, title, config as Record<string, any> | undefined, rest),
    );
    if (id && focus) emitActivate(id);
    return id;
  },

  /** Select a tab and make its tabset active. `false` if no such tab. */
  focus(tabId: string): boolean {
    if (!tabById(tabId)) return false;
    explicitly(() => {
      model().doAction(Actions.selectTab(tabId));
      useLayoutStore.getState().setModel(model());
    });
    emitActivate(tabId);
    return true;
  },

  /**
   * Close a tab. A dirty tab asks first, through the shell's modal, unless
   * `force` is set.
   *
   * @returns Whether the tab was closed.
   */
  async close(tabId: string, options: { force?: boolean } = {}): Promise<boolean> {
    const tab = tabById(tabId);
    if (!tab) return false;
    const store = useLayoutStore.getState();
    if (!options.force && store.isTabDirty(tabId)) {
      const ok = await useModalStore
        .getState()
        .openConfirm(`Tab "${tab.getName()}" has unsaved changes. Are you sure you want to close it?`);
      if (!ok || !tabById(tabId)) return false;
    }
    store.setTabDirty(tabId, false);
    model().doAction(Actions.deleteTab(tabId));
    useLayoutStore.getState().setModel(model());
    return true;
  },

  /** Change a tab's title. */
  rename(tabId: string, title: string): void {
    workspace.update(tabId, { title });
  },

  /**
   * Change a tab in place. `config` is merged into the existing config;
   * `component` swaps what the tab renders.
   */
  update(
    tabId: string,
    patch: { title?: string; config?: Record<string, unknown>; component?: string },
  ): void {
    const tab = tabById(tabId);
    if (!tab) return;
    const m = model();
    if (patch.title !== undefined && patch.title !== tab.getName()) {
      m.doAction(Actions.renameTab(tabId, patch.title));
    }
    const attrs: Record<string, unknown> = {};
    if (patch.config) attrs.config = { ...(tab.getConfig() ?? {}), ...patch.config };
    if (patch.component) attrs.component = patch.component;
    if (Object.keys(attrs).length) m.doAction(Actions.updateNodeAttributes(tabId, attrs));
    useLayoutStore.getState().setModel(m);
  },

  /** Tabs showing `component` (aliases resolved), or matching a predicate. */
  find(match: string | ((tab: TabRef) => boolean)): TabRef[] {
    const tabs = snapshot().tabs;
    if (typeof match === 'function') return tabs.filter(match);
    const component = componentRegistry.resolve(match);
    return tabs.filter((t) => t.component === component);
  },

  /** A tab by id. */
  get(tabId: string): TabRef | undefined {
    return snapshot().tabs.find((t) => t.id === tabId);
  },

  /** Whether a tab showing `component` is open. */
  isOpen(component: string): boolean {
    return workspace.find(component).length > 0;
  },

  /** The tab the user is working in, or `null`. */
  active(): TabRef | null {
    const s = snapshot();
    return s.tabs.find((t) => t.id === s.active) ?? null;
  },

  /** Every open tab and which one is active. Cheap: cached per change. */
  snapshot,

  /**
   * Clear the saved layout and return to the app's initial layout (its
   * `initialLayoutJson`, or the empty default). For a "Reset Layout" button.
   */
  reset(): void {
    useLayoutStore.getState().resetLayout();
  },

  /**
   * Rewrite tabs saved under an aliased component id to the id it now names,
   * retitling them when the alias says to. `ShellLayout` runs this on mount.
   *
   * @returns How many tabs were rewritten.
   */
  normalizeAliases(): number {
    let count = 0;
    const m = model();
    for (const tab of allTabs(m)) {
      const component = tab.getComponent();
      const alias = component ? componentRegistry.getAlias(component) : undefined;
      if (!alias) continue;
      m.doAction(Actions.updateNodeAttributes(tab.getId(), { component: alias.to }));
      if (alias.title !== undefined) m.doAction(Actions.renameTab(tab.getId(), alias.title));
      count += 1;
    }
    if (count) useLayoutStore.getState().setModel(m);
    return count;
  },

  /**
   * Close every tab whose component is not registered. Used by the `'drop'`
   * unknown-component policy.
   *
   * @returns How many tabs were closed.
   */
  dropUnknown(): number {
    const m = model();
    const unknown = allTabs(m).filter((t) => !componentRegistry.has(t.getComponent() ?? ''));
    unknown.forEach((t) => m.doAction(Actions.deleteTab(t.getId())));
    if (unknown.length) useLayoutStore.getState().setModel(m);
    return unknown.length;
  },

  /** Run `listener` after every layout change. Returns an unsubscribe. */
  onDidChange(listener: (snapshot: WorkspaceSnapshot) => void): () => void {
    let previous = snapshot();
    return useLayoutStore.subscribe(() => {
      const next = snapshot();
      if (next !== previous) {
        previous = next;
        listener(next);
      }
    });
  },

  /**
   * Run `listener` whenever a tab becomes the active one, or is explicitly
   * opened or focused while already active. Returns an unsubscribe.
   */
  onDidActivate(listener: (tab: TabRef) => void): () => void {
    activateListeners.add(listener);
    return () => {
      activateListeners.delete(listener);
    };
  },
};

/* ------------------------------------------------------------------------ */
/* Hooks                                                                    */
/* ------------------------------------------------------------------------ */

const subscribe = (onChange: () => void) => useLayoutStore.subscribe(onChange);

/** The workspace snapshot, re-rendering on every layout change. */
export const useWorkspaceSnapshot = (): WorkspaceSnapshot =>
  useSyncExternalStore(subscribe, snapshot, snapshot);

/** Identifies the tab a component is rendered in. Provided by `ShellLayout`. */
export const TabContext = createContext<{ id: string } | null>(null);

/** Options for {@link useTab}. */
export interface UseTabOptions {
  /**
   * Called when this tab becomes the active tab — clicked, opened, or
   * explicitly brought forward — and once on mount if it mounts active. The
   * place to focus an input.
   */
  onActivate?: (tab: TabRef) => void;
}

/** What {@link useTab} returns. Outside a tab, `id` is `null` and setters no-op. */
export interface UseTabResult<C> {
  id: string | null;
  title: string;
  config: C;
  selected: boolean;
  active: boolean;
  dirty: boolean;
  setTitle: (title: string) => void;
  /** Merge into this tab's config. Re-renders the tab with the new props. */
  setConfig: (patch: Partial<C>) => void;
  setDirty: (dirty: boolean) => void;
  close: (options?: { force?: boolean }) => Promise<boolean>;
}

/**
 * A tab component's view of the tab it is rendered in.
 *
 * @example
 * ```tsx
 * const Desk = () => {
 *   const input = useRef<HTMLTextAreaElement>(null);
 *   const { config } = useTab<{ query?: string }>({
 *     onActivate: () => input.current?.focus(),
 *   });
 *   ...
 * };
 * ```
 */
export const useTab = <C extends Record<string, unknown> = Record<string, unknown>>(
  options: UseTabOptions = {},
): UseTabResult<C> => {
  const id = useContext(TabContext)?.id ?? null;
  const snap = useWorkspaceSnapshot();
  const tab = id ? snap.tabs.find((t) => t.id === id) : undefined;

  const onActivate = useRef(options.onActivate);
  onActivate.current = options.onActivate;

  useEffect(() => {
    if (!id) return;
    const current = workspace.active();
    if (current?.id === id) onActivate.current?.(current);
    return workspace.onDidActivate((t) => {
      if (t.id === id) onActivate.current?.(t);
    });
  }, [id]);

  return {
    id,
    title: tab?.title ?? '',
    config: (tab?.config ?? {}) as C,
    selected: tab?.selected ?? false,
    active: tab?.active ?? false,
    dirty: tab?.dirty ?? false,
    setTitle: (title) => id && workspace.rename(id, title),
    setConfig: (patch) => id && workspace.update(id, { config: patch as Record<string, unknown> }),
    setDirty: (dirty) => id && useLayoutStore.getState().setTabDirty(id, dirty),
    close: (opts) => (id ? workspace.close(id, opts) : Promise.resolve(false)),
  };
};
