import React, { useState, useMemo, useRef, useEffect, useId, useCallback } from 'react';
import { TableVirtuoso, type TableVirtuosoHandle } from 'react-virtuoso';
import {
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Search,
  X,
  Loader2,
} from 'lucide-react';
import { cn } from '../../lib/cn';

/** A row's identity, read from `rowKey`. */
export type DataGridKey = string | number;

/** A column definition for {@link DataGrid}. */
export interface IDataGridColumn<T = any> {
  /** Property on the row object to read. Also used as the React key. */
  key: string;
  /** Header text. */
  header: string;
  /** Fixed column width as a CSS length or px number. Omit to size flexibly. */
  width?: string | number;
  /** Allow clicking the header to sort by this column. Defaults to `false`. */
  sortable?: boolean;
  /**
   * Custom cell renderer. Receives the cell value and the whole row, so you can
   * render badges, links or derived values. Defaults to the raw value.
   */
  render?: (value: any, row: T) => React.ReactNode;
}

/** The grid's sort state. `null` is unsorted. */
export type DataGridSort = { key: string; direction: 'asc' | 'desc' } | null;

/** What a row is, for {@link DataGridProps.rowClassName}. */
export interface DataGridRowState {
  selected: boolean;
  focused: boolean;
  expanded: boolean;
  index: number;
}

export interface DataGridProps<T = any> {
  /** Columns, in display order. */
  columns: IDataGridColumn<T>[];
  /** Rows to display. Sorting and filtering are applied on top of this array. */
  data: T[];
  /** Called with the clicked row. Also on Enter/Space when nothing else handles them. */
  onRowClick?: (row: T) => void;
  /**
   * Value of `rowKey` on the row to highlight as selected. The single-select
   * shorthand; prefer `selectedKeys` with `selectionMode`.
   */
  selectedRowId?: string | number;
  /** Property used as each row's identity. Defaults to `"id"`. */
  rowKey?: keyof T;
  /**
   * Virtualise rows with `react-virtuoso`. Leave on for large datasets; turn it
   * off when the grid must print or be fully present in the DOM. Defaults to
   * `true`.
   */
  virtualized?: boolean;
  /** Show the built-in filter box above the grid. Defaults to `true`. */
  showFilter?: boolean;
  /** Show a loading indicator in place of rows. Defaults to `false`. */
  loading?: boolean;
  /** Message shown when there are no rows. */
  placeholder?: string;
  /** Extra classes merged onto the root element. */
  className?: string;

  /* Selection --------------------------------------------------------- */

  /**
   * `'single'` selects on click and Space; `'multiple'` adds Mod-click to
   * toggle, Shift-click and Shift+Arrow to extend, Mod+A to select all and
   * Escape to clear. Defaults to `'none'` (or `'single'` when `selectedKeys`
   * is passed).
   */
  selectionMode?: 'none' | 'single' | 'multiple';
  /** Selected row keys, controlled. Omit to let the grid hold them. */
  selectedKeys?: DataGridKey[];
  /** Called with the new selection, in row order. */
  onSelectionChange?: (keys: DataGridKey[], rows: T[]) => void;

  /* Focus and activation --------------------------------------------- */

  /**
   * Called when the keyboard focus moves to a row (arrows, Home/End,
   * PageUp/PageDown, or a click). The "preview" gesture — update a detail
   * view without taking the user anywhere.
   */
  onFocusRow?: (row: T, index: number) => void;
  /**
   * Called on Enter and double-click. The "open" gesture, distinct from
   * moving focus.
   */
  onActivate?: (row: T, index: number) => void;

  /* Sorting and paging ----------------------------------------------- */

  /** Sort state, controlled. Omit to let the grid hold it. */
  sort?: DataGridSort;
  /** Called with the new sort when a header is clicked. */
  onSortChange?: (sort: DataGridSort) => void;
  /**
   * The rows arrive already sorted (by a server, say), so only show the
   * indicators. Defaults to `false`.
   */
  manualSort?: boolean;
  /** Called when the user scrolls near the last row, to load the next page. */
  onEndReached?: () => void;

  /* Rows -------------------------------------------------------------- */

  /** Extra classes for a row, from its data and state. */
  rowClassName?: (row: T, state: DataGridRowState) => string | undefined;
  /** Extra attributes for a row's `<tr>`, e.g. `data-*` hooks. */
  rowProps?: (row: T) => React.HTMLAttributes<HTMLTableRowElement> & Record<`data-${string}`, unknown>;

  /**
   * Content shown beneath an expanded row, spanning every column — a
   * thread's messages, a record's detail. Rows gain a disclosure chevron;
   * ArrowRight expands the focused row and ArrowLeft collapses it.
   */
  renderExpanded?: (row: T) => React.ReactNode;
  /** Expanded row keys, controlled. Omit to let the grid hold them. */
  expandedKeys?: DataGridKey[];
  /** Called with the new set of expanded keys. */
  onExpandedChange?: (keys: DataGridKey[]) => void;
}

/** One entry in the rendered list: a row, or the detail beneath one. */
type Entry<T> = { kind: 'row'; row: T; index: number } | { kind: 'detail'; row: T; index: number };

const PAGE = 10;

/**
 * A sortable, filterable, keyboard-driven data table with optional row
 * virtualisation, multi-selection and expandable rows.
 *
 * Filtering and sorting are handled internally against the `data` you pass — a
 * case-insensitive match across all values, and click-to-sort on columns marked
 * `sortable`. For server-side sorting, control `sort` and set `manualSort`;
 * for paging, use `onEndReached`; for server-side filtering, filter upstream
 * and set `showFilter={false}`.
 *
 * Keyboard: the grid is one tab stop. ↑/↓, Home/End and PageUp/PageDown move
 * focus (`onFocusRow`); Enter activates (`onActivate`); Space selects; with
 * `selectionMode="multiple"`, Shift extends, Mod+A selects all and Escape
 * clears; →/← expand and collapse.
 *
 * @example
 * ```tsx
 * <DataGrid
 *   columns={[
 *     { key: 'subject', header: 'Subject', sortable: true },
 *     { key: 'from', header: 'From', width: 200 },
 *   ]}
 *   data={messages}
 *   selectionMode="multiple"
 *   selectedKeys={selected}
 *   onSelectionChange={setSelected}
 *   onFocusRow={(m) => preview(m)}
 *   onActivate={(m) => open(m)}
 *   onEndReached={loadMore}
 * />
 * ```
 */
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
  selectionMode,
  selectedKeys,
  onSelectionChange,
  onFocusRow,
  onActivate,
  sort,
  onSortChange,
  manualSort = false,
  onEndReached,
  rowClassName,
  rowProps,
  renderExpanded,
  expandedKeys,
  onExpandedChange,
}: DataGridProps<T>) => {
  const mode = selectionMode ?? (selectedKeys !== undefined ? 'single' : 'none');
  const [filterQuery, setFilterQuery] = useState('');
  const [internalSort, setInternalSort] = useState<DataGridSort>(null);
  const sortConfig = sort !== undefined ? sort : internalSort;
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [anchorIndex, setAnchorIndex] = useState<number>(-1);
  const [internalSelection, setInternalSelection] = useState<DataGridKey[]>([]);
  const [internalExpanded, setInternalExpanded] = useState<DataGridKey[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const virtuosoRef = useRef<TableVirtuosoHandle>(null);
  const idPrefix = useId();

  const keyOf = useCallback((row: T): DataGridKey => row[rowKey] as DataGridKey, [rowKey]);

  // Reset focus index when the visible rows are re-derived.
  useEffect(() => {
    setFocusedIndex(-1);
    setAnchorIndex(-1);
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
    if (!sortConfig || manualSort) return filteredData;
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
  }, [filteredData, sortConfig, manualSort]);

  /* Selection --------------------------------------------------------- */

  const selection = useMemo<Set<DataGridKey>>(() => {
    if (selectedKeys !== undefined) return new Set(selectedKeys);
    if (mode !== 'none') return new Set(internalSelection);
    return new Set(selectedRowId !== undefined ? [selectedRowId] : []);
  }, [selectedKeys, mode, internalSelection, selectedRowId]);

  const commitSelection = (keys: Set<DataGridKey>) => {
    // Row order, not click order, so callers get a stable list.
    const rows = sortedData.filter((r) => keys.has(keyOf(r)));
    const ordered = rows.map(keyOf);
    if (selectedKeys === undefined) setInternalSelection(ordered);
    onSelectionChange?.(ordered, rows);
  };

  const selectAt = (index: number, how: { toggle?: boolean; range?: boolean } = {}) => {
    if (mode === 'none' || index < 0 || index >= sortedData.length) return;
    const key = keyOf(sortedData[index]);
    if (mode === 'single') {
      commitSelection(new Set([key]));
      setAnchorIndex(index);
      return;
    }
    if (how.range && anchorIndex >= 0) {
      const [from, to] = anchorIndex < index ? [anchorIndex, index] : [index, anchorIndex];
      const next = how.toggle ? new Set(selection) : new Set<DataGridKey>();
      for (let i = from; i <= to; i += 1) next.add(keyOf(sortedData[i]));
      commitSelection(next);
      return;
    }
    if (how.toggle) {
      const next = new Set(selection);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      commitSelection(next);
    } else {
      commitSelection(new Set([key]));
    }
    setAnchorIndex(index);
  };

  /* Expansion --------------------------------------------------------- */

  const expanded = useMemo(
    () => new Set(expandedKeys ?? internalExpanded),
    [expandedKeys, internalExpanded],
  );

  const setExpanded = (key: DataGridKey, open: boolean) => {
    if (!renderExpanded || expanded.has(key) === open) return;
    const next = new Set(expanded);
    if (open) next.add(key);
    else next.delete(key);
    const list = [...next];
    if (expandedKeys === undefined) setInternalExpanded(list);
    onExpandedChange?.(list);
  };

  const entries = useMemo<Entry<T>[]>(() => {
    const list: Entry<T>[] = [];
    sortedData.forEach((row, index) => {
      list.push({ kind: 'row', row, index });
      if (renderExpanded && expanded.has(keyOf(row))) list.push({ kind: 'detail', row, index });
    });
    return list;
  }, [sortedData, renderExpanded, expanded, keyOf]);

  /* Focus ------------------------------------------------------------- */

  const rowDomId = (index: number) => `${idPrefix}-row-${index}`;

  const focusRow = (index: number) => {
    if (sortedData.length === 0) return;
    const clamped = Math.max(0, Math.min(index, sortedData.length - 1));
    setFocusedIndex(clamped);
    onFocusRow?.(sortedData[clamped], clamped);

    const flat = entries.findIndex((e) => e.kind === 'row' && e.index === clamped);
    if (virtualized) {
      virtuosoRef.current?.scrollIntoView?.({ index: flat, behavior: 'auto' });
    } else {
      const el = document.getElementById(rowDomId(clamped));
      el?.scrollIntoView?.({ block: 'nearest' });
    }
  };

  /* Sorting ----------------------------------------------------------- */

  const handleSort = (key: string, sortable?: boolean) => {
    if (sortable === false) return;
    const prev = sortConfig;
    const next: DataGridSort =
      !prev || prev.key !== key
        ? { key, direction: 'asc' }
        : prev.direction === 'asc'
          ? { key, direction: 'desc' }
          : null;
    if (sort === undefined) setInternalSort(next);
    onSortChange?.(next);
  };

  /* Keyboard ---------------------------------------------------------- */

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Typing in the filter box is not grid navigation.
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    if (sortedData.length === 0 || loading) return;
    const last = sortedData.length - 1;
    const mod = e.metaKey || e.ctrlKey;
    const extend = e.shiftKey && mode === 'multiple';

    const move = (to: number) => {
      e.preventDefault();
      const clamped = Math.max(0, Math.min(to, last));
      focusRow(clamped);
      if (extend) {
        if (anchorIndex < 0) setAnchorIndex(focusedIndex < 0 ? clamped : focusedIndex);
        selectAt(clamped, { range: true });
      }
    };

    switch (e.key) {
      case 'ArrowDown':
        // Without a focused row, the first press lands on the first row.
        if (focusedIndex < 0) return move(0);
        // Wraps, as it always has — unless extending a selection.
        return move(focusedIndex >= last && !extend ? 0 : focusedIndex + 1);
      case 'ArrowUp':
        if (focusedIndex < 0) return move(last);
        return move(focusedIndex <= 0 && !extend ? last : focusedIndex - 1);
      case 'Home':
        return move(0);
      case 'End':
        return move(last);
      case 'PageDown':
        return move(Math.max(focusedIndex, 0) + PAGE);
      case 'PageUp':
        return move(Math.max(focusedIndex, 0) - PAGE);
      case 'ArrowRight':
      case 'ArrowLeft':
        if (!renderExpanded || focusedIndex < 0) return;
        e.preventDefault();
        setExpanded(keyOf(sortedData[focusedIndex]), e.key === 'ArrowRight');
        return;
      case 'Enter': {
        if (focusedIndex < 0) return;
        e.preventDefault();
        const row = sortedData[focusedIndex];
        if (onActivate) onActivate(row, focusedIndex);
        else onRowClick?.(row);
        return;
      }
      case ' ': {
        if (focusedIndex < 0) return;
        e.preventDefault();
        if (mode === 'none') onRowClick?.(sortedData[focusedIndex]);
        else selectAt(focusedIndex, { toggle: mode === 'multiple', range: extend });
        return;
      }
      case 'a':
      case 'A':
        if (mod && mode === 'multiple') {
          e.preventDefault();
          commitSelection(new Set(sortedData.map(keyOf)));
        }
        return;
      case 'Escape':
        if (mode === 'multiple' && selection.size > 0) {
          e.preventDefault();
          commitSelection(new Set());
        }
        return;
    }
  };

  /* Mouse ------------------------------------------------------------- */

  const handleRowClick = (e: React.MouseEvent, row: T, index: number) => {
    setFocusedIndex(index);
    onFocusRow?.(row, index);
    if (mode !== 'none') {
      selectAt(index, { toggle: (e.metaKey || e.ctrlKey) && mode === 'multiple', range: e.shiftKey && mode === 'multiple' });
    }
    onRowClick?.(row);
  };

  const handleRowDoubleClick = (row: T, index: number) => onActivate?.(row, index);

  /* End reached (non-virtualised) ----------------------------------- */

  const endFiredFor = useRef(-1);
  useEffect(() => {
    endFiredFor.current = -1;
  }, [data.length]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!onEndReached) return;
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48 && endFiredFor.current !== data.length) {
      endFiredFor.current = data.length;
      onEndReached();
    }
  };

  /* Rendering --------------------------------------------------------- */

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

  const renderCells = (row: T) =>
    columns.map((col, i) => {
      const val = row[col.key];
      const key = keyOf(row);
      return (
        <td key={col.key} role="gridcell" className="p-3 align-middle truncate max-w-xs">
          {i === 0 && renderExpanded && (
            <button
              type="button"
              tabIndex={-1}
              aria-label={expanded.has(key) ? 'Collapse row' : 'Expand row'}
              aria-expanded={expanded.has(key)}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(key, !expanded.has(key));
              }}
              className="mr-1 inline-flex align-middle text-muted-foreground hover:text-foreground"
            >
              <ChevronRight size={14} className={cn('transition-transform', expanded.has(key) && 'rotate-90')} />
            </button>
          )}
          {col.render ? col.render(val, row) : val !== undefined && val !== null ? String(val) : ''}
        </td>
      );
    });

  /** Attributes and classes for a data row's `<tr>`. */
  const rowAttributes = (row: T, index: number) => {
    const key = keyOf(row);
    const state: DataGridRowState = {
      selected: selection.has(key),
      focused: focusedIndex === index,
      expanded: expanded.has(key),
      index,
    };
    const extra = rowProps?.(row) ?? {};
    return {
      ...extra,
      id: rowDomId(index),
      role: 'row',
      'aria-selected': state.selected,
      'aria-expanded': renderExpanded ? state.expanded : undefined,
      'data-row-index': index,
      onClick: (e: React.MouseEvent<HTMLTableRowElement>) => {
        handleRowClick(e, row, index);
        (extra.onClick as React.MouseEventHandler<HTMLTableRowElement> | undefined)?.(e);
      },
      onDoubleClick: () => handleRowDoubleClick(row, index),
      className: cn(
        "border-b border-border/40 hover:bg-accent/40 transition-colors cursor-pointer text-sm outline-none",
        state.selected && "bg-primary/10 text-primary hover:bg-primary/15 font-medium border-l-2 border-l-primary",
        state.focused && "bg-accent/60 ring-1 ring-inset ring-ring",
        extra.className as string | undefined,
        rowClassName?.(row, state),
      ),
    };
  };

  const renderDetail = (row: T) => (
    <td colSpan={columns.length} className="p-0 bg-muted/20 border-b border-border/40">
      {renderExpanded?.(row)}
    </td>
  );

  // Everything the virtualised row component needs, passed through context
  // so the component definitions themselves can stay stable.
  const context = { rowAttributes, renderDetail, keyOf };

  const virtuosoComponents = useMemo(() => ({
    Table: (props: any) => (
      <table
        {...props}
        role="presentation"
        className="w-full border-collapse text-left bg-background text-foreground"
      />
    ),
    TableHead: React.forwardRef((props: any, ref: any) => (
      <thead ref={ref} {...props} className="sticky top-0 bg-background z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.1)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]" />
    )),
    TableBody: React.forwardRef((props: any, ref: any) => (
      <tbody ref={ref} {...props} />
    )),
    TableRow: ({ item, context: ctx, ...props }: any) => {
      if (!ctx || !item) return <tr {...props} />;
      if (item.kind === 'detail') {
        return <tr {...props} data-detail-for={String(ctx.keyOf(item.row))} />;
      }
      const attrs = ctx.rowAttributes(item.row, item.index);
      return <tr {...props} {...attrs} />;
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
            ref={virtuosoRef}
            data={entries}
            context={context}
            components={virtuosoComponents}
            fixedHeaderContent={renderHeader}
            endReached={onEndReached ? () => onEndReached() : undefined}
            computeItemKey={(_i, entry) => `${entry.kind}:${String(keyOf(entry.row) ?? entry.index)}`}
            itemContent={(_index, entry) =>
              entry.kind === 'detail' ? renderDetail(entry.row) : <>{renderCells(entry.row)}</>
            }
          />
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-auto" onScroll={handleScroll} data-testid="datagrid-scroller">
        <table role="presentation" className="w-full border-collapse text-left bg-background text-foreground">
          <thead>{renderHeader()}</thead>
          <tbody>
            {entries.map((entry) =>
              entry.kind === 'detail' ? (
                <tr key={`detail:${String(keyOf(entry.row))}`} data-detail-for={String(keyOf(entry.row))}>
                  {renderDetail(entry.row)}
                </tr>
              ) : (
                <tr key={String(keyOf(entry.row) ?? entry.index)} {...rowAttributes(entry.row, entry.index)}>
                  {renderCells(entry.row)}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      role="grid"
      aria-label="Data Grid"
      aria-multiselectable={mode === 'multiple' || undefined}
      aria-rowcount={sortedData.length}
      aria-activedescendant={focusedIndex >= 0 ? rowDomId(focusedIndex) : undefined}
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
              aria-label="Filter rows"
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
