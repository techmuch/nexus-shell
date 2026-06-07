export interface IPlugin {
  id: string;
  name: string;
  activate: () => void;
  deactivate: () => void;
}

export type PluginLoader = () => Promise<IPlugin>;

export type PluginStatus = 'registered' | 'inactive' | 'activating' | 'active' | 'failed' | 'deactivated';

export class PluginRegistry {
  private plugins = new Map<string, IPlugin>();
  private loaders = new Map<string, PluginLoader>();
  private statuses = new Map<string, PluginStatus>();

  registerPlugin(plugin: IPlugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin ${plugin.id} is already registered.`);
      return;
    }
    this.plugins.set(plugin.id, plugin);
    this.statuses.set(plugin.id, 'registered');
    console.log(`Plugin ${plugin.name} (${plugin.id}) registered.`);
  }

  registerLazyPlugin(id: string, loader: PluginLoader): void {
    if (this.loaders.has(id) || this.plugins.has(id)) {
      console.warn(`Plugin ${id} is already registered or has a loader.`);
      return;
    }
    this.loaders.set(id, loader);
    this.statuses.set(id, 'inactive');
    console.log(`Lazy plugin loader for ${id} registered.`);
  }

  async activatePlugin(id: string): Promise<void> {
    let plugin = this.plugins.get(id);

    // If not found in active plugins, check loaders
    if (!plugin && this.loaders.has(id)) {
      try {
        const loader = this.loaders.get(id)!;
        plugin = await loader();
        this.plugins.set(id, plugin);
        this.statuses.set(id, 'registered');
        console.log(`Lazy plugin ${id} loaded.`);
      } catch (e) {
        console.error(`Failed to load lazy plugin ${id}`, e);
        this.statuses.set(id, 'failed');
        return;
      }
    }

    if (plugin) {
      try {
        this.statuses.set(id, 'activating');
        plugin.activate();
        this.statuses.set(id, 'active');
        console.log(`Plugin ${plugin.name} activated.`);
      } catch (e) {
        console.error(`Failed to activate plugin ${id}`, e);
        this.statuses.set(id, 'failed');
      }
    } else {
      console.warn(`Plugin ${id} not found for activation.`);
      this.statuses.set(id, 'failed');
    }
  }

  async deactivatePlugin(id: string): Promise<void> {
    const plugin = this.plugins.get(id);
    if (plugin) {
      try {
        plugin.deactivate();
        this.statuses.set(id, 'deactivated');
        console.log(`Plugin ${plugin.name} deactivated.`);
      } catch (e) {
        console.error(`Failed to deactivate plugin ${id}`, e);
        this.statuses.set(id, 'failed');
      }
    }
  }

  getPluginStatus(id: string): PluginStatus | undefined {
    return this.statuses.get(id);
  }

  getPluginStatuses(): Record<string, PluginStatus> {
    const record: Record<string, PluginStatus> = {};
    this.statuses.forEach((status, id) => {
      record[id] = status;
    });
    return record;
  }

  getPlugin(id: string): IPlugin | undefined {
    return this.plugins.get(id);
  }

  getAllPlugins(): IPlugin[] {
    return Array.from(this.plugins.values());
  }
}

export const pluginRegistry = new PluginRegistry();
