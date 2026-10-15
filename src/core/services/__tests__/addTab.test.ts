import { beforeEach, describe, expect, it } from 'vitest';
import { Actions, type TabNode } from 'flexlayout-react';
import {
  allTabs,
  defaultLayout,
  REUSE_KEY_CONFIG,
  useLayoutStore,
} from '../LayoutService';

/**
 * Against a real FlexLayout model, not a mock. The bug these guard against —
 * `addTab` claiming to focus an existing tab and quietly adding a second one —
 * survived because the only test that touched it mocked `addTab` away.
 */

const tabs = () => allTabs(useLayoutStore.getState().model);
const selectedId = () =>
  useLayoutStore.getState().model.getActiveTabset()?.getSelectedNode()?.getId();

beforeEach(() => {
  localStorage.clear();
  useLayoutStore.getState().initLayout(defaultLayout, true);
});

describe('defaultLayout', () => {
  it('opens no tabs, so no app sees "Unknown Component" on first run', () => {
    expect(tabs()).toHaveLength(0);
    expect((defaultLayout.borders ?? []).length).toBe(0);
  });
});

describe('addTab', () => {
  it('opens a tab and returns its id', () => {
    const id = useLayoutStore.getState().addTab('desk', 'Desk');
    expect(id).toBeTruthy();
    expect(tabs().map((t) => t.getComponent())).toEqual(['desk']);
    expect(tabs()[0].getId()).toBe(id);
    expect(tabs()[0].getName()).toBe('Desk');
  });

  it('focuses rather than duplicates a tab with the same component', () => {
    const { addTab } = useLayoutStore.getState();
    const first = addTab('desk', 'Desk');
    addTab('log', 'Log');
    expect(selectedId()).not.toBe(first);

    const again = addTab('desk', 'Desk');
    expect(again).toBe(first);
    expect(tabs()).toHaveLength(2);
    expect(selectedId()).toBe(first);
  });

  it('reuses a tab persisted before reuse keys existed', () => {
    useLayoutStore.getState().initLayout(
      {
        global: {},
        layout: {
          type: 'row',
          children: [{ type: 'tabset', children: [{ type: 'tab', id: 'old', name: 'Desk', component: 'desk' }] }],
        },
      },
      true,
    );
    expect(useLayoutStore.getState().addTab('desk')).toBe('old');
    expect(tabs()).toHaveLength(1);
  });

  it('merges config and renames when reusing', () => {
    const { addTab } = useLayoutStore.getState();
    const id = addTab('settings', 'Settings', { section: 'profile', keep: 1 })!;
    addTab('settings', 'Settings: System', { section: 'system' });

    const tab = useLayoutStore.getState().model.getNodeById(id) as TabNode;
    expect(tab.getConfig()).toEqual({ section: 'system', keep: 1 });
    expect(tab.getName()).toBe('Settings: System');
  });

  it('keys by a custom reuse key, one tab per document', () => {
    const { addTab } = useLayoutStore.getState();
    const a = addTab('editor', 'a.ts', { file: 'a.ts' }, { reuseKey: 'file:a.ts' });
    const b = addTab('editor', 'b.ts', { file: 'b.ts' }, { reuseKey: 'file:b.ts' });
    expect(a).not.toBe(b);
    expect(addTab('editor', 'a.ts', undefined, { reuseKey: 'file:a.ts' })).toBe(a);
    expect(tabs()).toHaveLength(2);

    // A plain open of the component does not grab a keyed document tab.
    const plain = addTab('editor', 'Editor');
    expect([a, b]).not.toContain(plain);
  });

  it('always opens a new tab with reuseKey null', () => {
    const { addTab } = useLayoutStore.getState();
    const a = addTab('editor', 'untitled', undefined, { reuseKey: null });
    const b = addTab('editor', 'untitled', undefined, { reuseKey: null });
    expect(a).not.toBe(b);
    // Nor does a default open reuse one of them.
    expect(addTab('editor')).not.toBe(a);
    expect(tabs()).toHaveLength(3);
  });

  it('stores the reuse key only when it differs from the component', () => {
    const { addTab, model } = useLayoutStore.getState();
    const plain = addTab('desk', 'Desk', { q: 1 })!;
    const keyed = addTab('editor', 'x', { q: 2 }, { reuseKey: 'file:x' })!;
    expect((model.getNodeById(plain) as TabNode).getConfig()).toEqual({ q: 1 });
    expect((model.getNodeById(keyed) as TabNode).getConfig()).toEqual({ q: 2, [REUSE_KEY_CONFIG]: 'file:x' });
  });

  it('does not select the tab with focus: false', () => {
    const { addTab } = useLayoutStore.getState();
    const first = addTab('desk', 'Desk');
    addTab('log', 'Log', undefined, { focus: false });
    expect(selectedId()).toBe(first);
  });

  it('still finds somewhere to open after every tab is closed', () => {
    const { addTab } = useLayoutStore.getState();
    const id = addTab('desk', 'Desk')!;
    useLayoutStore.getState().model.doAction(Actions.deleteTab(id));
    expect(tabs()).toHaveLength(0);
    expect(addTab('desk', 'Desk')).toBeTruthy();
    expect(tabs()).toHaveLength(1);
  });
});

describe('persisted layouts', () => {
  it('ignores the dialogue-mapper purge that used to run on every app', async () => {
    // A consumer's own `argument-inspector` tab used to be deleted on load.
    localStorage.setItem(
      'nexus-shell-layout',
      JSON.stringify({
        global: {},
        layout: {
          type: 'row',
          children: [{ type: 'tabset', children: [{ type: 'tab', name: 'Inspector', component: 'argument-inspector' }] }],
        },
      }),
    );
    useLayoutStore.getState().setStorageKey('nexus-shell-layout');
    expect(tabs().map((t) => t.getComponent())).toEqual(['argument-inspector']);
  });

  it('falls back to the default on a malformed saved layout', () => {
    localStorage.setItem('broken', '{not json');
    useLayoutStore.getState().setStorageKey('broken');
    expect(tabs()).toHaveLength(0);
  });
});
