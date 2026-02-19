import { useEffect } from 'react';
import { commandRegistry } from '../registry/CommandRegistry';

export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if any registered command has a matching keybinding
      const commands = commandRegistry.getCommands();
      
      for (const command of commands) {
        if (command.keybinding && isMatch(event, command.keybinding)) {
          event.preventDefault();
          command.execute();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
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
