import { useEffect } from 'react';
import { commandRegistry, type ICommand } from '../registry/CommandRegistry';
import {
  hasCommandModifier,
  isEditableTarget,
  matchesKeybinding,
} from '../../lib/keybinding';

/** Whether `command`'s shortcut may fire for this event. */
const shouldFire = (command: ICommand, event: KeyboardEvent): boolean => {
  if (!command.keybinding || !matchesKeybinding(event, command.keybinding)) return false;
  if (isEditableTarget(event.target)) {
    const allowed = command.allowInInputs ?? hasCommandModifier(command.keybinding);
    if (!allowed) return false;
  }
  if (command.when && !command.when()) return false;
  return true;
};

/** Dispatch a key event to the first command bound to it. */
const handleKeyDown = (event: KeyboardEvent) => {
  // Mid-composition keystrokes belong to the IME; a handled event belongs to
  // whoever handled it.
  if (event.isComposing || event.defaultPrevented) return;
  for (const command of commandRegistry.getCommands()) {
    if (shouldFire(command, event)) {
      event.preventDefault();
      command.execute();
      break;
    }
  }
};

/**
 * How many mounted hooks want shortcuts. One window listener serves them all,
 * so mounting the hook twice — `ShellLayout` does it, and apps written for
 * earlier releases do it too — never runs a command twice.
 */
let mounted = 0;

/**
 * Bind every registered command's `keybinding` to the window.
 *
 * `ShellLayout` mounts this itself (opt out with `keyboardShortcuts={false}`).
 * Mount it yourself only when you render the shell's parts without
 * `ShellLayout`. Mounting it more than once is harmless.
 *
 * Bindings use `KeyboardEvent.key`; see `parseKeybinding` for the syntax.
 * Bare keys and Shift+key do not fire while the user is typing in a field
 * unless the command sets `allowInInputs`.
 */
export const useKeyboardShortcuts = (enabled = true) => {
  useEffect(() => {
    if (!enabled) return;
    if (mounted === 0) window.addEventListener('keydown', handleKeyDown);
    mounted += 1;
    return () => {
      mounted -= 1;
      if (mounted === 0) window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled]);
};
