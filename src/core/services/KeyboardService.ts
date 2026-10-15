import { useEffect } from 'react';
import { commandRegistry } from '../registry/CommandRegistry';

/** Dispatch a key event to the first command bound to it. */
const handleKeyDown = (event: KeyboardEvent) => {
  for (const command of commandRegistry.getCommands()) {
    if (command.keybinding && isMatch(event, command.keybinding)) {
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

/**
 * Simple keybinding matcher.
 * Supports "Control+N", "Shift+Alt+P", etc.
 */
function isMatch(event: KeyboardEvent, binding: string): boolean {
  const parts = binding.split('+');
  const key = parts.pop()?.toLowerCase();
  
  const needsCtrl = parts.includes('Control') || parts.includes('Ctrl');
  const needsShift = parts.includes('Shift');
  const needsAlt = parts.includes('Alt');
  const needsMeta = parts.includes('Meta') || parts.includes('Cmd');

  const hasCtrl = event.ctrlKey;
  const hasShift = event.shiftKey;
  const hasAlt = event.altKey;
  const hasMeta = event.metaKey;

  return (
    event.key.toLowerCase() === key &&
    hasCtrl === needsCtrl &&
    hasShift === needsShift &&
    hasAlt === needsAlt &&
    hasMeta === needsMeta
  );
}
