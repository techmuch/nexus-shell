interface RightSidebarState {
    isChatOpen: boolean;
    setChatOpen: (open: boolean) => void;
    toggleChat: () => void;
}
export declare const useRightSidebarStore: import('zustand').UseBoundStore<import('zustand').StoreApi<RightSidebarState>>;
export {};
