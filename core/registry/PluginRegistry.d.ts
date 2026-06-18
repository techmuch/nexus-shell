export interface IPlugin {
    id: string;
    name: string;
    activate: () => void;
    deactivate: () => void;
}
export type PluginLoader = () => Promise<IPlugin>;
export type PluginStatus = 'registered' | 'inactive' | 'activating' | 'active' | 'failed' | 'deactivated';
export declare class PluginRegistry {
    private plugins;
    private loaders;
    private statuses;
    registerPlugin(plugin: IPlugin): void;
    registerLazyPlugin(id: string, loader: PluginLoader): void;
    activatePlugin(id: string): Promise<void>;
    deactivatePlugin(id: string): Promise<void>;
    getPluginStatus(id: string): PluginStatus | undefined;
    getPluginStatuses(): Record<string, PluginStatus>;
    getPlugin(id: string): IPlugin | undefined;
    getAllPlugins(): IPlugin[];
}
export declare const pluginRegistry: PluginRegistry;
