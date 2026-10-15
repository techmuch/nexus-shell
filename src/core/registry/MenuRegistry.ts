import type { IMenuItem } from '../../components/widgets/MenuBar';

/**
 * A menu entry as held in the registry. Extends the presentational
 * {@link IMenuItem} with `commandId`, which `ConnectedMenuBar` resolves against
 * the {@link commandRegistry} when the item is chosen.
 */
export interface IMenuItemConfig extends IMenuItem {
  /** Command to execute when the item is selected. */
  commandId?: string;
  /** Nested entries, which may themselves carry a `commandId`. */
  submenu?: IMenuItemConfig[];
}

/** Options for {@link MenuRegistry.contribute}. */
export interface MenuContributionOptions {
  /**
   * Where the items go. `'end'` (default) appends; `'start'` prepends; a
   * number inserts at that index.
   */
  position?: 'start' | 'end' | number;
}

type Listener = () => void;

/**
 * Holds the application's menu structure, keyed by top-level menu name.
 *
 * This is a shell-level convenience so plugins can contribute menu entries
 * without prop-drilling. The presentational `MenuBar` does not read it.
 */
export class MenuRegistry {
  private menus = new Map<string, IMenuItemConfig[]>();
  private listeners = new Set<Listener>();
  private version = 0;

  registerMenu(menuId: string, item: IMenuItemConfig): void {
    this.contribute(menuId, [item]);
  }

  /**
   * Add items to a menu, creating it if needed, without disturbing what other
   * code put there. An item whose id is already in the menu replaces it in
   * place.
   *
   * @returns A disposer that removes exactly these items.
   */
  contribute(
    menuId: string,
    items: IMenuItemConfig[],
    options: MenuContributionOptions = {},
  ): () => void {
    const current = [...(this.menus.get(menuId) ?? [])];
    const fresh: IMenuItemConfig[] = [];
    for (const item of items) {
      const at = current.findIndex((c) => c.id === item.id);
      if (at >= 0) current[at] = item;
      else fresh.push(item);
    }
    const position = options.position ?? 'end';
    const index =
      position === 'start' ? 0 : position === 'end' ? current.length : Math.max(0, Math.min(position, current.length));
    current.splice(index, 0, ...fresh);
    this.menus.set(menuId, current);
    this.notify();

    return () => {
      const list = this.menus.get(menuId);
      if (!list) return;
      const remaining = list.filter((i) => !items.includes(i));
      if (remaining.length === list.length) return;
      if (remaining.length) this.menus.set(menuId, remaining);
      else this.menus.delete(menuId);
      this.notify();
    };
  }

  /** Replace the whole menu structure. */
  setMenus(menuConfig: Record<string, IMenuItemConfig[]>): void {
    this.menus = new Map(Object.entries(menuConfig));
    this.notify();
  }

  getMenu(menuId: string): IMenuItemConfig[] {
    return this.menus.get(menuId) || [];
  }

  getAllMenus(): Record<string, IMenuItemConfig[]> {
    const result: Record<string, IMenuItemConfig[]> = {};
    this.menus.forEach((items, id) => {
      result[id] = items;
    });
    return result;
  }

  /** Run `listener` whenever the menus change. */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Changes on every update; for `useSyncExternalStore`. */
  getVersion(): number {
    return this.version;
  }

  private notify(): void {
    this.version += 1;
    this.listeners.forEach((l) => l());
  }
}

export const menuRegistry = new MenuRegistry();

/**
 * Merge menus, the first argument's taking priority.
 *
 * For each menu in `primary`, its items come first, followed by `secondary`'s
 * items for the same menu that are not already present by id or by command.
 * Menus only in `secondary` are appended after `primary`'s, so the app's own
 * menu order wins.
 */
export const mergeMenus = (
  primary: Record<string, IMenuItemConfig[]>,
  secondary: Record<string, IMenuItemConfig[]>,
): Record<string, IMenuItemConfig[]> => {
  const result: Record<string, IMenuItemConfig[]> = {};
  for (const [name, items] of Object.entries(primary)) {
    const ids = new Set(items.map((i) => i.id));
    const commands = new Set(items.map((i) => i.commandId).filter(Boolean));
    const extra = (secondary[name] ?? []).filter(
      (i) => !ids.has(i.id) && !(i.commandId && commands.has(i.commandId)),
    );
    result[name] = [...items, ...extra];
  }
  for (const [name, items] of Object.entries(secondary)) {
    if (!(name in result)) result[name] = items;
  }
  return result;
};

export type { IMenuItem };
