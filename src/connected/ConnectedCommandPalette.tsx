import { useEffect } from 'react';
import {
  CommandPalette,
  type CommandPaletteProps,
} from '../components/widgets/CommandPalette';
import { commandRegistry, type ICommand } from '../core/registry/CommandRegistry';
import { useCommands } from '../core/registry/useCommand';
import {
  COMMAND_PALETTE_COMMAND_ID,
  useCommandPaletteStore,
} from '../core/services/CommandPaletteService';
import { useKeyboardShortcuts } from '../core/services/KeyboardService';
import { formatKeybinding } from '../lib/keybinding';
import { useSingleton } from '../lib/singleton';

export type ConnectedCommandPaletteProps = Omit<
  CommandPaletteProps<ICommand>,
  'open' | 'commands' | 'onSelect' | 'onClose'
> & {
  /**
   * Key that opens the palette when held with Cmd/Ctrl+Shift. Defaults to
   * `"p"`, matching VS Code's `Cmd+Shift+P`. Pass `null` to bind nothing.
   *
   * This sets the keybinding of the `shell.commandPalette` command, so it is
   * equivalent to registering that command with a `Mod+Shift+<key>` binding.
   */
  shortcutKey?: string | null;
  /**
   * Bind registered commands' shortcuts to the window, so the palette's own
   * shortcut works without `ShellLayout`. Defaults to `true`; `ShellLayout`
   * passes its `keyboardShortcuts` prop through.
   */
  bindShortcuts?: boolean;
};

/** Make sure the palette's command exists, with the requested binding. */
const ensurePaletteCommand = (shortcutKey: string | null) => {
  const keybinding = shortcutKey === null ? undefined : `Mod+Shift+${shortcutKey}`;
  const existing = commandRegistry.getCommand(COMMAND_PALETTE_COMMAND_ID);
  if (existing && existing.keybinding === keybinding) return;
  commandRegistry.registerCommand({
    id: COMMAND_PALETTE_COMMAND_ID,
    label: 'View: Command Palette',
    keybinding,
    execute: () => useCommandPaletteStore.getState().toggle(),
    ...(existing ? { label: existing.label, execute: existing.execute } : {}),
  });
};

/**
 * {@link CommandPalette} bound to the {@link commandRegistry}.
 *
 * Opens through the `shell.commandPalette` command (`Mod+Shift+P` by default),
 * so a menu item or button can open it too. Lists every registered command
 * whose `when` allows it, live, and runs the chosen one.
 *
 * `ShellLayout` mounts one for you; mounting another is harmless.
 */
export const ConnectedCommandPalette = ({
  shortcutKey = 'p',
  bindShortcuts = true,
  ...props
}: ConnectedCommandPaletteProps) => {
  const open = useCommandPaletteStore((s) => s.open);
  const setOpen = useCommandPaletteStore((s) => s.setOpen);
  const live = useSingleton('nexus.commandPalette');
  const commands = useCommands();
  // A palette rendered without ShellLayout still needs its shortcut to work.
  useKeyboardShortcuts(live && bindShortcuts);

  useEffect(() => {
    if (live) ensurePaletteCommand(shortcutKey);
  }, [live, shortcutKey]);

  if (!live) return null;

  const visible = commands
    .filter((c) => c.id !== COMMAND_PALETTE_COMMAND_ID && (!c.when || c.when()))
    .map((c) => (c.keybinding ? { ...c, keybinding: formatKeybinding(c.keybinding) } : c));

  return (
    <CommandPalette<ICommand>
      {...props}
      open={open}
      commands={visible}
      onSelect={(command) => {
        setOpen(false);
        commandRegistry.executeCommand(command.id);
      }}
      onClose={() => setOpen(false)}
    />
  );
};
