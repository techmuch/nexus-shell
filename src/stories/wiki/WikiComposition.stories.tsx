import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { WikiNavigator } from '../../components/widgets/wiki/WikiNavigator';
import { WikiEditor } from '../../components/widgets/wiki/WikiEditor';
import { WikiHistorySidebar } from '../../components/widgets/wiki/WikiHistorySidebar';
import { AiCoWriterWorkspace } from '../../components/widgets/wiki/AiCoWriterWorkspace';
import { WikiChatWidget } from '../../components/widgets/wiki/WikiChatWidget';
import { SemanticLinkMapper } from '../../components/widgets/wiki/SemanticLinkMapper';

const meta: Meta = {
  title: 'Compositions/Wiki Workspace',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const WikiWorkspace: React.FC = () => {
  const [rightPanelTab, setRightPanelTab] = useState<'ai' | 'chat' | 'history'>('chat');
  const [mainView, setMainView] = useState<'editor' | 'graph'>('editor');

  return (
    <div className="flex w-screen h-screen bg-[var(--background)] text-[var(--foreground)] overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-[280px] h-full flex-shrink-0 border-r border-[var(--border)]">
        <WikiNavigator />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Main View Toggle */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border)] bg-[var(--muted)]/50">
          <button 
            onClick={() => setMainView('editor')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${mainView === 'editor' ? 'bg-[var(--background)] shadow-sm' : 'hover:bg-[var(--background)]/50 text-[var(--muted-foreground)]'}`}
          >
            Editor
          </button>
          <button 
            onClick={() => setMainView('graph')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${mainView === 'graph' ? 'bg-[var(--background)] shadow-sm' : 'hover:bg-[var(--background)]/50 text-[var(--muted-foreground)]'}`}
          >
            Knowledge Graph
          </button>
        </div>

        {/* Active Main View */}
        <div className="flex-1 overflow-hidden relative">
          {mainView === 'editor' ? <WikiEditor /> : <SemanticLinkMapper />}
        </div>
      </div>

      {/* Right Sidebar (Utility Panels) */}
      <div className="w-[320px] h-full flex-shrink-0 flex flex-col border-l border-[var(--border)]">
        {/* Tab Header */}
        <div className="flex border-b border-[var(--border)]">
          <button
            onClick={() => setRightPanelTab('chat')}
            className={`flex-1 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
              rightPanelTab === 'chat' 
                ? 'bg-[var(--background)] border-b-2 border-indigo-500' 
                : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--background)]'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setRightPanelTab('ai')}
            className={`flex-1 py-2 text-xs font-medium uppercase tracking-wider transition-colors border-l border-[var(--border)] ${
              rightPanelTab === 'ai' 
                ? 'bg-[var(--background)] border-b-2 border-indigo-500' 
                : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--background)]'
            }`}
          >
            Co-Writer
          </button>
          <button
            onClick={() => setRightPanelTab('history')}
            className={`flex-1 py-2 text-xs font-medium uppercase tracking-wider transition-colors border-l border-[var(--border)] ${
              rightPanelTab === 'history' 
                ? 'bg-[var(--background)] border-b-2 border-indigo-500' 
                : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--background)]'
            }`}
          >
            History
          </button>
        </div>

        {/* Active Tab Content */}
        <div className="flex-1 overflow-hidden relative">
          <div className={`absolute inset-0 transition-opacity ${rightPanelTab === 'chat' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <WikiChatWidget />
          </div>
          <div className={`absolute inset-0 transition-opacity ${rightPanelTab === 'ai' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <AiCoWriterWorkspace />
          </div>
          <div className={`absolute inset-0 transition-opacity ${rightPanelTab === 'history' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <WikiHistorySidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export const FullWorkspace: Story = {
  render: () => <WikiWorkspace />,
};
