import { useEffect, useState } from 'react';
import {
  CommandPalette,
  type CommandPaletteProps,
} from '../components/widgets/CommandPalette';
import { commandRegistry, type ICommand } from '../core/registry/CommandRegistry';

export type ConnectedCommandPaletteProps = Omit<
  CommandPaletteProps<ICommand>,
  'open' | 'commands' | 'onSelect' | 'onClose'
> & {
  /**
   * Key that opens the palette when held with Cmd/Ctrl+Shift. Defaults to
   * `"p"`, matching VS Code's `Cmd+Shift+P`. Pass `null` to bind nothing.
   */
  shortcutKey?: string | null;
};

/**
 * {@link CommandPalette} bound to the {@link commandRegistry}.
 *
 * Owns its own visibility and binds a global `Cmd/Ctrl+Shift+P` listener to
 * toggle it. Selecting a command runs the registry entry's `execute` and closes
 * the palette.
 */
export const ConnectedCommandPalette = ({
  shortcutKey = 'p',
  ...props
}: ConnectedCommandPaletteProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (shortcutKey === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === shortcutKey
      ) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutKey]);

  return (
    <CommandPalette<ICommand>
      {...props}
      open={open}
      commands={commandRegistry.getCommands()}
      onSelect={(command) => {
        command.execute();
        setOpen(false);
      }}
      onClose={() => setOpen(false)}
    />
  );
};
