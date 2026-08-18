import { Files, Sliders, Terminal } from 'lucide-react';
import { beforeEach, describe, expect, it } from 'vitest';
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
