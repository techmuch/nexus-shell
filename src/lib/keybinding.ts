/**
 * Keybinding strings: `"Control+Shift+K"`, `"Mod+S"`, `"F1"`, `"Alt+ArrowUp"`.
 *
 * Modifiers are `Control`/`Ctrl`, `Shift`, `Alt`/`Option`, `Meta`/`Cmd`, and
 * `Mod` — Cmd on macOS, Control everywhere else, which is what most
 * cross-platform shortcuts mean. The last segment is the key, compared against
 * `KeyboardEvent.key` case-insensitively. `"Control++"` binds the plus key.
 */

export interface ParsedKeybinding {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
  key: string;
}

/** Whether we are on an Apple platform, where `Mod` means Cmd. */
export const isMac = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform ?? nav.platform ?? nav.userAgent ?? '';
  return /mac|iphone|ipad|ipod/i.test(platform);
};

const MODIFIERS: Record<string, keyof Omit<ParsedKeybinding, 'key'> | 'mod'> = {
  control: 'ctrl',
  ctrl: 'ctrl',
  shift: 'shift',
  alt: 'alt',
  option: 'alt',
  meta: 'meta',
  cmd: 'meta',
  command: 'meta',
  mod: 'mod',
};

/** Parse a binding. `mac` decides what `Mod` means; defaults to this platform. */
export const parseKeybinding = (binding: string, mac = isMac()): ParsedKeybinding => {
  // "Control++" is Control and the plus key, so split on '+' that follows
  // something other than another '+'.
  const parts = binding.split(/(?<!\+)\+/).map((p) => p.trim()).filter(Boolean);
  const parsed: ParsedKeybinding = { ctrl: false, shift: false, alt: false, meta: false, key: '' };
  parts.forEach((part, i) => {
    const modifier = MODIFIERS[part.toLowerCase()];
    if (modifier && i < parts.length - 1) {
      if (modifier === 'mod') parsed[mac ? 'meta' : 'ctrl'] = true;
      else parsed[modifier] = true;
    } else {
      parsed.key = part;
    }
  });
  return parsed;
};

/** Whether a key event matches a binding. */
export const matchesKeybinding = (event: KeyboardEvent, binding: string, mac = isMac()): boolean => {
  const b = parseKeybinding(binding, mac);
  if (!b.key) return false;
  return (
    event.key.toLowerCase() === b.key.toLowerCase() &&
    event.ctrlKey === b.ctrl &&
    event.shiftKey === b.shift &&
    event.altKey === b.alt &&
    event.metaKey === b.meta
  );
};

/**
 * Whether a binding includes Control, Alt or Meta. Bindings without one —
 * bare keys and Shift+key — are text input, and by default do not fire while
 * the user is typing in a field.
 */
export const hasCommandModifier = (binding: string, mac = isMac()): boolean => {
  const b = parseKeybinding(binding, mac);
  return b.ctrl || b.alt || b.meta;
};

const KEY_NAMES: Record<string, string> = {
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
  escape: 'Esc',
  ' ': 'Space',
  space: 'Space',
};

/**
 * A binding as the user should read it: `⌘⇧K` on macOS, `Ctrl+Shift+K`
 * elsewhere. Strings that do not parse as a binding (already-formatted hints
 * such as `"⌘S"`) are returned unchanged.
 */
export const formatKeybinding = (binding: string, mac = isMac()): string => {
  if (!binding.includes('+') && binding.length <= 2 && !/^f\d+$/i.test(binding)) {
    return binding.length === 1 ? binding.toUpperCase() : binding;
  }
  const b = parseKeybinding(binding, mac);
  const rawKey = b.key;
  const key = KEY_NAMES[rawKey.toLowerCase()] ?? (rawKey.length === 1 ? rawKey.toUpperCase() : rawKey);
  if (mac) {
    return `${b.ctrl ? '⌃' : ''}${b.alt ? '⌥' : ''}${b.shift ? '⇧' : ''}${b.meta ? '⌘' : ''}${key}`;
  }
  return [b.ctrl && 'Ctrl', b.alt && 'Alt', b.shift && 'Shift', b.meta && 'Meta', key]
    .filter(Boolean)
    .join('+');
};

/** Whether an event target is somewhere the user types. */
export const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!target || typeof (target as HTMLElement).tagName !== 'string') return false;
  const el = target as HTMLElement;
  if (el.isContentEditable) return true;
  const tag = el.tagName.toLowerCase();
  if (tag === 'textarea' || tag === 'select') return true;
  if (tag === 'input') {
    const type = ((el as HTMLInputElement).type || 'text').toLowerCase();
    return !['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color', 'file'].includes(type);
  }
  return false;
};
