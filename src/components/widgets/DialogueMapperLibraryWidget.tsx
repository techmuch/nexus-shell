import React from 'react';
import { DialogueMapperLibrary } from './DialogueMapperLibrary';
import { useDialogueMappingStore, IbisNodeType } from '../../core/services/DialogueMappingService';

export const DialogueMapperLibraryWidget: React.FC = () => {
  const addNode = useDialogueMappingStore((state) => state.addNode);

  const handleAddNode = (type: IbisNodeType) => {
    // Add in the center of the canvas
    addNode(type, { x: 350 + Math.random() * 50, y: 150 + Math.random() * 50 });
  };

  const handleDragStart = (event: React.DragEvent, type: IbisNodeType) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="h-full w-full bg-card overflow-hidden">
      <DialogueMapperLibrary 
        onAddNode={handleAddNode} 
        onDragStart={handleDragStart}
        className="w-full h-full border-r-0 border-b-0 border-t-0 animate-none"
      />
    </div>
  );
};
