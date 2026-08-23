import { Files, Sliders, Terminal } from 'lucide-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PANE_SIDES,
  createPaneStore,
  paneStore,
  setPanels,
  useBottomPaneStore,
  useLeftPaneStore,
  useRightPaneStore,
  type IPanel,
} from '../PaneService';

/**
 * Three edges, one implementation. What matters is that they stay three:
 * opening an inspector must not close the explorer, and a terminal in the
 * bottom drawer must not care about either.
 */

const panel = (id: string, side?: IPanel['side'], align?: IPanel['align']): IPanel => ({
  id,
  label: id,
  icon: id === 'files' ? Files : id === 'terminal' ? Terminal : Sliders,
  component: () => null,
  side,
  align,
});

beforeEach(() => {
  localStorage.clear();
  PANE_SIDES.forEach((side) => {
    paneStore(side).setState({ activePanel: null, panels: [] });
  });
});

describe('a pane store', () => {
  it('registers panels and opens one', () => {
    const store = createPaneStore('test-open');
    store.getState().setPanels([panel('files')]);
    store.getState().setActivePanel('files');

    expect(store.getState().panels).toHaveLength(1);
    expect(store.getState().activePanel).toBe('files');
  });

  it('toggles the open panel closed, and a different one open', () => {
    const store = createPaneStore('test-toggle');

    store.getState().togglePanel('files');
    expect(store.getState().activePanel).toBe('files');

    store.getState().togglePanel('files');
    expect(store.getState().activePanel).toBeNull();

    store.getState().togglePanel('files');
    store.getState().togglePanel('search');
    // Toggling a *different* panel switches rather than closing.
    expect(store.getState().activePanel).toBe('search');
  });

  it('remembers the open panel, and forgets it when closed', () => {
    const store = createPaneStore('test-persist');

    store.getState().setActivePanel('files');
    expect(localStorage.getItem('test-persist')).toBe('files');

    store.getState().setActivePanel(null);
    expect(localStorage.getItem('test-persist')).toBeNull();
  });

  it('restores the open panel at creation, so it does not flash closed', () => {
    localStorage.setItem('test-restore', 'search');
    expect(createPaneStore('test-restore').getState().activePanel).toBe('search');
  });
});

describe('paneStore', () => {
  it('resolves each side to its own store', () => {
    expect(paneStore('left')).toBe(useLeftPaneStore);
    expect(paneStore('right')).toBe(useRightPaneStore);
    expect(paneStore('bottom')).toBe(useBottomPaneStore);
  });

  it('gives every side its own storage key', () => {
    PANE_SIDES.forEach((side) => paneStore(side).getState().setActivePanel(`p-${side}`));

    expect(localStorage.getItem('nexus-shell-pane-left')).toBe('p-left');
    expect(localStorage.getItem('nexus-shell-pane-right')).toBe('p-right');
    expect(localStorage.getItem('nexus-shell-pane-bottom')).toBe('p-bottom');
  });
});

describe('setPanels routes by side', () => {
  it('sends each panel to the edge it declares, defaulting to left', () => {
    setPanels([
      panel('files'),
      panel('props', 'right'),
      panel('terminal', 'bottom'),
    ]);

    expect(useLeftPaneStore.getState().panels.map((p) => p.id)).toEqual(['files']);
    expect(useRightPaneStore.getState().panels.map((p) => p.id)).toEqual(['props']);
    expect(useBottomPaneStore.getState().panels.map((p) => p.id)).toEqual(['terminal']);
  });

  it('clears an edge that has no panels in the new list', () => {
    setPanels([panel('props', 'right')]);
    expect(useRightPaneStore.getState().panels).toHaveLength(1);

    // Setting rather than appending, so removing a panel actually removes it.
    setPanels([panel('files')]);
    expect(useRightPaneStore.getState().panels).toHaveLength(0);
    expect(useLeftPaneStore.getState().panels).toHaveLength(1);
  });

  it('keeps alignment on the panel, so a rail can group without knowing ids', () => {
    setPanels([panel('files'), panel('settings', 'left', 'end')]);

    const panels = useLeftPaneStore.getState().panels;
    expect(panels.find((p) => p.id === 'settings')?.align).toBe('end');
    // Nothing reserved: 'settings' is an ordinary id with ordinary data.
    expect(panels.find((p) => p.id === 'files')?.align).toBeUndefined();
  });
});

describe('a restored panel that no longer exists', () => {
  it('is cleared once the real panels register', () => {
    localStorage.setItem('test-stale', 'panel-from-an-older-release');
    const store = createPaneStore('test-stale');
    expect(store.getState().activePanel).toBe('panel-from-an-older-release');

    // Registration is the first moment the id can be checked against reality.
    store.getState().setPanels([panel('files')]);

    // Otherwise the pane opens onto "Panel content not found" on first paint.
    expect(store.getState().activePanel).toBeNull();
    expect(localStorage.getItem('test-stale')).toBeNull();
  });

  it('survives an empty registration, which means "not configured yet"', () => {
    localStorage.setItem('test-empty', 'files');
    const store = createPaneStore('test-empty');

    // An app that registers in two steps must not lose its restored state.
    store.getState().setPanels([]);
    expect(store.getState().activePanel).toBe('files');

    store.getState().setPanels([panel('files')]);
    expect(store.getState().activePanel).toBe('files');
  });

  it('leaves a still-valid id alone', () => {
    localStorage.setItem('test-valid', 'files');
    const store = createPaneStore('test-valid');

    store.getState().setPanels([panel('files'), panel('search')]);
    expect(store.getState().activePanel).toBe('files');
  });
});

describe('without usable localStorage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /**
   * Stores are created at module scope, so an unguarded `localStorage` read
   * throws on import — breaking SSR and any test file without jsdom. Private
   * mode and blocked site data reach the same place from a real browser.
   */
  it('creates a store rather than throwing', () => {
    const throwing = {
      getItem: () => {
        throw new Error('SecurityError: storage is disabled');
      },
      setItem: () => {
        throw new Error('SecurityError: storage is disabled');
      },
      removeItem: () => {
        throw new Error('SecurityError: storage is disabled');
      },
    };
    vi.stubGlobal('localStorage', throwing);

    let store!: ReturnType<typeof createPaneStore>;
    expect(() => {
      store = createPaneStore('test-no-storage');
    }).not.toThrow();

    // The pane simply starts closed.
    expect(store.getState().activePanel).toBeNull();
  });

  it('still opens and closes panels in memory', () => {
    const throwing = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    vi.stubGlobal('localStorage', throwing);

    const store = createPaneStore('test-write-fails');

    // Persistence is best-effort; the session must keep working without it.
    expect(() => store.getState().setActivePanel('files')).not.toThrow();
    expect(store.getState().activePanel).toBe('files');

    expect(() => store.getState().togglePanel('files')).not.toThrow();
    expect(store.getState().activePanel).toBeNull();
  });
});

describe('the three edges', () => {
  it('open and close independently', () => {
    setPanels([panel('files'), panel('props', 'right'), panel('terminal', 'bottom')]);

    useLeftPaneStore.getState().setActivePanel('files');
    useRightPaneStore.getState().setActivePanel('props');
    useBottomPaneStore.getState().setActivePanel('terminal');

    // A file tree, an inspector and a terminal at once is the normal case.
    expect(useLeftPaneStore.getState().activePanel).toBe('files');
    expect(useRightPaneStore.getState().activePanel).toBe('props');
    expect(useBottomPaneStore.getState().activePanel).toBe('terminal');

    useRightPaneStore.getState().togglePanel('props');
    expect(useRightPaneStore.getState().activePanel).toBeNull();
    expect(useLeftPaneStore.getState().activePanel).toBe('files');
    expect(useBottomPaneStore.getState().activePanel).toBe('terminal');
  });
});
