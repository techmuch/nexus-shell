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

/**
 * Holds the application's menu structure, keyed by top-level menu name.
 *
 * This is a shell-level convenience so plugins can contribute menu entries
 * without prop-drilling. The presentational `MenuBar` does not read it.
 */
export class MenuRegistry {
  private menus = new Map<string, IMenuItemConfig[]>();

  registerMenu(menuId: string, item: IMenuItemConfig): void {
    if (!this.menus.has(menuId)) {
      this.menus.set(menuId, []);
    }
    this.menus.get(menuId)?.push(item);
  }

  setMenus(menuConfig: Record<string, IMenuItemConfig[]>): void {
    this.menus = new Map(Object.entries(menuConfig));
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
}

export const menuRegistry = new MenuRegistry();

export type { IMenuItem };
