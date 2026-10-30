import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ShellLayout } from '../ShellLayout';

/**
 * A screen reader moves around a page by its landmarks. The shell is the page,
 * so it owns them: the workspace is main, the status bar is the footer.
 */
describe('ShellLayout landmarks', () => {
  it('puts the workspace in main and the status bar in a labelled footer', () => {
    render(<ShellLayout />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo', { name: 'Status Bar' })).toBeInTheDocument();
    // Not a live region: the bar's changes are not read aloud.
    expect(screen.queryByRole('status', { name: 'Status Bar' })).toBeNull();
  });
});
