export interface IPlugin {
  id: string;
  name: string;
  activate: () => void;
  deactivate: () => void;
}

export class PluginRegistry {
  private plugins = new Map<string, IPlugin>();

  registerPlugin(plugin: IPlugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin ${plugin.id} is already registered.`);
      return;
    }
    this.plugins.set(plugin.id, plugin);
    console.log(`Plugin ${plugin.name} (${plugin.id}) registered.`);
  }

  activatePlugin(id: string): void {
    const plugin = this.plugins.get(id);
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
