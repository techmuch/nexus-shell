import { Terminal } from 'lucide-react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { togglePanel } from '../Boot';
import { componentRegistry } from '../registry/ComponentRegistry';
import { PANE_SIDES, paneStore, useLeftPaneStore, useRightPaneStore, useBottomPaneStore } from '../services/PaneService';
import { useLayoutStore } from '../services/LayoutService';

/**
 * The toggle commands used to flip a boolean on a store that owned one fixed
 * slot. Now that chat and terminal go wherever they are registered, the command
 * has to find them.
 */

const panel = (id: string) => ({
  id,
  label: id,
  icon: Terminal,
  component: () => null,
});

beforeEach(() => {
  localStorage.clear();
  PANE_SIDES.forEach((side) => paneStore(side).setState({ activePanel: null, panels: [] }));
  vi.restoreAllMocks();
});

describe('togglePanel', () => {
  it('toggles a panel on the left rail', () => {
    useLeftPaneStore.getState().setPanels([panel('terminal')]);

    expect(togglePanel('terminal')).toBe(true);
    expect(useLeftPaneStore.getState().activePanel).toBe('terminal');

    togglePanel('terminal');
    expect(useLeftPaneStore.getState().activePanel).toBeNull();
  });

  it('toggles a panel in the bottom drawer', () => {
    useBottomPaneStore.getState().setPanels([panel('terminal')]);

    expect(togglePanel('terminal')).toBe(true);
    expect(useBottomPaneStore.getState().activePanel).toBe('terminal');
  });

  it('toggles a panel on the right rail', () => {
    useRightPaneStore.getState().setPanels([panel('chat')]);

    expect(togglePanel('chat')).toBe(true);
    expect(useRightPaneStore.getState().activePanel).toBe('chat');
    // The left rail is untouched.
    expect(useLeftPaneStore.getState().activePanel).toBeNull();
  });

  it('prefers the rail it is actually registered on', () => {
    // Same id registered right only — the left rail must not swallow it.
    useLeftPaneStore.getState().setPanels([panel('files')]);
    useRightPaneStore.getState().setPanels([panel('chat')]);

    togglePanel('chat');
    expect(useRightPaneStore.getState().activePanel).toBe('chat');
    expect(useLeftPaneStore.getState().activePanel).toBeNull();
  });

  it('opens a registered tab when the id is not a panel', () => {
    const addTab = vi.spyOn(useLayoutStore.getState(), 'addTab').mockImplementation(() => {});
    componentRegistry.register('terminal-tab', () => null);

    expect(togglePanel('terminal-tab')).toBe(true);
    expect(addTab).toHaveBeenCalledWith('terminal-tab');
  });

  it('reports false when the id is registered nowhere', () => {
    // Distinguishable from "toggled", so a caller can fall back or warn rather
    // than silently doing nothing.
    expect(togglePanel('nothing-here')).toBe(false);
  });
});
