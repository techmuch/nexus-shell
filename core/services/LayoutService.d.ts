import { Model, IJsonModel } from 'flexlayout-react';

interface LayoutState {
    model: Model;
    dirtyTabs: Set<string>;
    storageKey: string;
    disableLocalStorage: boolean;
    initLayout: (json: any, disableStorage?: boolean) => void;
    setModel: (model: Model) => void;
    setStorageKey: (key: string, fallbackLayout?: IJsonModel) => void;
    addTab: (componentName: string, title?: string, overrideConfig?: Record<string, any>) => void;
    setTabDirty: (tabId: string, dirty: boolean) => void;
    isTabDirty: (tabId: string) => boolean;
}
export declare const defaultLayout: IJsonModel;
export declare const dialogueMappingLayoutJson: IJsonModel;
export declare const dialogueMapperMenus: {
    File: {
        id: string;
        label: string;
        commandId: string;
    }[];
    Edit: {
        id: string;
        label: string;
        commandId: string;
    }[];
    Layout: {
        id: string;
        label: string;
        commandId: string;
    }[];
    Argumentation: {
        id: string;
        label: string;
        commandId: string;
    }[];
    Help: {
        id: string;
        label: string;
        commandId: string;
    }[];
};
export declare const useLayoutStore: import('zustand').UseBoundStore<import('zustand').StoreApi<LayoutState>>;
export {};
