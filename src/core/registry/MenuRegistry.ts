export interface IMenuItem {
  id: string;
  label: string;
  commandId?: string;
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

  getMenu(menuId: string): IMenuItem[] {
    return this.menus.get(menuId) || [];
  }
}

export const menuRegistry = new MenuRegistry();
