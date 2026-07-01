import { IPlugin } from '../core/registry/PluginRegistry';
import { componentRegistry } from '../core/registry/ComponentRegistry';
import { commandRegistry } from '../core/registry/CommandRegistry';
import { menuRegistry } from '../core/registry/MenuRegistry';
import { useModalStore } from '../core/services/ModalStoreService';

// Import Widgets
import { WikiNavigator } from '../components/widgets/wiki/WikiNavigator';
import { WikiEditor } from '../components/widgets/wiki/WikiEditor';
import { WikiHistorySidebar } from '../components/widgets/wiki/WikiHistorySidebar';
import { AiCoWriterWorkspace } from '../components/widgets/wiki/AiCoWriterWorkspace';
import { WikiChatWidget } from '../components/widgets/wiki/WikiChatWidget';
import { SemanticLinkMapper } from '../components/widgets/wiki/SemanticLinkMapper';

export const WikiPlugin: IPlugin = {
  id: 'plugin-wiki',
  name: 'Nexus Wiki Module',
  activate: () => {
    // 1. Register Components
    componentRegistry.register('wiki-navigator', WikiNavigator);
    componentRegistry.register('wiki-editor', WikiEditor);
    componentRegistry.register('wiki-history', WikiHistorySidebar);
    componentRegistry.register('wiki-ai-cowriter', AiCoWriterWorkspace);
    componentRegistry.register('wiki-chat', WikiChatWidget);
    componentRegistry.register('wiki-semantic-mapper', SemanticLinkMapper);

    // 2. Register Commands
    commandRegistry.registerCommand({
      id: 'wiki.new-page',
      label: 'Wiki: Create New Page',
      execute: () => {
        useModalStore.getState().openAlert('Drafting new wiki page stub (simulated).');
      },
    });

    commandRegistry.registerCommand({
      id: 'wiki.open-chat',
      label: 'Wiki: Open AI Chat',
      execute: () => {
        // Logic to focus the wiki chat panel would go here
        console.log('Opened Wiki Chat');
      },
    });

    // 3. Register Menus
    menuRegistry.registerMenu('File', {
      id: 'file.wiki-new',
      label: 'New Wiki Page',
      commandId: 'wiki.new-page',
    });

    menuRegistry.registerMenu('View', {
      id: 'view.wiki-chat',
      label: 'Semantic Wiki Chat',
      commandId: 'wiki.open-chat',
    });

    console.log('Nexus Wiki Plugin Activated.');
  },
  deactivate: () => {
    console.log('Nexus Wiki Plugin Deactivated.');
  },
};
