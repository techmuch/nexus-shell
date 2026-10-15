import { describe, expect, it } from 'vitest';
import {
  commandRegistry,
  componentRegistry,
  createTestWorkspace,
  menuRegistry,
  paneStore,
  resetShell,
  useChatStore,
  useLayoutStore,
  useModalStore,
  useThemeStore,
  useUserProfileStore,
  workspace,
} from '../index';

/** The helpers apps use to keep one test from leaking into the next. */
describe('resetShell', () => {
  it('returns every store and registry to its initial state', () => {
    commandRegistry.registerCommand({ id: 'x', label: 'X', execute: () => {} });
    menuRegistry.setMenus({ Tools: [{ id: 't', label: 'T' }] });
    paneStore('left').getState().setPanels([{ id: 'p', label: 'P', icon: (() => null) as any, component: () => null }]);
    paneStore('left').getState().setActivePanel('p');
    useChatStore.getState().addMessage({ role: 'user', text: 'hi' });
    useModalStore.getState().openAlert('open');
    useThemeStore.getState().setTheme('dark');
    useUserProfileStore.getState().updateProfile({ name: 'Ada' });
    componentRegistry.register('keep-me', () => null);
    workspace.open('keep-me');

    resetShell();

    expect(commandRegistry.getCommands()).toHaveLength(0);
    expect(menuRegistry.getAllMenus()).toEqual({});
    expect(paneStore('left').getState().panels).toEqual([]);
    expect(paneStore('left').getState().activePanel).toBeNull();
    expect(useChatStore.getState().messages).toEqual([]);
    expect(useModalStore.getState().isOpen).toBe(false);
    expect(useThemeStore.getState().theme).toBe('light');
    expect(useUserProfileStore.getState().name).toBe('Guest');
    expect(workspace.snapshot().tabs).toEqual([]);
    expect(useLayoutStore.getState().disableLocalStorage).toBe(true);
    expect(localStorage.getItem('nexus-shell-theme')).toBeNull();
    // Components survive by default...
    expect(componentRegistry.has('keep-me')).toBe(true);
    // ...and go when asked.
    resetShell({ components: true });
    expect(componentRegistry.has('keep-me')).toBe(false);
  });
});

describe('createTestWorkspace', () => {
  it('registers components and loads a layout into a real, headless workspace', () => {
    resetShell();
    const Desk = () => null;
    const ws = createTestWorkspace({
      components: { 'tw-desk': Desk },
      layout: {
        global: {},
        layout: { type: 'row', children: [{ type: 'tabset', children: [{ type: 'tab', name: 'Desk', component: 'tw-desk' }] }] },
      },
    });
    expect(componentRegistry.get('tw-desk')).toBe(Desk);
    expect(ws.find('tw-desk')).toHaveLength(1);
    ws.open('tw-desk');
    expect(ws.find('tw-desk')).toHaveLength(1);
  });
});
