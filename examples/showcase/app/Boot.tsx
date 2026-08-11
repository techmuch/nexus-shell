import { commandRegistry } from '../../../src/core/registry/CommandRegistry';
import { menuRegistry } from '../../../src/core/registry/MenuRegistry';
import { pluginRegistry } from '../../../src/core/registry/PluginRegistry';
import { useLayoutStore } from '../../../src/core/services/LayoutService';
import { useSidebarStore } from '../../../src/core/services/SidebarService';
import { useRightSidebarStore } from '../../../src/core/services/RightSidebarService';
import { useChatStore } from '../../../src/core/services/ChatService';
import { useThemeStore, ThemeType } from '../../../src/core/services/ThemeService';
import { useStatusBarStore } from '../../../src/core/services/StatusBarService';
import { useTerminalStore } from '../../../src/core/services/TerminalService';
import { useModalStore } from '../../../src/core/services/ModalStoreService';
import { ExamplePlugin } from '../plugins/ExamplePlugin';
import { Files, Search, GitGraph, Plug, GitBranch, Bell, MessageCircle, Terminal as TerminalIcon } from "lucide-react";
import { FilesSidebar } from './FilesSidebar';
import { componentRegistry } from '../../../src/core/registry/ComponentRegistry';
import { WelcomeTab } from './WelcomeTab';
import { DataGrid } from '../../../src/components/widgets/DataGrid';
import { MockupReviewWidget } from '../mockup-reviewer/MockupReviewWidget';
import { DialogueMappingWidget } from '../dialogue-mapper/DialogueMappingWidget';
import { DialogueMapperLibraryWidget } from '../dialogue-mapper/DialogueMapperLibraryWidget';
import { ArgumentInspectorWidget } from '../dialogue-mapper/ArgumentInspectorWidget';

/**
 * Initializes the shell's core commands and menus.
 */
export const initializeShell = async () => {
  // Register Core Tab Components
  componentRegistry.register('welcome', WelcomeTab);
  componentRegistry.register('datagrid', DataGrid);
  componentRegistry.register('mockup-review', MockupReviewWidget);
  componentRegistry.register('dialogue-map', DialogueMappingWidget);
  componentRegistry.register('dialogue-library', DialogueMapperLibraryWidget);
  componentRegistry.register('argument-inspector', ArgumentInspectorWidget);
  // Register Core Status Bar Widgets
  useStatusBarStore.getState().setWidgets([
    {
      id: 'git-branch',
      label: 'main',
      icon: GitBranch,
      alignment: 'left',
      priority: 100,
    },
    {
      id: 'notifications',
      label: '0',
      icon: Bell,
      alignment: 'left',
      priority: 90,
    },
    {
      id: 'status-text',
      label: 'Ready',
      alignment: 'right',
      priority: 10,
    },
    {
      id: 'terminal-toggle',
      label: 'Terminal',
      icon: TerminalIcon,
      alignment: 'right',
      onClick: () => useTerminalStore.getState().toggle(),
      priority: 110,
    },
    {
      id: 'chat-toggle',
      label: 'Chat',
      icon: MessageCircle,
      alignment: 'right',
      commandId: 'nexus.toggle-chat',
      priority: 100,
    },
    {
      id: 'line-col',
      label: 'Ln 1, Col 1',
      alignment: 'right',
      priority: 50,
    },
    {
      id: 'encoding',
      label: 'UTF-8',
      alignment: 'right',
      priority: 40,
    }
  ]);

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
      execute: () => useModalStore.getState().openAlert('Available commands: /help, /clear, /theme [light|dark|gt]'),
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
          useModalStore.getState().openAlert('Usage: /theme [light|dark|gt]');
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
    id: 'nexus.open-mockup-review',
    label: 'Open Mockup Reviewer',
    keybinding: 'Control+M',
    execute: () => useLayoutStore.getState().addTab('mockup-review', 'Mockup Reviewer'),
  });

  commandRegistry.registerCommand({
    id: 'nexus.open-dialogue-map',
    label: 'Open Dialogue Map',
    keybinding: 'Control+D',
    execute: () => useLayoutStore.getState().addTab('dialogue-map', 'Dialogue Map'),
  });

  commandRegistry.registerCommand({
    id: 'nexus.about',
    label: 'About Nexus Shell',
    keybinding: 'Control+H',
    execute: () => useModalStore.getState().openAlert('Nexus-Shell Framework v0.1.0\nProfessional-grade Workbench UI'),
  });

  // Register Core Menus
  menuRegistry.registerMenu('File', {
    id: 'file.new-tab',
    label: 'New Welcome Tab',
    commandId: 'nexus.new-tab',
  });

  menuRegistry.registerMenu('View', {
    id: 'view.mockup-review',
    label: 'Mockup Reviewer',
    commandId: 'nexus.open-mockup-review',
  });

  menuRegistry.registerMenu('View', {
    id: 'view.dialogue-map',
    label: 'Dialogue Map',
    commandId: 'nexus.open-dialogue-map',
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
