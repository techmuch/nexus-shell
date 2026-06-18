import { default as React } from '../../../node_modules/react';
import { IbisNodeType } from '../../core/services/DialogueMappingService';

export interface DialogueMapperLibraryProps {
    onAddNode: (type: IbisNodeType) => void;
    onClose?: () => void;
    className?: string;
    onDragStart?: (event: React.DragEvent<HTMLButtonElement>, type: IbisNodeType) => void;
}
export declare const DialogueMapperLibrary: React.FC<DialogueMapperLibraryProps>;
export default DialogueMapperLibrary;
