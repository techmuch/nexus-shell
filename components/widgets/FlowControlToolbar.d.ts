import { default as React } from '../../../node_modules/react';

export interface FlowControlToolbarProps {
    variant?: 'header' | 'floating';
    dragMode?: 'pan' | 'select';
    onDragModeChange?: (mode: 'pan' | 'select') => void;
    autoLayoutMode: 'vertical' | 'horizontal' | 'freeform';
    onAutoLayoutModeChange: (mode: 'vertical' | 'horizontal' | 'freeform') => void;
    onUndo: () => void;
    canUndo?: boolean;
    className?: string;
    isLibraryOpen?: boolean;
    onToggleLibrary?: () => void;
    isInspectorOpen?: boolean;
    onToggleInspector?: () => void;
}
export declare const FlowControlToolbar: React.FC<FlowControlToolbarProps>;
export default FlowControlToolbar;
