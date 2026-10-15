import { useEffect, useRef, useSyncExternalStore } from 'react';
import { commandRegistry, type ICommand } from './CommandRegistry';
import { menuRegistry } from './MenuRegistry';

/**
 * Register a command for as long as the calling component is mounted.
 *
 * The registered `execute` and `when` always call the latest render's
 * functions, so they never close over stale state — the trap with registering
 * in a plain effect. Re-registers only when the id, label or keybinding
 * change.
 *
 * @example
 * ```tsx
 * useCommand({ id: 'desk.refresh', label: 'Desk: Refresh', keybinding: 'Mod+R', execute: () => refetch(query) });
 * ```
 */
export const useCommand = (command: ICommand): void => {
  const latest = useRef(command);
  latest.current = command;
  const hasWhen = command.when !== undefined;

  useEffect(
    () =>
      commandRegistry.registerCommand({
        id: command.id,
        label: command.label,
        icon: command.icon,
        keybinding: command.keybinding,
        allowInInputs: command.allowInInputs,
        execute: (...args) => latest.current.execute(...args),
        when: hasWhen ? () => latest.current.when?.() ?? true : undefined,
      }),
    [command.id, command.label, command.icon, command.keybinding, command.allowInInputs, hasWhen],
  );
};

/** The registered commands, re-rendering when they change. */
export const useCommands = (): ICommand[] => {
  useSyncExternalStore(
    (l) => commandRegistry.subscribe(l),
    () => commandRegistry.getVersion(),
    () => commandRegistry.getVersion(),
  );
  return commandRegistry.getCommands();
};

/** Re-render when the menus or commands change. Returns a change counter. */
export const useMenuRegistryVersion = (): number => {
  const menus = useSyncExternalStore(
    (l) => menuRegistry.subscribe(l),
    () => menuRegistry.getVersion(),
    () => menuRegistry.getVersion(),
  );
  const commands = useSyncExternalStore(
    (l) => commandRegistry.subscribe(l),
    () => commandRegistry.getVersion(),
    () => commandRegistry.getVersion(),
  );
  return menus * 100003 + commands;
};
