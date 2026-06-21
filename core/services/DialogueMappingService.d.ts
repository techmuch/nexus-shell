import { StoreApi, UseBoundStore } from 'zustand';
import { Node, Edge, Connection } from 'reactflow';

export type IbisNodeType = 'question' | 'idea' | 'pro' | 'con' | 'note' | 'decision' | 'link' | 'image' | 'map';
export interface IDialogueNodeData {
    id: string;
    type: IbisNodeType;
    title: string;
    description?: string;
    tags?: string[];
    author?: string;
    timestamp: string;
    status?: 'pending' | 'accepted' | 'rejected';
    url?: string;
    imageUrl?: string;
    autoEdit?: boolean;
    freeformPosition?: {
        x: number;
        y: number;
    };
}
interface DialogueMappingState {
    nodes: Node<IDialogueNodeData>[];
    edges: Edge[];
    selectedNodeId: string | null;
    layoutHistory: Node<IDialogueNodeData>[][];
    autoLayoutMode: 'vertical' | 'horizontal' | 'freeform';
    setAutoLayoutMode: (mode: 'vertical' | 'horizontal' | 'freeform') => void;
    setNodes: (nodes: Node<IDialogueNodeData>[]) => void;
    setEdges: (edges: Edge[]) => void;
    setSelectedNodeId: (id: string | null) => void;
    addNode: (type: IbisNodeType, position: {
        x: number;
        y: number;
    }, parentNodeId?: string | null) => void;
    updateNodeData: (id: string, updates: Partial<IDialogueNodeData>) => void;
    deleteNode: (id: string) => void;
    deleteEdge: (id: string) => void;
    pasteNode: (type: IbisNodeType, position: {
        x: number;
        y: number;
    }, initialData: Partial<IDialogueNodeData>) => void;
    connectNodes: (connection: Connection) => boolean;
    validateConnection: (sourceId: string, targetId: string) => {
        valid: boolean;
        reason?: string;
    };
    triggerAutoLayout: (direction: 'vertical' | 'horizontal' | 'grid') => void;
    undoLayout: () => void;
    connectionError: string | null;
    setConnectionError: (error: string | null) => void;
    recordHistory: () => void;
    importMap: (jsonStr: string) => boolean;
    exportMap: () => string;
}
export declare let globalFallbackStore: UseBoundStore<StoreApi<DialogueMappingState>> | null;
export declare const getMapStore: (mapId: string) => UseBoundStore<StoreApi<DialogueMappingState>>;
export declare const useDialogueMappingStore: UseBoundStore<StoreApi<DialogueMappingState>>;
export {};
