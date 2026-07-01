export interface WikiPage {
    id: string;
    title: string;
    content: string;
    status: 'Published' | 'Draft' | 'Outdated';
    tags: string[];
}
export interface WikiCommit {
    id: string;
    pageId: string;
    timestamp: string;
    author: string;
    message: string;
    diffSummary: string;
    contentSnapshot: string;
}
interface WikiState {
    pages: Record<string, WikiPage>;
    commits: Record<string, WikiCommit[]>;
    activePageId: string | null;
    setActivePage: (id: string | null) => void;
    updatePageContent: (id: string, newContent: string) => void;
    commitPageChanges: (id: string, author: string, message?: string) => Promise<void>;
    rollbackToCommit: (pageId: string, commitId: string) => void;
    generateCompletion: (context: string, prompt: string) => Promise<string>;
    summarizeDiff: (oldContent: string, newContent: string) => Promise<string>;
    semanticSearch: (query: string) => Promise<{
        pageId: string;
        snippet: string;
    }[]>;
}
export declare const useWikiStore: import('zustand').UseBoundStore<import('zustand').StoreApi<WikiState>>;
export {};
