import { Node, Edge } from 'reactflow';

export interface IMockupAnnotation {
    id: string;
    type: 'stroke' | 'rect' | 'circle' | 'arrow' | 'comment';
    color: string;
    points?: {
        x: number;
        y: number;
    }[];
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    text?: string;
    elementSelector?: string;
    versionId: string;
}
export interface IMockupVersion {
    id: string;
    label: string;
    timestamp: string;
    htmlContent: string;
    annotations: IMockupAnnotation[];
}
export interface IMockupView {
    id: string;
    name: string;
    description?: string;
    activeVersionId: string;
    versions: IMockupVersion[];
    parentId?: string | null;
}
interface MockupReviewState {
    views: IMockupView[];
    activeViewId: string | null;
    compareVersionId: string | null;
    nodes: Node[];
    edges: Edge[];
    implementationPlan: string;
    setActiveViewId: (id: string | null) => void;
    setActiveVersionId: (viewId: string, versionId: string) => void;
    setCompareVersionId: (versionId: string | null) => void;
    setViewParentId: (viewId: string, parentId: string | null) => void;
    addAnnotation: (viewId: string, versionId: string, annotation: Omit<IMockupAnnotation, 'versionId'>) => void;
    undoAnnotation: (viewId: string, versionId: string) => void;
    deleteAnnotation: (viewId: string, versionId: string, annotationId: string) => void;
    updateAnnotationText: (viewId: string, versionId: string, annotationId: string, text: string) => void;
    addMockupView: (name: string, description?: string, htmlContent?: string) => string;
    addMockupVersion: (viewId: string, label: string, htmlContent: string) => string;
    updateWorkflow: (nodes: Node[], edges: Edge[]) => void;
    setImplementationPlan: (plan: string) => void;
    generateImplementationPlanAction: () => void;
    refineImplementationPlanAction: (refinementPrompt: string) => void;
    exportHistoryJson: () => string;
}
export declare const useMockupReviewStore: import('zustand').UseBoundStore<import('zustand').StoreApi<MockupReviewState>>;
export {};
