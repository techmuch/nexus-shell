import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { QuickSearch, type IQuickSearchResult } from '../QuickSearch';

/**
 * The highlight moves with the arrow keys while focus stays in the input, so
 * the only thing a screen reader can follow is `aria-activedescendant`. Without
 * it, keyboard navigation is announced as nothing at all.
 */

afterEach(cleanup);

const results: IQuickSearchResult[] = [
  { id: 'open', title: 'Open File', category: 'Actions' },
  { id: 'save', title: 'Save File', category: 'Actions' },
  { id: 'readme', title: 'README.md', category: 'Files' },
];

const open = (props: Partial<React.ComponentProps<typeof QuickSearch>> = {}) => {
  render(<QuickSearch results={results} onSelect={() => {}} {...props} />);
  const input = screen.getByRole('combobox');
  // The dropdown only renders once there is a query to show results for.
  fireEvent.change(input, { target: { value: 'file' } });
  return input;
};

describe('QuickSearch accessibility', () => {
  it('points aria-activedescendant at the highlighted option', () => {
    const input = open();

    const active = input.getAttribute('aria-activedescendant');
    expect(active).toBeTruthy();
    expect(document.getElementById(active!)).toHaveTextContent('Open File');
  });

  it('moves aria-activedescendant with the arrow keys', () => {
    const input = open();

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    let active = input.getAttribute('aria-activedescendant');
    expect(document.getElementById(active!)).toHaveTextContent('Save File');

    // Across a category boundary, since the highlight indexes render order.
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    active = input.getAttribute('aria-activedescendant');
    expect(document.getElementById(active!)).toHaveTextContent('README.md');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    active = input.getAttribute('aria-activedescendant');
    expect(document.getElementById(active!)).toHaveTextContent('Save File');
  });

  it('marks the same option as selected that activedescendant names', () => {
    const input = open();
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    const active = document.getElementById(input.getAttribute('aria-activedescendant')!);
    expect(active).toHaveAttribute('aria-selected', 'true');

    const selected = screen
      .getAllByRole('option')
      .filter((o) => o.getAttribute('aria-selected') === 'true');
    expect(selected).toHaveLength(1);
    expect(selected[0]).toBe(active);
  });

  it('drops aria-activedescendant and aria-controls when closed', () => {
    render(<QuickSearch results={results} onSelect={() => {}} />);
    const input = screen.getByRole('combobox');

    // Closed: nothing to point at, so a stale id must not be left behind.
    expect(input).not.toHaveAttribute('aria-activedescendant');
    expect(input).not.toHaveAttribute('aria-controls');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('reports expanded and controls the listbox when open', () => {
    const input = open();

    expect(input).toHaveAttribute('aria-expanded', 'true');
    const controls = input.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    expect(document.getElementById(controls!)).toHaveAttribute('role', 'listbox');
  });

  it('gives each instance its own option ids', () => {
    render(
      <>
        <QuickSearch results={results} onSelect={() => {}} />
        <QuickSearch results={results} onSelect={() => {}} />
      </>,
    );
    const [first, second] = screen.getAllByRole('combobox');
    fireEvent.change(first, { target: { value: 'file' } });
    fireEvent.change(second, { target: { value: 'file' } });

    // Two instances on a page must not both claim the same option id.
    expect(first.getAttribute('aria-activedescendant')).not.toBe(
      second.getAttribute('aria-activedescendant'),
    );
  });

  it('has no activedescendant when the query matches nothing', () => {
    render(<QuickSearch results={[]} onSelect={() => {}} />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'nothing matches' } });

    expect(screen.getByText(/No results found/)).toBeInTheDocument();
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });
});
