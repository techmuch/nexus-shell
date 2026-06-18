import { default as React } from '../../../node_modules/react';
import { TabNode } from 'flexlayout-react';

export interface DialogueMappingWidgetProps {
    node?: TabNode;
    defaultDragMode?: 'pan' | 'select';
    hideInternalLibrary?: boolean;
    hideInternalInspector?: boolean;
}
export declare const DialogueMappingWidget: React.FC<DialogueMappingWidgetProps>;
export default DialogueMappingWidget;
