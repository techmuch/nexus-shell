import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

/**
 * react-virtuoso measures real layout, which jsdom does not have, so it
 * renders no rows here (the grid behaved the same before this suite). This
 * stand-in renders every item through the components, context, keys and
 * item renderer the grid hands it — which is the grid's half of the
 * contract, and the half these tests are about.
 */
vi.mock('react-virtuoso', () => ({
  TableVirtuoso: React.forwardRef(function TableVirtuoso(props: any, _ref) {
    const { data, components, context, itemContent, fixedHeaderContent, computeItemKey, endReached } = props;
    const { Table, TableHead, TableBody, TableRow } = components;
    return (
      <div>
        <Table>
          <TableHead>{fixedHeaderContent()}</TableHead>
          <TableBody>
            {data.map((item: any, i: number) => (
              <TableRow key={computeItemKey(i, item)} item={item} context={context} data-index={i}>
                {itemContent(i, item)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <button onClick={() => endReached?.(data.length - 1)}>reach end</button>
      </div>
    );
  }),
}));

const { DataGrid } = await import('../DataGrid');

const ROWS = [
  { id: 1, subject: 'Alpha' },
  { id: 2, subject: 'Bravo' },
  { id: 3, subject: 'Charlie' },
];
const COLUMNS = [{ key: 'subject', header: 'Subject' }];

afterEach(cleanup);

describe('DataGrid, virtualised', () => {
  it('renders rows with selection, row hooks and expanded detail', () => {
    render(
      <DataGrid
        columns={COLUMNS}
        data={ROWS}
        selectedKeys={[2]}
        expandedKeys={[3]}
        renderExpanded={(r) => <span>more {r.subject}</span>}
        rowProps={(r) => ({ 'data-nav-row': String(r.id) })}
      />,
    );
    const bravo = screen.getByText('Bravo').closest('tr')!;
    expect(bravo).toHaveAttribute('aria-selected', 'true');
    expect(bravo).toHaveAttribute('data-nav-row', '2');
    expect(screen.getByText('more Charlie').closest('tr')).toHaveAttribute('data-detail-for', '3');
  });

  it('routes clicks, focus and activation through the virtualised rows', () => {
    const onFocusRow = vi.fn();
    const onActivate = vi.fn();
    render(<DataGrid columns={COLUMNS} data={ROWS} onFocusRow={onFocusRow} onActivate={onActivate} selectionMode="single" />);
    fireEvent.click(screen.getByText('Charlie').closest('tr')!);
    expect(onFocusRow).toHaveBeenLastCalledWith(ROWS[2], 2);
    expect(screen.getByText('Charlie').closest('tr')).toHaveAttribute('aria-selected', 'true');
    fireEvent.doubleClick(screen.getByText('Alpha').closest('tr')!);
    expect(onActivate).toHaveBeenCalledWith(ROWS[0], 0);
  });

  it('forwards endReached', () => {
    const onEndReached = vi.fn();
    render(<DataGrid columns={COLUMNS} data={ROWS} onEndReached={onEndReached} />);
    fireEvent.click(screen.getByText('reach end'));
    expect(onEndReached).toHaveBeenCalledOnce();
  });
});
