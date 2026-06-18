import { default as React } from '../../../node_modules/react';

export interface IDataGridColumn<T = any> {
    key: string;
    header: string;
    width?: string | number;
    sortable?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
}
export interface DataGridProps<T = any> {
    columns: IDataGridColumn<T>[];
    data: T[];
    onRowClick?: (row: T) => void;
    selectedRowId?: string | number;
    rowKey?: keyof T;
    virtualized?: boolean;
    showFilter?: boolean;
    loading?: boolean;
    placeholder?: string;
    className?: string;
}
export declare const DataGrid: <T extends Record<string, any>>({ columns, data, onRowClick, selectedRowId, rowKey, virtualized, showFilter, loading, placeholder, className, }: DataGridProps<T>) => import("react/jsx-runtime").JSX.Element;
