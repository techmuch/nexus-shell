import { IPlugin } from '../core/registry/PluginRegistry';
import { commandRegistry } from '../core/registry/CommandRegistry';
import { menuRegistry } from '../core/registry/MenuRegistry';

export const ExamplePlugin: IPlugin = {
  id: 'plugin-example',
  name: 'Example Plugin',
  activate: () => {
    // Register a command from a plugin
    commandRegistry.registerCommand({
      id: 'plugin.hello',
      label: 'Plugin Hello',
      execute: () => {
        alert('Hello from Example Plugin!');
      },
    });

    // Register a menu item from a plugin
    menuRegistry.registerMenu('View', {
      id: 'view.greet',
      label: 'Greet from Plugin',
      commandId: 'plugin.hello',
    });

    console.log('Example Plugin Activated');
  },
  deactivate: () => {
    console.log('Example Plugin Deactivated');
  },
};
