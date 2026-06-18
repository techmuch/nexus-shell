export interface IMenuItem {
    id: string;
    label: string;
    commandId?: string;
    keybinding?: string;
    submenu?: IMenuItem[];
}
export declare class MenuRegistry {
    private menus;
    registerMenu(menuId: string, item: IMenuItem): void;
    setMenus(menuConfig: Record<string, IMenuItem[]>): void;
    getMenu(menuId: string): IMenuItem[];
    getAllMenus(): Record<string, IMenuItem[]>;
}
export declare const menuRegistry: MenuRegistry;
