import { commandRegistry } from './registry/CommandRegistry';
import { menuRegistry } from './registry/MenuRegistry';
import { pluginRegistry } from './registry/PluginRegistry';
import { useLayoutStore } from './services/LayoutService';
import { useSidebarStore } from './services/SidebarService';
import { useRightSidebarStore } from './services/RightSidebarService';
import { useChatStore } from './services/ChatService';
import { useThemeStore, ThemeType } from './services/ThemeService';
import { ExamplePlugin } from '../plugins/ExamplePlugin';
import { Files, Search, GitGraph, Plug } from "lucide-react";
import { FilesSidebar } from '../components/widgets/FilesSidebar';

/**
 * Initializes the shell's core commands and menus.
 */
export const initializeShell = async () => {
  // Register Core Sidebar Panels
  useSidebarStore.getState().setPanels([
    {
      id: 'files',
      label: 'Explorer',
      icon: Files,
      component: FilesSidebar,
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      component: () => <div className="p-4 text-sm italic text-muted-foreground">Search functionality coming soon...</div>,
    },
    {
      id: 'git',
      label: 'Source Control',
      icon: GitGraph,
      component: () => <div className="p-4 text-sm italic text-muted-foreground">Source control integration pending...</div>,
    },
    {
      id: 'plugins',
      label: 'Extensions',
      icon: Plug,
      component: () => <div className="p-4 text-sm italic text-muted-foreground">Extension manager view...</div>,
    },
  ]);

  // Register Core Slash Commands
  useChatStore.getState().setSlashCommands([
    {
      command: 'help',
      description: 'Show available commands',
      execute: () => alert('Available commands: /help, /clear, /theme [light|dark|gt]'),
    },
    {
      command: 'clear',
      description: 'Clear chat history',
      execute: () => {
        // In a real app, we'd clear messages in the ChatPane state.
        // For now, this is a placeholder for the logic.
        console.log('Chat clear triggered');
      },
    },
    {
      command: 'theme',
      description: 'Change the application theme',
      execute: (args) => {
        const theme = args[0] as ThemeType;
        if (['light', 'dark', 'gt'].includes(theme)) {
          useThemeStore.getState().setTheme(theme);
        } else {
          alert('Usage: /theme [light|dark|gt]');
        }
      },
    },
  ]);

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

  // Demonstrate Lazy Loading
  pluginRegistry.registerLazyPlugin('plugin-example', async () => {
    // In a real app, this would be: return (await import('../plugins/ExamplePlugin')).ExamplePlugin;
    return ExamplePlugin;
  });

  // Activate Plugins
  await pluginRegistry.activatePlugin('plugin-example');

  console.log('Nexus Shell Core Initialized');
};
