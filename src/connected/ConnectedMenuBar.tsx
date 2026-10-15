import { MenuBar, type MenuBarProps } from '../components/widgets/MenuBar';
import { menuRegistry, type IMenuItemConfig } from '../core/registry/MenuRegistry';
import { commandRegistry } from '../core/registry/CommandRegistry';
import { useMenuRegistryVersion } from '../core/registry/useCommand';
import { formatKeybinding } from '../lib/keybinding';

export type ConnectedMenuBarProps = Omit<MenuBarProps, 'menus' | 'onSelect'>;

/**
 * Fills in each item's `keybinding` from its command, when not set explicitly,
 * and formats it for this platform (`⌘⇧K` on macOS, `Ctrl+Shift+K` elsewhere).
 */
const withKeybindings = (items: IMenuItemConfig[]): IMenuItemConfig[] =>
  items.map((item) => {
    const binding =
      item.keybinding ??
      (item.commandId ? commandRegistry.getCommand(item.commandId)?.keybinding : undefined);
    return {
      ...item,
      keybinding: binding ? formatKeybinding(binding) : undefined,
      submenu: item.submenu ? withKeybindings(item.submenu) : undefined,
    };
  });

const findByIdIn = (
  items: IMenuItemConfig[],
  id: string,
): IMenuItemConfig | undefined => {
  for (const item of items) {
    if (item.id === id) return item;
    const found = item.submenu && findByIdIn(item.submenu, id);
    if (found) return found;
  }
  return undefined;
};

/**
 * {@link MenuBar} bound to the {@link menuRegistry} and {@link commandRegistry}.
 *
 * Reads the menu structure from the registry, backfills keybinding hints from
 * each item's registered command, and dispatches the item's `commandId` on
 * select. Re-renders when menus or commands are registered or removed. Use
 * this inside a shell; use the plain {@link MenuBar} when you want
 * to pass menus as data.
 */
export const ConnectedMenuBar = (props: ConnectedMenuBarProps) => {
  useMenuRegistryVersion();
  const registered = menuRegistry.getAllMenus();

  const menus = Object.fromEntries(
    Object.entries(registered).map(([name, items]) => [name, withKeybindings(items)]),
  );

  const handleSelect = (item: { id: string }) => {
    for (const items of Object.values(registered)) {
      const match = findByIdIn(items, item.id);
      if (match?.commandId) {
        commandRegistry.executeCommand(match.commandId);
        return;
      }
    }
  };

  return <MenuBar {...props} menus={menus} onSelect={handleSelect} />;
};
