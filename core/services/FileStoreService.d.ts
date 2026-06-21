import { ITreeNode } from '../../components/widgets/TreeWidget';

interface FileStoreState {
    nodes: ITreeNode[];
    fetchFiles: () => Promise<void>;
    addFile: (parentId: string | null, file: ITreeNode) => Promise<void>;
    deleteFile: (id: string) => Promise<void>;
    renameFile: (id: string, newName: string) => Promise<void>;
}
export declare const useFileStore: import('zustand').UseBoundStore<import('zustand').StoreApi<FileStoreState>>;
export {};
