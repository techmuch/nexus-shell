export interface IPlugin {
  id: string;
  name: string;
  activate: () => void;
  deactivate: () => void;
}

export type PluginLoader = () => Promise<IPlugin>;

export class PluginRegistry {
  private plugins = new Map<string, IPlugin>();
  private loaders = new Map<string, PluginLoader>();

  registerPlugin(plugin: IPlugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin ${plugin.id} is already registered.`);
      return;
    }
    this.plugins.set(plugin.id, plugin);
    console.log(`Plugin ${plugin.name} (${plugin.id}) registered.`);
  }

  registerLazyPlugin(id: string, loader: PluginLoader): void {
    if (this.loaders.has(id) || this.plugins.has(id)) {
      console.warn(`Plugin ${id} is already registered or has a loader.`);
      return;
    }
    this.loaders.set(id, loader);
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
        console.log(`Lazy plugin ${id} loaded.`);
      } catch (e) {
        console.error(`Failed to load lazy plugin ${id}`, e);
        return;
      }
    }

    if (plugin) {
      try {
        plugin.activate();
        console.log(`Plugin ${plugin.name} activated.`);
      } catch (e) {
        console.error(`Failed to activate plugin ${id}`, e);
      }
    } else {
        console.warn(`Plugin ${id} not found for activation.`);
    }
  }

  getPlugin(id: string): IPlugin | undefined {
    return this.plugins.get(id);
  }

  getAllPlugins(): IPlugin[] {
    return Array.from(this.plugins.values());
  }
}

export const pluginRegistry = new PluginRegistry();
