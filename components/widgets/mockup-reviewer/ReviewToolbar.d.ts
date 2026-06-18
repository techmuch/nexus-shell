import { default as React } from '../../../../node_modules/react';

interface ReviewToolbarProps {
    tool: 'select' | 'pen' | 'rect' | 'circle' | 'arrow' | 'comment' | 'eraser';
    setTool: (t: 'select' | 'pen' | 'rect' | 'circle' | 'arrow' | 'comment' | 'eraser') => void;
    color: string;
    setColor: (c: string) => void;
    selectedAnnotationId: string | null;
    setSelectedAnnotationId: (id: string | null) => void;
}
export declare const ReviewToolbar: React.FC<ReviewToolbarProps>;
export {};
