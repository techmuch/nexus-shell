import { default as React } from '../../../node_modules/react';

export interface ISearchResult {
    id: string;
    title: string;
    description?: string;
    icon?: React.ComponentType<any>;
    category?: string;
}
export interface SearchWidgetProps {
    placeholder?: string;
    onSearch: (query: string) => void;
    results: ISearchResult[];
    onSelect: (result: ISearchResult) => void;
    suggestions?: string[];
    loading?: boolean;
    className?: string;
}
export declare const SearchWidget: React.FC<SearchWidgetProps>;
