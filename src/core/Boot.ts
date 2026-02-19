import { commandRegistry } from './registry/CommandRegistry';
import { menuRegistry } from './registry/MenuRegistry';
import { pluginRegistry } from './registry/PluginRegistry';
import { useLayoutStore } from './services/LayoutService';
import { useRightSidebarStore } from './services/RightSidebarService';
import { ExamplePlugin } from '../plugins/ExamplePlugin';

/**
 * Initializes the shell's core commands and menus.
 */
export const initializeShell = () => {
  // Register Core Commands
  commandRegistry.registerCommand({
    id: 'nexus.new-tab',
    label: 'New Welcome Tab',
    keybinding: 'Control+N',
    execute: () => useLayoutStore.getState().addTab('welcome', 'Welcome'),
  });

  commandRegistry.registerCommand({
    id: 'nexus.toggle-chat',
    label: 'Toggle Chat Pane',
    keybinding: 'Control+I',
    execute: () => useRightSidebarStore.getState().toggleChat(),
  });

  commandRegistry.registerCommand({
    id: 'nexus.about',
    label: 'About Nexus Shell',
    keybinding: 'Control+H',
    execute: () => alert('Nexus-Shell Framework v0.1.0\nProfessional-grade Workbench UI'),
  });

  // Register Core Menus
  menuRegistry.registerMenu('File', {
    id: 'file.new-tab',
    label: 'New Welcome Tab',
    commandId: 'nexus.new-tab',
  });

  menuRegistry.registerMenu('Help', {
    id: 'help.about',
    label: 'About',
    commandId: 'nexus.about',
  });

  // Register and Activate Plugins
  pluginRegistry.registerPlugin(ExamplePlugin);
  pluginRegistry.activatePlugin('plugin-example');

  console.log('Nexus Shell Core Initialized');
};
