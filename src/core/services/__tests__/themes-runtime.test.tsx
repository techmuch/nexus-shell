import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import {
  getThemeTokens,
  registerTheme,
  useThemeStore,
  useThemeTokens,
} from '../ThemeService';
import { commandRegistry } from '../../registry/CommandRegistry';
import { ConnectedThemeSwitcher } from '../../../connected/ConnectedThemeSwitcher';
import { BUNDLED_THEMES } from '../../../lib/themes';
import { AppTitle } from '../../../components/widgets/AppTitle';

/**
 * Themes as data: a scheme for code that cannot read CSS, a registry apps
 * can add to, and resolved token values for chart and canvas libraries.
 */

let style: HTMLStyleElement;

beforeEach(() => {
  style = document.createElement('style');
  style.textContent = `
    .theme-light { --muted: 210 40% 96.1%; --muted-foreground: 215 16% 47%; }
    .theme-dark { --muted: 240 4% 16%; --muted-foreground: 240 5% 65%; }
  `;
  document.head.appendChild(style);
  useThemeStore.getState().setTheme('light');
});

afterEach(() => {
  cleanup();
  style.remove();
});

describe('theme schemes', () => {
  it('every bundled theme declares one', () => {
    for (const theme of BUNDLED_THEMES) expect(['light', 'dark']).toContain(theme.scheme);
  });

  it('tracks the current scheme and sets color-scheme on <html>', () => {
    useThemeStore.getState().setTheme('dark');
    expect(useThemeStore.getState().scheme).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    useThemeStore.getState().setTheme('gt');
    expect(useThemeStore.getState().scheme).toBe('light');
  });

  it('treats an unregistered id as light', () => {
    useThemeStore.getState().setTheme('nobody-registered-this');
    expect(useThemeStore.getState().scheme).toBe('light');
  });
});

describe('registerTheme', () => {
  it('adds the theme, its scheme and a command; re-registering replaces', () => {
    registerTheme({ id: 'midnight', label: 'Midnight', scheme: 'dark' });
    const { themes } = useThemeStore.getState();
    expect(themes.find((t) => t.id === 'midnight')).toMatchObject({ shortLabel: 'Midnight', scheme: 'dark' });

    commandRegistry.executeCommand('theme.midnight');
    expect(useThemeStore.getState().theme).toBe('midnight');
    expect(useThemeStore.getState().scheme).toBe('dark');
    expect(document.documentElement.classList.contains('theme-midnight')).toBe(true);

    registerTheme({ id: 'midnight', label: 'Midnight Blue', scheme: 'dark' });
    expect(useThemeStore.getState().themes.filter((t) => t.id === 'midnight')).toHaveLength(1);
  });

  it('shows registered themes in ConnectedThemeSwitcher', () => {
    registerTheme({ id: 'paper', label: 'Paper', shortLabel: 'PPR', scheme: 'light' });
    render(<ConnectedThemeSwitcher />);
    expect(screen.getByText('PPR')).toBeInTheDocument();
    // ...alongside every bundled theme, the drift InboxQL's hand-listed picker had.
    for (const theme of BUNDLED_THEMES) expect(screen.getByText(theme.shortLabel)).toBeInTheDocument();
  });
});

describe('theme tokens', () => {
  it('resolves tokens to colour strings', () => {
    const tokens = getThemeTokens();
    expect(tokens.scheme).toBe('light');
    expect(tokens.muted).toBe('hsl(210 40% 96.1%)');
    expect(tokens.mutedForeground).toBe('hsl(215 16% 47%)');
  });

  it('re-reads when the theme changes', () => {
    const Probe = () => {
      const t = useThemeTokens();
      return <span data-testid="muted">{t.muted}</span>;
    };
    render(<Probe />);
    expect(screen.getByTestId('muted')).toHaveTextContent('hsl(210 40% 96.1%)');
    act(() => useThemeStore.getState().setTheme('dark'));
    expect(screen.getByTestId('muted')).toHaveTextContent('hsl(240 4% 16%)');
  });

  it('returns empty strings for tokens nobody defined', () => {
    expect(getThemeTokens().ring).toBe('');
  });
});

describe('AppTitle', () => {
  it('upper-cases by default and can keep the brand casing', () => {
    const { rerender } = render(<AppTitle title="InboxQL" />);
    expect(screen.getByRole('heading').className).toContain('uppercase');
    rerender(<AppTitle title="InboxQL" casing="none" mono={false} />);
    const heading = screen.getByRole('heading');
    expect(heading.className).not.toContain('uppercase');
    expect(heading.className).not.toContain('font-mono');
  });
});
