import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IJsonModel } from 'flexlayout-react';
import { workspace } from '../Workspace';
import { configureLayout, defaultLayout, useLayoutStore } from '../LayoutService';
import { useModalStore } from '../ModalStoreService';
import { componentRegistry } from '../../registry/ComponentRegistry';

/**
 * The workspace facade, headless: a real FlexLayout model with no view. This
 * is what an app's tab logic runs against in its own tests, so these drive the
 * public API only.
 */

const Noop = () => null;
['ws-desk', 'ws-log', 'ws-viewer', 'ws-settings'].forEach((id) => componentRegistry.register(id, Noop));

const one = (component: string, name = component, extra: Record<string, unknown> = {}): IJsonModel => ({
  global: {},
  layout: { type: 'row', children: [{ type: 'tabset', children: [{ type: 'tab', name, component, ...extra }] }] },
});

beforeEach(() => {
  localStorage.clear();
  useLayoutStore.setState({ options: {}, storageKey: 'nexus-shell-layout' });
  useLayoutStore.getState().initLayout(defaultLayout, false);
});

afterEach(() => {
  useModalStore.getState().close();
});

describe('workspace.open / focus / find', () => {
  it('opens, reports, and brings forward without duplicating', () => {
    const desk = workspace.open('ws-desk', { title: 'Desk' })!;
    const log = workspace.open('ws-log', { title: 'Log' })!;
    expect(workspace.active()?.id).toBe(log);

    expect(workspace.open('ws-desk')).toBe(desk);
    expect(workspace.active()?.id).toBe(desk);
    expect(workspace.snapshot().tabs.map((t) => t.component)).toEqual(['ws-desk', 'ws-log']);
    expect(workspace.isOpen('ws-log')).toBe(true);
    expect(workspace.isOpen('ws-viewer')).toBe(false);
  });

  it('describes tabs without the shell bookkeeping in config', () => {
    const id = workspace.open('ws-viewer', { title: 'File', config: { kind: 'file' }, reuseKey: 'viewer:file' })!;
    expect(workspace.get(id)).toMatchObject({
      id,
      component: 'ws-viewer',
      title: 'File',
      config: { kind: 'file' },
      selected: true,
      active: true,
      dirty: false,
    });
  });

  it('focuses by id, and reports unknown ids', () => {
    const desk = workspace.open('ws-desk')!;
    workspace.open('ws-log');
    expect(workspace.focus(desk)).toBe(true);
    expect(workspace.active()?.id).toBe(desk);
    expect(workspace.focus('nope')).toBe(false);
  });

  it('finds by predicate', () => {
    workspace.open('ws-viewer', { reuseKey: 'a', config: { kind: 'contact' } });
    workspace.open('ws-viewer', { reuseKey: 'b', config: { kind: 'file' } });
    expect(workspace.find((t) => t.config.kind === 'file')).toHaveLength(1);
    expect(workspace.find('ws-viewer')).toHaveLength(2);
  });

  it('splits to the right or bottom of the active tabset', () => {
    workspace.open('ws-desk');
    const right = workspace.open('ws-log', { location: 'right' })!;
    const tabs = workspace.snapshot().tabs;
    expect(new Set(tabs.map((t) => t.tabsetId)).size).toBe(2);
    expect(workspace.get(right)?.active).toBe(true);
  });

  it('opens into a named tabset', () => {
    workspace.open('ws-desk');
    workspace.open('ws-log', { location: 'right' });
    const deskSet = workspace.find('ws-desk')[0].tabsetId;
    const id = workspace.open('ws-settings', { location: { tabsetId: deskSet } })!;
    expect(workspace.get(id)?.tabsetId).toBe(deskSet);
  });
});

describe('workspace.update / rename / close', () => {
  it('renames, merges config and swaps component in place', () => {
    const id = workspace.open('ws-viewer', { title: 'Viewer', config: { a: 1 } })!;
    workspace.rename(id, 'Message');
    workspace.update(id, { config: { b: 2 }, component: 'ws-desk' });
    expect(workspace.get(id)).toMatchObject({ title: 'Message', config: { a: 1, b: 2 }, component: 'ws-desk' });
  });

  it('closes a clean tab immediately', async () => {
    const id = workspace.open('ws-desk')!;
    await expect(workspace.close(id)).resolves.toBe(true);
    expect(workspace.snapshot().tabs).toHaveLength(0);
  });

  it('asks before closing a dirty tab, and keeps it on cancel', async () => {
    const id = workspace.open('ws-desk')!;
    useLayoutStore.getState().setTabDirty(id, true);
    expect(workspace.get(id)?.dirty).toBe(true);

    const pending = workspace.close(id);
    expect(useModalStore.getState().isOpen).toBe(true);
    useModalStore.getState().close(false);
    await expect(pending).resolves.toBe(false);
    expect(workspace.get(id)).toBeDefined();

    const again = workspace.close(id);
    useModalStore.getState().close(true);
    await expect(again).resolves.toBe(true);
    expect(workspace.get(id)).toBeUndefined();
  });

  it('closes a dirty tab without asking when forced', async () => {
    const id = workspace.open('ws-desk')!;
    useLayoutStore.getState().setTabDirty(id, true);
    await expect(workspace.close(id, { force: true })).resolves.toBe(true);
    expect(useModalStore.getState().isOpen).toBe(false);
  });
});

describe('workspace events', () => {
  it('reports changes, once per change', () => {
    const seen: number[] = [];
    const off = workspace.onDidChange((s) => seen.push(s.tabs.length));
    workspace.open('ws-desk');
    workspace.open('ws-log');
    off();
    workspace.open('ws-viewer');
    expect(seen[seen.length - 1]).toBe(2);
    expect(seen).not.toContain(3);
  });

  it('reports activation on open, on focus, and on explicit re-open', () => {
    const activated: string[] = [];
    const off = workspace.onDidActivate((t) => activated.push(t.component));
    workspace.open('ws-desk');
    workspace.open('ws-log');
    workspace.open('ws-log'); // already active: still an explicit activation
    workspace.focus(workspace.find('ws-desk')[0].id);
    off();
    expect(activated).toEqual(['ws-desk', 'ws-log', 'ws-log', 'ws-desk']);
  });

  it('does not report activation for a background open', () => {
    const activated: string[] = [];
    workspace.open('ws-desk');
    const off = workspace.onDidActivate((t) => activated.push(t.component));
    workspace.open('ws-log', { focus: false });
    off();
    expect(activated).toEqual([]);
  });

  it('caches the snapshot until something changes', () => {
    workspace.open('ws-desk');
    const a = workspace.snapshot();
    expect(workspace.snapshot()).toBe(a);
    workspace.open('ws-log');
    expect(workspace.snapshot()).not.toBe(a);
  });
});

describe('workspace.reset', () => {
  it('clears storage and returns to the initial layout', () => {
    useLayoutStore.getState().initLayout(one('ws-desk', 'Desk'), false);
    workspace.open('ws-log');
    expect(localStorage.getItem('nexus-shell-layout')).not.toBeNull();

    workspace.reset();
    expect(localStorage.getItem('nexus-shell-layout')).toBeNull();
    expect(workspace.snapshot().tabs.map((t) => t.component)).toEqual(['ws-desk']);
  });
});

describe('aliases', () => {
  componentRegistry.alias('ws-mail', 'ws-desk', { title: 'Desk' });
  componentRegistry.alias('ws-older-mail', 'ws-mail');

  it('resolves chains and renders the target', () => {
    expect(componentRegistry.resolve('ws-older-mail')).toBe('ws-desk');
    expect(componentRegistry.get('ws-older-mail')).toBe(Noop);
    expect(componentRegistry.has('ws-mail')).toBe(true);
  });

  it('opening an alias reuses the target tab', () => {
    const desk = workspace.open('ws-desk')!;
    expect(workspace.open('ws-mail')).toBe(desk);
    expect(workspace.snapshot().tabs).toHaveLength(1);
  });

  it('finds and reuses a saved tab still under the old id', () => {
    useLayoutStore.getState().initLayout(one('ws-mail', 'Mailbox', { id: 'saved' }), true);
    expect(workspace.find('ws-desk').map((t) => t.id)).toEqual(['saved']);
    expect(workspace.open('ws-desk')).toBe('saved');
  });

  it('rewrites saved tabs to the new id and title', () => {
    useLayoutStore.getState().initLayout(one('ws-older-mail', 'Mailbox', { id: 'saved' }), true);
    expect(workspace.normalizeAliases()).toBe(1);
    const tab = useLayoutStore.getState().model.getNodeById('saved') as any;
    expect(tab.getComponent()).toBe('ws-desk');
    expect(tab.getName()).toBe('Desk');
    expect(workspace.normalizeAliases()).toBe(0);
  });
});

describe('layout versioning', () => {
  it('saves layouts in a versioned envelope', () => {
    configureLayout({ version: 2 });
    workspace.open('ws-desk');
    const saved = JSON.parse(localStorage.getItem('nexus-shell-layout')!);
    expect(saved.nexusLayoutVersion).toBe(2);
    expect(saved.layout.layout).toBeDefined();
  });

  it('migrates a bare pre-0.3 layout as version 0', () => {
    localStorage.setItem('nexus-shell-layout', JSON.stringify(one('ws-legacy', 'Old')));
    const migrate = vi.fn((json: IJsonModel, from: number) => {
      expect(from).toBe(0);
      return JSON.parse(JSON.stringify(json).replace('ws-legacy', 'ws-settings'));
    });
    configureLayout({ version: 1, migrate });
    expect(migrate).toHaveBeenCalledOnce();
    expect(workspace.snapshot().tabs.map((t) => t.component)).toEqual(['ws-settings']);
  });

  it('skips migration when the saved layout is current', () => {
    localStorage.setItem('nexus-shell-layout', JSON.stringify({ nexusLayoutVersion: 3, layout: one('ws-log') }));
    const migrate = vi.fn((j: IJsonModel) => j);
    configureLayout({ version: 3, migrate });
    expect(migrate).not.toHaveBeenCalled();
    expect(workspace.isOpen('ws-log')).toBe(true);
  });

  it('falls back to the default layout when migration throws', () => {
    localStorage.setItem('nexus-shell-layout', JSON.stringify(one('ws-log')));
    useLayoutStore.getState().initLayout(defaultLayout, false);
    configureLayout({
      version: 1,
      migrate: () => {
        throw new Error('bad');
      },
    });
    expect(workspace.isOpen('ws-log')).toBe(false);
  });
});

describe('unknown components', () => {
  it('dropUnknown closes tabs for unregistered components', () => {
    useLayoutStore.getState().initLayout(one('ws-gone'), true);
    workspace.open('ws-desk');
    expect(workspace.dropUnknown()).toBe(1);
    expect(workspace.snapshot().tabs.map((t) => t.component)).toEqual(['ws-desk']);
  });
});
