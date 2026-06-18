import { default as React } from '../../../node_modules/react';

export interface FlowControlToolbarProps {
    variant?: 'header' | 'floating';
    dragMode?: 'pan' | 'select';
    onDragModeChange?: (mode: 'pan' | 'select') => void;
    onLayoutChange: (direction: 'vertical' | 'horizontal' | 'grid') => void;
    onUndo: () => void;
    canUndo?: boolean;
    title?: string;
    className?: string;
}
export declare const FlowControlToolbar: React.FC<FlowControlToolbarProps>;
export default FlowControlToolbar;
