import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { CommandRegistry, commandRegistry } from '../CommandRegistry';
import { MenuRegistry, menuRegistry, mergeMenus } from '../MenuRegistry';
import { useCommand } from '../useCommand';
import { useKeyboardShortcuts } from '../../services/KeyboardService';
import { initializeShell } from '../../Boot';
import { ConnectedMenuBar } from '../../../connected/ConnectedMenuBar';
import { ConnectedCommandPalette } from '../../../connected/ConnectedCommandPalette';
import { useCommandPaletteStore } from '../../services/CommandPaletteService';

afterEach(() => {
  cleanup();
  useCommandPaletteStore.getState().setOpen(false);
});

describe('CommandRegistry', () => {
  it('replaces on re-registration, so the newest closure wins', () => {
    const r = new CommandRegistry();
    const first = vi.fn();
    const second = vi.fn();
    r.registerCommand({ id: 'a', label: 'A', execute: first });
    r.registerCommand({ id: 'a', label: 'A', execute: second });
    r.executeCommand('a');
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });

  it('disposes only its own registration', () => {
    const r = new CommandRegistry();
    const disposeOld = r.registerCommand({ id: 'a', label: 'A', execute: () => {} });
    r.registerCommand({ id: 'a', label: 'A2', execute: () => {} });
    disposeOld();
    expect(r.getCommand('a')?.label).toBe('A2');
    r.unregisterCommand('a');
    expect(r.hasCommand('a')).toBe(false);
  });

  it('notifies subscribers', () => {
    const r = new CommandRegistry();
    const listener = vi.fn();
    const off = r.subscribe(listener);
    const dispose = r.registerCommand({ id: 'a', label: 'A', execute: () => {} });
    dispose();
    off();
    r.registerCommand({ id: 'b', label: 'B', execute: () => {} });
    expect(listener).toHaveBeenCalledTimes(2);
  });
});

describe('MenuRegistry', () => {
  it('contributes without disturbing other items, and disposes exactly its own', () => {
    const r = new MenuRegistry();
    r.setMenus({ Tools: [{ id: 'a', label: 'A' }] });
    const off = r.contribute('Tools', [{ id: 'b', label: 'B' }]);
    r.contribute('Tools', [{ id: 'z', label: 'Z' }], { position: 'start' });
    expect(r.getMenu('Tools').map((i) => i.id)).toEqual(['z', 'a', 'b']);
    off();
    expect(r.getMenu('Tools').map((i) => i.id)).toEqual(['z', 'a']);
  });

  it('replaces an item with the same id in place', () => {
    const r = new MenuRegistry();
    r.contribute('Tools', [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }]);
    r.contribute('Tools', [{ id: 'a', label: 'A2' }]);
    expect(r.getMenu('Tools').map((i) => i.label)).toEqual(['A2', 'B']);
  });

  it('merges menus: app items and order first, built-ins not duplicated', () => {
    const merged = mergeMenus(
      { Tools: [{ id: 't', label: 'T' }], View: [{ id: 'mine', label: 'Chat', commandId: 'view.toggleChat' }] },
      { View: [{ id: 'view.chat', label: 'Toggle Chat', commandId: 'view.toggleChat' }, { id: 'view.theme', label: 'Theme' }] },
    );
    expect(Object.keys(merged)).toEqual(['Tools', 'View']);
    expect(merged.View.map((i) => i.id)).toEqual(['mine', 'view.theme']);
  });
});

describe('initializeShell menus and defaults', () => {
  it('keeps the built-in View items when the app declares its own View menu', () => {
    initializeShell({ menus: { Tools: [], View: [{ id: 'v', label: 'Mine' }] } });
    const view = menuRegistry.getMenu('View').map((i) => i.id);
    expect(view[0]).toBe('v');
    expect(view).toContain('view.theme');
    expect(Object.keys(menuRegistry.getAllMenus())[0]).toBe('Tools');
  });

  it('does not overwrite an app override of a built-in command on a second call', () => {
    initializeShell();
    const mine = vi.fn();
    commandRegistry.registerCommand({ id: 'view.toggleChat', label: 'Mine', execute: mine });
    initializeShell();
    commandRegistry.executeCommand('view.toggleChat');
    expect(mine).toHaveBeenCalledOnce();
  });
});

describe('keyboard shortcuts', () => {
  const Keys = () => {
    useKeyboardShortcuts();
    return <input aria-label="field" />;
  };

  it('does not fire bare-key shortcuts while typing, but does fire chords', () => {
    const bare = vi.fn();
    const chord = vi.fn();
    const offs = [
      commandRegistry.registerCommand({ id: 't.bare', label: 'Bare', keybinding: 'j', execute: bare }),
      commandRegistry.registerCommand({ id: 't.chord', label: 'Chord', keybinding: 'Control+Alt+J', execute: chord }),
    ];
    render(<Keys />);
    const field = screen.getByLabelText('field');
    fireEvent.keyDown(field, { key: 'j' });
    fireEvent.keyDown(field, { key: 'j', ctrlKey: true, altKey: true });
    expect(bare).not.toHaveBeenCalled();
    expect(chord).toHaveBeenCalledOnce();

    fireEvent.keyDown(document.body, { key: 'j' });
    expect(bare).toHaveBeenCalledOnce();
    offs.forEach((o) => o());
  });

  it('honours allowInInputs and when', () => {
    const typed = vi.fn();
    let enabled = false;
    const gated = vi.fn();
    const offs = [
      commandRegistry.registerCommand({ id: 't.typed', label: 'T', keybinding: 'Escape', allowInInputs: true, execute: typed }),
      commandRegistry.registerCommand({ id: 't.gated', label: 'G', keybinding: 'Control+Alt+G', when: () => enabled, execute: gated }),
    ];
    render(<Keys />);
    fireEvent.keyDown(screen.getByLabelText('field'), { key: 'Escape' });
    expect(typed).toHaveBeenCalledOnce();

    fireEvent.keyDown(document.body, { key: 'g', ctrlKey: true, altKey: true });
    expect(gated).not.toHaveBeenCalled();
    enabled = true;
    fireEvent.keyDown(document.body, { key: 'g', ctrlKey: true, altKey: true });
    expect(gated).toHaveBeenCalledOnce();
    offs.forEach((o) => o());
  });

  it('ignores events mid-composition', () => {
    const run = vi.fn();
    const off = commandRegistry.registerCommand({ id: 't.c', label: 'C', keybinding: 'Control+Alt+C', execute: run });
    render(<Keys />);
    fireEvent.keyDown(document.body, { key: 'c', ctrlKey: true, altKey: true, isComposing: true });
    expect(run).not.toHaveBeenCalled();
    off();
  });
});

describe('useCommand', () => {
  it('registers while mounted, always runs the latest closure, and unregisters', () => {
    const seen: number[] = [];
    const Counter = () => {
      const [n, setN] = useState(0);
      useCommand({ id: 't.count', label: 'Count', execute: () => seen.push(n) });
      return <button onClick={() => setN((x) => x + 1)}>inc</button>;
    };
    const { unmount } = render(<Counter />);
    commandRegistry.executeCommand('t.count');
    fireEvent.click(screen.getByText('inc'));
    fireEvent.click(screen.getByText('inc'));
    commandRegistry.executeCommand('t.count');
    expect(seen).toEqual([0, 2]);
    unmount();
    expect(commandRegistry.hasCommand('t.count')).toBe(false);
  });
});

describe('live connected views', () => {
  it('the menu bar shows menus contributed after it mounted', () => {
    menuRegistry.setMenus({});
    render(<ConnectedMenuBar />);
    expect(screen.queryByText('Late')).toBeNull();
    act(() => {
      menuRegistry.contribute('Late', [{ id: 'late.x', label: 'X' }]);
    });
    expect(screen.getByText('Late')).toBeInTheDocument();
  });

  it('the palette lists commands registered while open, hides `when` false, and runs the choice', () => {
    const run = vi.fn();
    render(<ConnectedCommandPalette />);
    act(() => useCommandPaletteStore.getState().setOpen(true));
    act(() => {
      commandRegistry.registerCommand({ id: 't.late', label: 'Late Command', execute: run });
      commandRegistry.registerCommand({ id: 't.hidden', label: 'Hidden Command', when: () => false, execute: () => {} });
    });
    expect(screen.getByText('Late Command')).toBeInTheDocument();
    expect(screen.queryByText('Hidden Command')).toBeNull();
    fireEvent.click(screen.getByText('Late Command'));
    expect(run).toHaveBeenCalledOnce();
    expect(useCommandPaletteStore.getState().open).toBe(false);
    commandRegistry.unregisterCommand('t.late');
    commandRegistry.unregisterCommand('t.hidden');
  });

  it('opens through the shell.commandPalette command', () => {
    render(<ConnectedCommandPalette />);
    act(() => commandRegistry.executeCommand('shell.commandPalette'));
    expect(useCommandPaletteStore.getState().open).toBe(true);
  });
});
