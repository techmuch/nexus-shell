export interface IMenuItem {
  id: string;
  label: string;
  commandId?: string;
  keybinding?: string;
  submenu?: IMenuItem[];
}

export class MenuRegistry {
  private menus = new Map<string, IMenuItem[]>();

  registerMenu(menuId: string, item: IMenuItem): void {
    if (!this.menus.has(menuId)) {
      this.menus.set(menuId, []);
    }
    this.menus.get(menuId)?.push(item);
  }

  setMenus(menuConfig: Record<string, IMenuItem[]>): void {
    this.menus = new Map(Object.entries(menuConfig));
  }

  getMenu(menuId: string): IMenuItem[] {
    return this.menus.get(menuId) || [];
  }

  getAllMenus(): Record<string, IMenuItem[]> {
    const result: Record<string, IMenuItem[]> = {};
    this.menus.forEach((items, id) => {
      result[id] = items;
    });
    return result;
  }
}

export const menuRegistry = new MenuRegistry();
