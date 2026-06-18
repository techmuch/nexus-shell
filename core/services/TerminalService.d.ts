interface TerminalState {
    isOpen: boolean;
    history: string[];
    setOpen: (open: boolean) => void;
    toggle: () => void;
    addHistory: (line: string) => void;
    clearHistory: () => void;
}
export declare const useTerminalStore: import('zustand').UseBoundStore<import('zustand').StoreApi<TerminalState>>;
export {};
