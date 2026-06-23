export type ModalType = 'alert' | 'confirm' | 'prompt';
interface ModalState {
    isOpen: boolean;
    type: ModalType;
    title: string;
    message: string;
    defaultValue?: string;
    resolve: ((value: any) => void) | null;
    openAlert: (message: string, title?: string) => Promise<void>;
    openConfirm: (message: string, title?: string) => Promise<boolean>;
    openPrompt: (message: string, defaultValue?: string, title?: string) => Promise<string | null>;
    close: (value?: any) => void;
}
export declare const useModalStore: import('zustand').UseBoundStore<import('zustand').StoreApi<ModalState>>;
export {};
