import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, cleanup, render, screen, fireEvent } from '@testing-library/react';
import { ShellLayout } from '../ShellLayout';
import { ConnectedModal } from '../../../connected/ConnectedModal';
import { ConnectedCommandPalette } from '../../../connected/ConnectedCommandPalette';
import { useKeyboardShortcuts } from '../../../core/services/KeyboardService';
import { componentRegistry } from '../../../core/registry/ComponentRegistry';
import { commandRegistry } from '../../../core/registry/CommandRegistry';
import { defaultLayout, useLayoutStore } from '../../../core/services/LayoutService';
import { useModalStore } from '../../../core/services/ModalStoreService';

/**
 * The shell has to work when it is the only thing an app renders. Before
 * 0.3.0 the modal host, the palette and the keyboard listener were all
 * opt-in, so shortcuts the menus advertised did nothing and the dirty-tab
 * confirmation waited on a dialog nobody had mounted.
 */

const Probe = ({ node: _node, ...props }: { node?: unknown; greeting?: string }) => (
  <div data-testid="probe">{JSON.stringify(props)}</div>
);
componentRegistry.register('shell-test-probe', Probe);

let fired = 0;
commandRegistry.registerCommand({
  id: 'shell-test.fire',
  label: 'Shell Test: Fire',
  keybinding: 'Control+Alt+9',
  execute: () => {
    fired += 1;
  },
});

const press = () =>
  fireEvent.keyDown(window, { key: '9', ctrlKey: true, altKey: true });

beforeEach(() => {
  fired = 0;
  localStorage.clear();
  useLayoutStore.getState().initLayout(defaultLayout, true);
});

afterEach(() => {
  cleanup();
  useModalStore.getState().close();
});

describe('ShellLayout', () => {
  it('binds keyboard shortcuts without the app mounting the hook', () => {
    render(<ShellLayout />);
    press();
    expect(fired).toBe(1);
  });

  it('runs a shortcut once even when the app also mounts the hook', () => {
    const Legacy = () => {
      useKeyboardShortcuts();
      return <ShellLayout />;
    };
    render(<Legacy />);
    press();
    expect(fired).toBe(1);
  });

  it('can be told not to bind shortcuts', () => {
    render(<ShellLayout keyboardShortcuts={false} />);
    press();
    expect(fired).toBe(0);
  });

  it('renders store dialogs, once, even beside an app-mounted modal host', async () => {
    render(
      <>
        <ConnectedModal />
        <ShellLayout />
      </>,
    );
    let answer: boolean | undefined;
    act(() => {
      useModalStore.getState().openConfirm('Proceed?').then((v) => (answer = v));
    });
    expect(screen.getAllByText('Proceed?')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: /confirm|ok/i }));
    await act(async () => {});
    expect(answer).toBe(true);
  });

  it('mounts one command palette, toggled by Cmd/Ctrl+Shift+P', () => {
    render(
      <>
        <ConnectedCommandPalette />
        <ShellLayout />
      </>,
    );
    fireEvent.keyDown(window, { key: 'P', ctrlKey: true, shiftKey: true });
    expect(screen.getAllByText('Shell Test: Fire')).toHaveLength(1);
  });

  it('passes tab config as props without the internal reuse key', () => {
    render(<ShellLayout />);
    act(() => {
      useLayoutStore
        .getState()
        .addTab('shell-test-probe', 'Probe', { greeting: 'hi' }, { reuseKey: 'probe:1' });
    });
    const props = JSON.parse(screen.getByTestId('probe').textContent!);
    expect(props.greeting).toBe('hi');
    expect(Object.keys(props).some((k) => k.startsWith('_nexus'))).toBe(false);
  });

  it('asks before closing a dirty tab, and closes on confirm', async () => {
    render(<ShellLayout />);
    let id = '';
    act(() => {
      id = useLayoutStore.getState().addTab('shell-test-probe', 'Probe')!;
      useLayoutStore.getState().setTabDirty(id, true);
    });
    expect(screen.getByTestId('probe')).toBeInTheDocument();

    const closeButton = document.querySelector<HTMLElement>('.flexlayout__tab_button_trailing');
    expect(closeButton).toBeTruthy();
    fireEvent.click(closeButton!);
    expect(await screen.findByText(/unsaved changes/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /confirm|ok/i }));
    await act(async () => {});
    expect(screen.queryByTestId('probe')).toBeNull();
  });
});
