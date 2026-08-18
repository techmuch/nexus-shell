import { Files, Sliders } from 'lucide-react';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  createSidebarStore,
  useInspectorStore,
  useSidebarStore,
} from '../SidebarService';

/**
 * The left and right panes are one implementation, two instances. What matters
 * is that they stay two: opening an inspector must not close the explorer.
 */

const panel = (id: string) => ({
  id,
  label: id,
  icon: id === 'files' ? Files : Sliders,
  component: () => null,
});

beforeEach(() => {
  localStorage.clear();
  useSidebarStore.setState({ activeSidebar: null, panels: [] });
  useInspectorStore.setState({ activeSidebar: null, panels: [] });
});

describe('a panel store', () => {
  it('registers panels and opens one', () => {
    const store = createSidebarStore('test-open');
    store.getState().setPanels([panel('files')]);
    store.getState().setActiveSidebar('files');

    expect(store.getState().panels).toHaveLength(1);
    expect(store.getState().activeSidebar).toBe('files');
  });

  it('toggles the open panel closed, and a different one open', () => {
    const store = createSidebarStore('test-toggle');

    store.getState().toggleSidebar('files');
    expect(store.getState().activeSidebar).toBe('files');

    store.getState().toggleSidebar('files');
    expect(store.getState().activeSidebar).toBeNull();

    store.getState().toggleSidebar('files');
    store.getState().toggleSidebar('search');
    // Toggling a *different* panel switches rather than closing.
    expect(store.getState().activeSidebar).toBe('search');
  });

  it('remembers the open panel, and forgets it when closed', () => {
    const store = createSidebarStore('test-persist');

    store.getState().setActiveSidebar('files');
    expect(localStorage.getItem('test-persist')).toBe('files');

    store.getState().setActiveSidebar(null);
    expect(localStorage.getItem('test-persist')).toBeNull();
  });

  it('restores the open panel at creation, so it does not flash closed', () => {
    localStorage.setItem('test-restore', 'search');
    expect(createSidebarStore('test-restore').getState().activeSidebar).toBe('search');
  });
});

describe('the two shell panes', () => {
  it('use separate storage keys', () => {
    useSidebarStore.getState().setActiveSidebar('files');
    useInspectorStore.getState().setActiveSidebar('properties');

    expect(localStorage.getItem('nexus-shell-sidebar')).toBe('files');
    expect(localStorage.getItem('nexus-shell-inspector')).toBe('properties');
  });

  it('open and close independently', () => {
    useSidebarStore.getState().setActiveSidebar('files');
    useInspectorStore.getState().setActiveSidebar('properties');

    // The whole point: a file tree on the left and properties on the right,
    // both at once, is how anyone actually works.
    expect(useSidebarStore.getState().activeSidebar).toBe('files');
    expect(useInspectorStore.getState().activeSidebar).toBe('properties');

    useInspectorStore.getState().toggleSidebar('properties');
    expect(useInspectorStore.getState().activeSidebar).toBeNull();
    expect(useSidebarStore.getState().activeSidebar).toBe('files');
  });

  it('keep separate panel registries', () => {
    useSidebarStore.getState().setPanels([panel('files')]);
    useInspectorStore.getState().setPanels([panel('properties')]);

    expect(useSidebarStore.getState().panels.map((p) => p.id)).toEqual(['files']);
    expect(useInspectorStore.getState().panels.map((p) => p.id)).toEqual(['properties']);
  });
});
