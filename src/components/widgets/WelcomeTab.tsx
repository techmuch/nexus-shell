import React from 'react';
import { TabNode } from 'flexlayout-react';
import { useLayoutStore } from '../../core/services/LayoutService';

interface WelcomeTabProps {
  node: TabNode;
}

export const WelcomeTab: React.FC<WelcomeTabProps> = ({ node }) => {
  const { isTabDirty, setTabDirty } = useLayoutStore();
  const nodeId = node.getId();
  const dirty = isTabDirty(nodeId);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-8">
      <h1 className="text-4xl font-bold text-primary">Nexus Shell</h1>
      <p className="text-muted-foreground">
        A professional-grade frontend framework built with React and TypeScript.
      </p>
      <p className="text-sm text-muted-foreground">
        Start by exploring the menu or dragging tabs.
      </p>

      <div className="mt-8 p-4 border rounded bg-muted/20">
        <p className="text-xs mb-2">Tab Persistence & Lifecycle Test:</p>
        <button
          onClick={() => setTabDirty(nodeId, !dirty)}
          className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${
            dirty
              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          {dirty ? 'Mark as Saved (Clear Dirty)' : 'Mark as Dirty (Unsaved Changes)'}
        </button>
        {dirty && (
          <p className="text-[10px] mt-1 text-destructive">
            This tab will now prompt before closing.
          </p>
        )}
      </div>
    </div>
  );
};
