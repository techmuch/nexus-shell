import { Terminal } from 'lucide-react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { togglePanel } from '../Boot';
import { componentRegistry } from '../registry/ComponentRegistry';
import { useInspectorStore, useSidebarStore } from '../services/SidebarService';
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
  useSidebarStore.setState({ activeSidebar: null, panels: [] });
  useInspectorStore.setState({ activeSidebar: null, panels: [] });
  vi.restoreAllMocks();
});

describe('togglePanel', () => {
  it('toggles a panel on the left rail', () => {
    useSidebarStore.getState().setPanels([panel('terminal')]);

    expect(togglePanel('terminal')).toBe(true);
    expect(useSidebarStore.getState().activeSidebar).toBe('terminal');

    togglePanel('terminal');
    expect(useSidebarStore.getState().activeSidebar).toBeNull();
  });

  it('toggles a panel on the right rail', () => {
    useInspectorStore.getState().setPanels([panel('chat')]);

    expect(togglePanel('chat')).toBe(true);
    expect(useInspectorStore.getState().activeSidebar).toBe('chat');
    // The left rail is untouched.
    expect(useSidebarStore.getState().activeSidebar).toBeNull();
  });

  it('prefers the rail it is actually registered on', () => {
    // Same id registered right only — the left rail must not swallow it.
    useSidebarStore.getState().setPanels([panel('files')]);
    useInspectorStore.getState().setPanels([panel('chat')]);

    togglePanel('chat');
    expect(useInspectorStore.getState().activeSidebar).toBe('chat');
    expect(useSidebarStore.getState().activeSidebar).toBeNull();
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
