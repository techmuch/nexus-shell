import { Model } from 'flexlayout-react';
import { ISidebarPanel } from '../../core/services/SidebarService';
import { ISlashCommand } from '../../core/services/ChatService';
import { IStatusBarWidget } from '../../core/services/StatusBarService';
import { IMenuItem } from '../../core/registry/MenuRegistry';

interface ShellLayoutProps {
    panels?: ISidebarPanel[];
    slashCommands?: ISlashCommand[];
    menuConfig?: Record<string, IMenuItem[]>;
    statusBarConfig?: IStatusBarWidget[];
    rightMenuBarContent?: React.ReactNode;
    title?: React.ReactNode;
    layoutModel?: Model;
}
export declare const ShellLayout: ({ panels, slashCommands, menuConfig, statusBarConfig, rightMenuBarContent, title, layoutModel }: ShellLayoutProps) => import("react/jsx-runtime").JSX.Element;
export {};
