import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { MenuBar } from '../MenuBar';

const menus = {
  File: [
    { id: 'new', label: 'New' },
    { id: 'open', label: 'Open' },
    { id: 'recent', label: 'Recent', submenu: [{ id: 'a', label: 'a.txt' }, { id: 'b', label: 'b.txt' }] },
  ],
  Go: [{ id: 'desk', label: 'Desk' }, { id: 'calendar', label: 'Calendar' }],
};

// Focus moves on the next frame, after the menu has rendered.
const frame = () => act(() => new Promise<void>((r) => requestAnimationFrame(() => r())));

describe('MenuBar', () => {
  it('opens on a click and closes when an item is chosen', () => {
    const onSelect = vi.fn();
    render(<MenuBar menus={menus} onSelect={onSelect} />);
    const go = screen.getByRole('button', { name: 'Go' });
    expect(go).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.click(go);
    expect(go).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByRole('menuitem', { name: 'Calendar' }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'calendar' }));
    // Closed, though the pointer has not moved.
    expect(screen.queryByRole('menu')).toBeNull();
    expect(go).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape, returning focus to the menu name, and on a click elsewhere', async () => {
    render(<><MenuBar menus={menus} /><p>elsewhere</p></>);
    const file = screen.getByRole('button', { name: 'File' });
    fireEvent.click(file);
    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'New' }), { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(file);
    fireEvent.click(file);
    fireEvent.mouseDown(screen.getByText('elsewhere'));
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('works from the keyboard: open, move, switch menus, choose', async () => {
    const onSelect = vi.fn();
    render(<MenuBar menus={menus} onSelect={onSelect} />);
    const file = screen.getByRole('button', { name: 'File' });
    file.focus();
    fireEvent.keyDown(file, { key: 'Enter' });
    await frame();
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'New' }));
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Open' }));
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' });
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Recent' }));
    // → moves to the next menu, at its first item.
    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'New' }), { key: 'ArrowRight' });
    await frame();
    expect(screen.getByRole('button', { name: 'Go' })).toHaveAttribute('aria-expanded', 'true');
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Desk' }));
    fireEvent.keyDown(document.activeElement!, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'desk' }));
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('opens a submenu with → and closes it with ←', async () => {
    const onSelect = vi.fn();
    render(<MenuBar menus={menus} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: 'File' }));
    const recent = screen.getByRole('menuitem', { name: 'Recent' });
    expect(recent).toHaveAttribute('aria-expanded', 'false');
    recent.focus();
    fireEvent.keyDown(recent, { key: 'ArrowRight' });
    await frame();
    expect(recent).toHaveAttribute('aria-expanded', 'true');
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'a.txt' }));
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' });
    expect(screen.queryByRole('menuitem', { name: 'a.txt' })).toBeNull();
    expect(document.activeElement).toBe(recent);
    // A submenu's parent is not itself chosen.
    fireEvent.click(recent);
    fireEvent.click(screen.getByRole('menuitem', { name: 'b.txt' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'b' }));
  });

  it('switches menus on hover only while one is open', () => {
    render(<MenuBar menus={menus} />);
    const file = screen.getByRole('button', { name: 'File' });
    const go = screen.getByRole('button', { name: 'Go' });
    fireEvent.mouseEnter(go);
    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.click(file);
    fireEvent.mouseEnter(go);
    expect(go).toHaveAttribute('aria-expanded', 'true');
    expect(file).toHaveAttribute('aria-expanded', 'false');
  });
});
