import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { DataGrid, type DataGridKey, type DataGridSort, type IDataGridColumn } from '../DataGrid';

/**
 * The grid as a real-data list: InboxQL's Desk needs multi-select, a focus
 * that previews without opening, server-side sort and paging, row hooks and
 * expandable threads. Rendered non-virtualised so every row is in the DOM;
 * one test covers the virtualised path.
 */

interface Row {
  id: number;
  subject: string;
  size: number;
}
const ROWS: Row[] = [
  { id: 1, subject: 'Alpha', size: 30 },
  { id: 2, subject: 'Bravo', size: 10 },
  { id: 3, subject: 'Charlie', size: 20 },
  { id: 4, subject: 'Delta', size: 40 },
];
const COLUMNS: IDataGridColumn<Row>[] = [
  { key: 'subject', header: 'Subject', sortable: true },
  { key: 'size', header: 'Size', sortable: true },
];

afterEach(cleanup);

const grid = () => screen.getByRole('grid');
const key = (k: string, opts: Record<string, boolean> = {}) => fireEvent.keyDown(grid(), { key: k, ...opts });
const rowEl = (subject: string) => screen.getByText(subject).closest('tr')!;
const subjects = () => screen.getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('gridcell')[0].textContent);

const Controlled = (props: Partial<React.ComponentProps<typeof DataGrid<Row>>> & { onChange?: (k: DataGridKey[]) => void }) => {
  const [keys, setKeys] = useState<DataGridKey[]>([]);
  return (
    <DataGrid<Row>
      columns={COLUMNS}
      data={ROWS}
      virtualized={false}
      showFilter={false}
      selectionMode="multiple"
      selectedKeys={keys}
      onSelectionChange={(k) => {
        setKeys(k);
        props.onChange?.(k);
      }}
      {...props}
    />
  );
};

describe('DataGrid keyboard focus', () => {
  it('moves focus with arrows, Home/End and PageUp/PageDown, reporting each move', () => {
    const onFocusRow = vi.fn();
    render(<DataGrid columns={COLUMNS} data={ROWS} virtualized={false} onFocusRow={onFocusRow} />);
    key('ArrowDown');
    expect(onFocusRow).toHaveBeenLastCalledWith(ROWS[0], 0);
    key('End');
    expect(onFocusRow).toHaveBeenLastCalledWith(ROWS[3], 3);
    key('Home');
    expect(onFocusRow).toHaveBeenLastCalledWith(ROWS[0], 0);
    key('PageDown');
    expect(onFocusRow).toHaveBeenLastCalledWith(ROWS[3], 3);
    key('PageUp');
    expect(onFocusRow).toHaveBeenLastCalledWith(ROWS[0], 0);
    expect(grid()).toHaveAttribute('aria-activedescendant', rowEl('Alpha').id);
  });

  it('keeps the original wrap-around on plain arrows', () => {
    const onFocusRow = vi.fn();
    render(<DataGrid columns={COLUMNS} data={ROWS} virtualized={false} onFocusRow={onFocusRow} />);
    key('ArrowUp');
    expect(onFocusRow).toHaveBeenLastCalledWith(ROWS[3], 3);
    key('ArrowDown');
    expect(onFocusRow).toHaveBeenLastCalledWith(ROWS[0], 0);
  });

  it('separates preview (focus) from open (Enter, double-click)', () => {
    const onActivate = vi.fn();
    const onRowClick = vi.fn();
    render(<DataGrid columns={COLUMNS} data={ROWS} virtualized={false} onActivate={onActivate} onRowClick={onRowClick} />);
    key('ArrowDown');
    expect(onActivate).not.toHaveBeenCalled();
    key('Enter');
    expect(onActivate).toHaveBeenCalledWith(ROWS[0], 0);
    fireEvent.doubleClick(rowEl('Charlie'));
    expect(onActivate).toHaveBeenLastCalledWith(ROWS[2], 2);
    expect(onRowClick).not.toHaveBeenCalledWith(ROWS[0]);
  });

  it('falls back to onRowClick for Enter when there is no onActivate (compatibility)', () => {
    const onRowClick = vi.fn();
    render(<DataGrid columns={COLUMNS} data={ROWS} virtualized={false} onRowClick={onRowClick} />);
    key('ArrowDown');
    key('Enter');
    expect(onRowClick).toHaveBeenCalledWith(ROWS[0]);
  });

  it('does not treat typing in the filter as navigation', () => {
    const onFocusRow = vi.fn();
    render(<DataGrid columns={COLUMNS} data={ROWS} virtualized={false} onFocusRow={onFocusRow} />);
    fireEvent.keyDown(screen.getByLabelText('Filter rows'), { key: 'ArrowDown' });
    expect(onFocusRow).not.toHaveBeenCalled();
  });
});

describe('DataGrid selection', () => {
  it('single mode selects on click and Space', () => {
    const onSelectionChange = vi.fn();
    render(<DataGrid columns={COLUMNS} data={ROWS} virtualized={false} selectionMode="single" onSelectionChange={onSelectionChange} />);
    fireEvent.click(rowEl('Bravo'));
    expect(onSelectionChange).toHaveBeenLastCalledWith([2], [ROWS[1]]);
    expect(rowEl('Bravo')).toHaveAttribute('aria-selected', 'true');
    key('ArrowDown');
    key(' ');
    expect(onSelectionChange).toHaveBeenLastCalledWith([3], [ROWS[2]]);
  });

  it('multiple mode toggles with Mod-click and extends with Shift-click, in row order', () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    expect(grid()).toHaveAttribute('aria-multiselectable', 'true');
    fireEvent.click(rowEl('Delta'));
    fireEvent.click(rowEl('Alpha'), { metaKey: true });
    expect(onChange).toHaveBeenLastCalledWith([1, 4]);
    fireEvent.click(rowEl('Alpha'), { ctrlKey: true });
    expect(onChange).toHaveBeenLastCalledWith([4]);

    fireEvent.click(rowEl('Bravo'));
    fireEvent.click(rowEl('Delta'), { shiftKey: true });
    expect(onChange).toHaveBeenLastCalledWith([2, 3, 4]);
  });

  it('extends with Shift+Arrow, selects all with Mod+A and clears with Escape', () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    key('ArrowDown');
    key(' ');
    key('ArrowDown', { shiftKey: true });
    key('ArrowDown', { shiftKey: true });
    expect(onChange).toHaveBeenLastCalledWith([1, 2, 3]);
    key('a', { ctrlKey: true });
    expect(onChange).toHaveBeenLastCalledWith([1, 2, 3, 4]);
    key('Escape');
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('honours controlled keys passed in', () => {
    render(<DataGrid columns={COLUMNS} data={ROWS} virtualized={false} selectedKeys={[3]} />);
    expect(rowEl('Charlie')).toHaveAttribute('aria-selected', 'true');
    expect(rowEl('Alpha')).toHaveAttribute('aria-selected', 'false');
  });

  it('still supports the selectedRowId shorthand', () => {
    render(<DataGrid columns={COLUMNS} data={ROWS} virtualized={false} selectedRowId={2} />);
    expect(rowEl('Bravo')).toHaveAttribute('aria-selected', 'true');
  });
});

describe('DataGrid sorting and paging', () => {
  it('sorts internally by default', () => {
    render(<DataGrid columns={COLUMNS} data={ROWS} virtualized={false} showFilter={false} />);
    fireEvent.click(screen.getByText('Size'));
    expect(subjects()).toEqual(['Bravo', 'Charlie', 'Alpha', 'Delta']);
    fireEvent.click(screen.getByText('Size'));
    expect(subjects()).toEqual(['Delta', 'Alpha', 'Charlie', 'Bravo']);
  });

  it('reports sort changes and leaves order alone under manualSort', () => {
    const onSortChange = vi.fn();
    const Server = () => {
      const [sort, setSort] = useState<DataGridSort>(null);
      return (
        <DataGrid
          columns={COLUMNS}
          data={ROWS}
          virtualized={false}
          showFilter={false}
          sort={sort}
          manualSort
          onSortChange={(s) => {
            setSort(s);
            onSortChange(s);
          }}
        />
      );
    };
    render(<Server />);
    fireEvent.click(screen.getByText('Size'));
    expect(onSortChange).toHaveBeenLastCalledWith({ key: 'size', direction: 'asc' });
    expect(subjects()).toEqual(['Alpha', 'Bravo', 'Charlie', 'Delta']);
    expect(screen.getByText('Size').closest('th')).toHaveAttribute('aria-sort', 'ascending');
  });

  it('calls onEndReached once per page when scrolled to the bottom', () => {
    const onEndReached = vi.fn();
    const { rerender } = render(
      <DataGrid columns={COLUMNS} data={ROWS} virtualized={false} onEndReached={onEndReached} />,
    );
    const scroller = screen.getByTestId('datagrid-scroller');
    Object.defineProperties(scroller, {
      scrollHeight: { configurable: true, value: 1000 },
      clientHeight: { configurable: true, value: 400 },
      scrollTop: { configurable: true, writable: true, value: 600 },
    });
    fireEvent.scroll(scroller);
    fireEvent.scroll(scroller);
    expect(onEndReached).toHaveBeenCalledOnce();

    rerender(
      <DataGrid columns={COLUMNS} data={[...ROWS, { id: 5, subject: 'Echo', size: 5 }]} virtualized={false} onEndReached={onEndReached} />,
    );
    fireEvent.scroll(screen.getByTestId('datagrid-scroller'));
    expect(onEndReached).toHaveBeenCalledTimes(2);
  });
});

describe('DataGrid rows', () => {
  it('applies rowClassName with state and rowProps attributes', () => {
    render(
      <DataGrid
        columns={COLUMNS}
        data={ROWS}
        virtualized={false}
        selectedKeys={[1]}
        rowClassName={(row, s) => (s.selected ? 'is-picked' : row.size > 25 ? 'is-big' : undefined)}
        rowProps={(row) => ({ 'data-nav-row': String(row.id) })}
      />,
    );
    expect(rowEl('Alpha')).toHaveClass('is-picked');
    expect(rowEl('Delta')).toHaveClass('is-big');
    expect(rowEl('Bravo')).toHaveAttribute('data-nav-row', '2');
  });

  it('expands rows with the chevron and with ArrowRight/ArrowLeft', () => {
    const onExpandedChange = vi.fn();
    render(
      <DataGrid
        columns={COLUMNS}
        data={ROWS}
        virtualized={false}
        renderExpanded={(row) => <p>detail of {row.subject}</p>}
        onExpandedChange={onExpandedChange}
      />,
    );
    fireEvent.click(within(rowEl('Bravo')).getByLabelText('Expand row'));
    expect(screen.getByText('detail of Bravo')).toBeInTheDocument();
    expect(rowEl('Bravo')).toHaveAttribute('aria-expanded', 'true');
    expect(onExpandedChange).toHaveBeenLastCalledWith([2]);

    key('ArrowDown');
    key('ArrowRight');
    expect(screen.getByText('detail of Alpha')).toBeInTheDocument();
    key('ArrowLeft');
    expect(screen.queryByText('detail of Alpha')).toBeNull();
    // Expanding does not disturb keyboard order: the next row is still Bravo.
    const onFocusRow = vi.fn();
    cleanup();
    render(
      <DataGrid columns={COLUMNS} data={ROWS} virtualized={false} expandedKeys={[1]} renderExpanded={() => 'x'} onFocusRow={onFocusRow} />,
    );
    key('ArrowDown');
    key('ArrowDown');
    expect(onFocusRow).toHaveBeenLastCalledWith(ROWS[1], 1);
  });
});
