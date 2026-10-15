import { describe, expect, it } from 'vitest';
import {
  formatKeybinding,
  hasCommandModifier,
  isEditableTarget,
  matchesKeybinding,
  parseKeybinding,
} from '../keybinding';

const key = (k: string, mods: Partial<Record<'ctrlKey' | 'shiftKey' | 'altKey' | 'metaKey', boolean>> = {}) =>
  new KeyboardEvent('keydown', { key: k, ...mods });

describe('parseKeybinding', () => {
  it('reads modifiers and key, with aliases', () => {
    expect(parseKeybinding('Ctrl+Shift+K', false)).toEqual({ ctrl: true, shift: true, alt: false, meta: false, key: 'K' });
    expect(parseKeybinding('Cmd+Option+P', true)).toMatchObject({ meta: true, alt: true, key: 'P' });
  });

  it('maps Mod to Cmd on macOS and Control elsewhere', () => {
    expect(parseKeybinding('Mod+S', true)).toMatchObject({ meta: true, ctrl: false });
    expect(parseKeybinding('Mod+S', false)).toMatchObject({ meta: false, ctrl: true });
  });

  it('binds the plus key', () => {
    expect(parseKeybinding('Control++', false)).toMatchObject({ ctrl: true, key: '+' });
  });
});

describe('matchesKeybinding', () => {
  it('matches exactly, case-insensitively', () => {
    expect(matchesKeybinding(key('K', { ctrlKey: true, shiftKey: true }), 'Control+Shift+K', false)).toBe(true);
    expect(matchesKeybinding(key('k', { ctrlKey: true }), 'Control+Shift+K', false)).toBe(false);
    expect(matchesKeybinding(key('k', { ctrlKey: true, altKey: true }), 'Control+K', false)).toBe(false);
    expect(matchesKeybinding(key('F1'), 'F1', false)).toBe(true);
  });

  it('matches Mod per platform', () => {
    expect(matchesKeybinding(key('s', { metaKey: true }), 'Mod+S', true)).toBe(true);
    expect(matchesKeybinding(key('s', { ctrlKey: true }), 'Mod+S', true)).toBe(false);
    expect(matchesKeybinding(key('s', { ctrlKey: true }), 'Mod+S', false)).toBe(true);
  });
});

describe('formatKeybinding', () => {
  it('uses symbols on macOS and words elsewhere', () => {
    expect(formatKeybinding('Mod+Shift+P', true)).toBe('⇧⌘P');
    expect(formatKeybinding('Mod+Shift+P', false)).toBe('Ctrl+Shift+P');
    expect(formatKeybinding('Control+`', true)).toBe('⌃`');
    expect(formatKeybinding('Alt+ArrowUp', false)).toBe('Alt+↑');
  });

  it('leaves already-formatted hints and function keys alone', () => {
    expect(formatKeybinding('⌘S', true)).toBe('⌘S');
    expect(formatKeybinding('F1', false)).toBe('F1');
  });
});

describe('typing context', () => {
  it('treats text fields and contenteditable as editable, buttons not', () => {
    const input = document.createElement('input');
    const checkbox = Object.assign(document.createElement('input'), { type: 'checkbox' });
    const editable = document.createElement('div');
    Object.defineProperty(editable, 'isContentEditable', { value: true });
    expect(isEditableTarget(input)).toBe(true);
    expect(isEditableTarget(document.createElement('textarea'))).toBe(true);
    expect(isEditableTarget(editable)).toBe(true);
    expect(isEditableTarget(checkbox)).toBe(false);
    expect(isEditableTarget(document.createElement('button'))).toBe(false);
    expect(isEditableTarget(null)).toBe(false);
  });

  it('knows which bindings are command chords', () => {
    expect(hasCommandModifier('Mod+S', false)).toBe(true);
    expect(hasCommandModifier('Shift+?', false)).toBe(false);
    expect(hasCommandModifier('j', false)).toBe(false);
  });
});
