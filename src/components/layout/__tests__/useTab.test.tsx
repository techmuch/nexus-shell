import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import type { IJsonModel } from 'flexlayout-react';
import { ShellLayout } from '../ShellLayout';
import { componentRegistry } from '../../../core/registry/ComponentRegistry';
import { configureLayout, defaultLayout, useLayoutStore } from '../../../core/services/LayoutService';
import { useTab, workspace } from '../../../core/services/Workspace';

/**
 * A tab component's side of the workspace, through the real shell: the tab
 * learns its config, can retitle and dirty itself, and hears when it becomes
 * active — the replacement for "open the tab, wait 50 ms, querySelector the
 * input and focus it".
 */

const activations = vi.fn();

const Query = () => {
  const input = useRef<HTMLInputElement>(null);
  const { config, title, setTitle, setDirty, active } = useTab<{ q?: string }>({
    onActivate: () => {
      activations();
      input.current?.focus();
    },
  });
  return (
    <div>
      <input ref={input} aria-label="query" defaultValue={config.q ?? ''} key={config.q} />
      <span data-testid="title">{title}</span>
      <span data-testid="active">{String(active)}</span>
      <button onClick={() => setTitle('Renamed')}>rename</button>
      <button onClick={() => setDirty(true)}>dirty</button>
    </div>
  );
};
componentRegistry.register('ut-query', Query);
componentRegistry.register('ut-other', () => <div>other</div>);

const one = (component: string): IJsonModel => ({
  global: {},
  layout: { type: 'row', children: [{ type: 'tabset', children: [{ type: 'tab', name: component, component }] }] },
});

beforeEach(() => {
  activations.mockReset();
  localStorage.clear();
  useLayoutStore.setState({ options: {} });
  useLayoutStore.getState().initLayout(defaultLayout, false);
});

afterEach(cleanup);

describe('useTab', () => {
  it('fires onActivate on open and focuses the input', () => {
    render(<ShellLayout />);
    act(() => {
      workspace.open('ut-query', { title: 'Query' });
    });
    expect(activations).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(screen.getByLabelText('query'));
  });

  it('fires again when re-opened while another tab is active', () => {
    render(<ShellLayout />);
    act(() => {
      workspace.open('ut-query');
      workspace.open('ut-other');
    });
    activations.mockClear();
    act(() => {
      workspace.open('ut-query');
    });
    expect(activations).toHaveBeenCalledTimes(1);
  });

  it('fires when re-opened while already active', () => {
    render(<ShellLayout />);
    act(() => {
      workspace.open('ut-query');
    });
    activations.mockClear();
    act(() => {
      workspace.open('ut-query');
    });
    expect(activations).toHaveBeenCalledTimes(1);
  });

  it('sees new config when re-opened with parameters', () => {
    render(<ShellLayout />);
    act(() => {
      workspace.open('ut-query', { config: { q: 'from:a' } });
    });
    expect(screen.getByLabelText('query')).toHaveValue('from:a');
    act(() => {
      workspace.open('ut-query', { config: { q: 'from:b' } });
    });
    expect(screen.getByLabelText('query')).toHaveValue('from:b');
  });

  it('retitles and dirties its own tab', () => {
    render(<ShellLayout />);
    let id = '';
    act(() => {
      id = workspace.open('ut-query', { title: 'Query' })!;
    });
    fireEvent.click(screen.getByText('rename'));
    expect(screen.getByTestId('title')).toHaveTextContent('Renamed');
    expect(workspace.get(id)?.title).toBe('Renamed');

    fireEvent.click(screen.getByText('dirty'));
    expect(workspace.get(id)?.dirty).toBe(true);
  });

  it('knows whether it is the active tab', () => {
    render(<ShellLayout />);
    act(() => {
      workspace.open('ut-query');
    });
    expect(screen.getByTestId('active')).toHaveTextContent('true');
  });

  it('returns inert values outside a tab', () => {
    let result: ReturnType<typeof useTab> | undefined;
    const Outside = () => {
      result = useTab();
      return null;
    };
    render(<Outside />);
    expect(result?.id).toBeNull();
    expect(() => result?.setTitle('x')).not.toThrow();
  });
});

describe('ShellLayout and persisted layouts', () => {
  it('keeps a restored layout instead of overwriting it with initialLayoutJson', () => {
    localStorage.setItem('nexus-shell-layout', JSON.stringify(one('ut-other')));
    useLayoutStore.getState().setStorageKey('nexus-shell-layout');
    render(<ShellLayout initialLayoutJson={one('ut-query')} />);
    expect(workspace.snapshot().tabs.map((t) => t.component)).toEqual(['ut-other']);

    // ...and initialLayoutJson is what a reset returns to.
    act(() => workspace.reset());
    expect(workspace.snapshot().tabs.map((t) => t.component)).toEqual(['ut-query']);
  });

  it('seeds a first run from initialLayoutJson', () => {
    useLayoutStore.getState().setStorageKey('nexus-shell-layout');
    render(<ShellLayout initialLayoutJson={one('ut-query')} />);
    expect(workspace.snapshot().tabs.map((t) => t.component)).toEqual(['ut-query']);
  });

  it('rewrites aliased tabs on mount and renders the target', () => {
    componentRegistry.alias('ut-legacy-query', 'ut-query', { title: 'Query' });
    useLayoutStore.getState().initLayout(one('ut-legacy-query'), true);
    render(<ShellLayout />);
    expect(workspace.snapshot().tabs[0]).toMatchObject({ component: 'ut-query', title: 'Query' });
    expect(screen.getByLabelText('query')).toBeInTheDocument();
  });

  it('renders a placeholder for an unknown component by default', () => {
    useLayoutStore.getState().initLayout(one('ut-missing'), true);
    render(<ShellLayout />);
    expect(screen.getByText(/no longer available/)).toBeInTheDocument();
  });

  it('renders a custom fallback when the policy is a function', () => {
    configureLayout({ onUnknownComponent: (id) => <p>gone: {id}</p> });
    useLayoutStore.getState().initLayout(one('ut-missing'), true);
    render(<ShellLayout />);
    expect(screen.getByText('gone: ut-missing')).toBeInTheDocument();
  });

  it('closes unknown tabs on mount with the drop policy', () => {
    configureLayout({ onUnknownComponent: 'drop' });
    useLayoutStore.getState().initLayout(one('ut-missing'), true);
    render(<ShellLayout />);
    expect(workspace.snapshot().tabs).toHaveLength(0);
  });
});
