import { default as React } from '../../../node_modules/react';

export interface IUnifiedSearchResult {
    id: string;
    title: string;
    description?: string;
    category: 'Actions' | 'Files' | 'Map Nodes';
    icon: React.ComponentType<any>;
    originalData: any;
}
export declare const MenuBarSearch: React.FC;
