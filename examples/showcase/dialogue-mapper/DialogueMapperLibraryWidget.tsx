import React from 'react';
import { DialogueMapperLibrary } from './DialogueMapperLibrary';
import { useDialogueMappingStore, type IbisNodeType } from './DialogueMappingService';

/**
 * The node library as a dockable tab.
 *
 * Dragging is handled by `NodePalette` inside the library, so this only has to
 * say what a click means when there is no canvas position to use.
 */
export const DialogueMapperLibraryWidget: React.FC = () => {
  const addNode = useDialogueMappingStore((state) => state.addNode);

  return (
    <div className="h-full w-full overflow-hidden bg-card">
      <DialogueMapperLibrary
        onAddNode={(type: IbisNodeType) =>
          addNode(type, { x: 350 + Math.random() * 50, y: 150 + Math.random() * 50 })
        }
        className="h-full w-full border-0"
      />
    </div>
  );
};
