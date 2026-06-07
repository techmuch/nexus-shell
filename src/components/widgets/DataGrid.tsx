import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TableVirtuoso } from 'react-virtuoso';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, X, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

export const DataGrid = <T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  selectedRowId,
  rowKey = 'id' as keyof T,
  virtualized = true,
  showFilter = true,
  loading = false,
  placeholder = "No data available",
  className,
}: DataGridProps<T>) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset focus index when sortedData or filter changes
  useEffect(() => {
    setFocusedIndex(-1);
  }, [filterQuery, sortConfig]);

  // Handle global filter
  const filteredData = useMemo(() => {
    if (!filterQuery) return data;
    const q = filterQuery.toLowerCase();
    return data.filter((row) => {
      return Object.values(row).some((val) => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [data, filterQuery]);

  // Handle sorting
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    const { key, direction } = sortConfig;
    return [...filteredData].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return direction === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key: string, sortable?: boolean) => {
    if (sortable === false) return;
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (sortedData.length === 0 || loading) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => {
        const next = prev + 1;
        return next >= sortedData.length ? 0 : next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? sortedData.length - 1 : next;
      });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < sortedData.length) {
        const row = sortedData[focusedIndex];
        if (onRowClick) {
          onRowClick(row);
        }
      }
    }
  };

  const renderSortIcon = (column: IDataGridColumn<T>) => {
    if (column.sortable === false) return null;
    if (sortConfig?.key !== column.key) {
      return <ChevronsUpDown size={14} className="text-muted-foreground/60 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp size={14} className="text-primary ml-1.5" />
    ) : (
      <ChevronDown size={14} className="text-primary ml-1.5" />
    );
  };

  const renderHeader = () => (
    <tr role="row" className="border-b border-border bg-muted/30 select-none">
      {columns.map((col) => (
        <th
          key={col.key}
          role="columnheader"
          aria-sort={
            sortConfig?.key === col.key
              ? sortConfig.direction === 'asc'
                ? 'ascending'
                : 'descending'
              : 'none'
          }
          className={cn(
            "p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left transition-colors",
            col.sortable !== false && "cursor-pointer hover:bg-accent/30 hover:text-foreground group"
          )}
          style={{ width: col.width }}
          onClick={() => handleSort(col.key, col.sortable)}
        >
          <div className="flex items-center">
            <span>{col.header}</span>
            {renderSortIcon(col)}
          </div>
        </th>
      ))}
    </tr>
  );

  const renderRowCells = (row: T, index: number) => {
    const isSelected = selectedRowId !== undefined && row[rowKey] === selectedRowId;
    const isFocused = focusedIndex === index;

    return (
      <tr
        key={String(row[rowKey] || index)}
        role="row"
        aria-selected={isSelected}
        onClick={() => onRowClick && onRowClick(row)}
        className={cn(
          "border-b border-border/40 hover:bg-accent/40 transition-colors cursor-pointer text-sm outline-none",
          isSelected && "bg-primary/10 text-primary hover:bg-primary/15 font-medium border-l-2 border-l-primary",
          isFocused && "bg-accent/60 ring-1 ring-inset ring-ring"
        )}
      >
        {columns.map((col) => {
          const val = row[col.key];
          return (
            <td key={col.key} role="gridcell" className="p-3 align-middle truncate max-w-xs">
              {col.render ? col.render(val, row) : val !== undefined && val !== null ? String(val) : ''}
            </td>
          );
        })}
      </tr>
    );
  };

  const virtuosoComponents = useMemo(() => ({
    Table: (props: any) => (
      <table
        {...props}
        role="grid"
        className="w-full border-collapse text-left bg-background text-foreground"
      />
    ),
    TableHead: React.forwardRef((props: any, ref: any) => (
      <thead ref={ref} {...props} className="sticky top-0 bg-background z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.1)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]" />
    )),
    TableBody: React.forwardRef((props: any, ref: any) => (
      <tbody ref={ref} {...props} />
    )),
    TableRow: ({ item, context, ...props }: any) => {
      if (!context || !item) return <tr {...props} />;
      const isSelected = context.selectedRowId !== undefined && item[context.rowKey] === context.selectedRowId;
      const isFocused = context.focusedIndex === props['data-index'];
      return (
        <tr
          {...props}
          onClick={() => context.onRowClick?.(item)}
          className={cn(
            "border-b border-border/40 hover:bg-accent/40 transition-colors cursor-pointer text-sm outline-none",
            isSelected && "bg-primary/10 text-primary hover:bg-primary/15 font-medium border-l-2 border-l-primary",
            isFocused && "bg-accent/60 ring-1 ring-inset ring-ring"
          )}
        />
      );
    }
  }), []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-3">
          <Loader2 className="animate-spin text-primary" size={24} />
          <span className="text-xs text-muted-foreground">Loading dataset...</span>
        </div>
      );
    }

    if (sortedData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-center px-4">
          <span className="text-sm font-medium text-foreground">{placeholder}</span>
          <span className="text-xs text-muted-foreground mt-1">No items matched your search query.</span>
        </div>
      );
    }

    if (virtualized) {
      return (
        <div className="flex-1 min-h-[300px] h-full relative">
          <TableVirtuoso
            data={sortedData}
            context={{
              selectedRowId,
              focusedIndex,
              rowKey,
              onRowClick
            }}
            components={virtuosoComponents}
            fixedHeaderContent={renderHeader}
            itemContent={(_index, row) => {
              return (
                <>
                  {columns.map((col) => {
                    const val = row[col.key];
                    return (
                      <td key={col.key} role="gridcell" className="p-3 align-middle truncate max-w-xs">
                        {col.render ? col.render(val, row) : val !== undefined && val !== null ? String(val) : ''}
                      </td>
                    );
                  })}
                </>
              );
            }}
          />
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-auto">
        <table role="grid" className="w-full border-collapse text-left bg-background text-foreground">
          <thead>{renderHeader()}</thead>
          <tbody>
            {sortedData.map((row, index) => renderRowCells(row, index))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Data Grid"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex flex-col h-full bg-background border border-border rounded-lg shadow-sm overflow-hidden focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent",
        className
      )}
    >
      {/* Grid Toolbar */}
      {showFilter && (
        <div className="flex items-center justify-between p-3 border-b border-border bg-muted/20">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-2.5 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter table rows..."
              className="w-full bg-secondary/40 border border-border rounded-md pl-8 pr-7 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
            {filterQuery && (
              <button
                onClick={() => setFilterQuery('')}
                className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                aria-label="Clear filter"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground font-medium ml-4">
            {sortedData.length} of {data.length} records
          </div>
        </div>
      )}

      {/* Grid Content */}
      {renderContent()}
    </div>
  );
};
