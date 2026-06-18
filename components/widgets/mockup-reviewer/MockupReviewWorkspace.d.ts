import { default as React } from '../../../../node_modules/react';

interface MockupReviewWorkspaceProps {
    tool: 'select' | 'pen' | 'rect' | 'circle' | 'arrow' | 'comment' | 'eraser';
    color: string;
    selectedAnnotationId: string | null;
    setSelectedAnnotationId: (id: string | null) => void;
}
export declare const MockupReviewWorkspace: React.FC<MockupReviewWorkspaceProps>;
export {};
