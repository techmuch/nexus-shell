import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { PaneHostProvider, useHostChrome, usePaneHost } from '../PaneHost';
import { SidebarPane } from '../../widgets/SidebarPane';
import { ChatPane } from '../../widgets/ChatPane';
import { TerminalPane } from '../../widgets/TerminalPane';

/**
 * Chat and terminal can now sit in a side pane, a dockable tab, or nothing at
 * all. The thing that has to be right in every case is that exactly one title
 * bar gets drawn.
 */

afterEach(cleanup);

const Probe = ({ chrome }: { chrome?: boolean }) => {
  const host = usePaneHost();
  return (
    <p data-testid="probe">
      {String(useHostChrome(chrome))}:{host?.placement ?? 'none'}
    </p>
  );
};

const probe = () => screen.getByTestId('probe').textContent;

describe('useHostChrome', () => {
  it('draws its own chrome when there is no host', () => {
    render(<Probe />);
    expect(probe()).toBe('true:none');
  });

  it('defers when a host reports it draws the title bar', () => {
    render(
      <PaneHostProvider chrome placement="right">
        <Probe />
      </PaneHostProvider>,
    );
    expect(probe()).toBe('false:right');
  });

  it('still draws when a host explicitly reports no chrome of its own', () => {
    render(
      <PaneHostProvider chrome={false} placement="bottom">
        <Probe />
      </PaneHostProvider>,
    );
    expect(probe()).toBe('true:bottom');
  });

  it('lets an explicit prop win over the host, in both directions', () => {
    // Auto-detection keeps the common case configuration-free, but a component
    // that can only be told implicitly cannot be forced when detection is
    // wrong — or tested without building a host around it.
    render(
      <PaneHostProvider chrome placement="tab">
        <Probe chrome />
      </PaneHostProvider>,
    );
    expect(probe()).toBe('true:tab');

    cleanup();
    render(<Probe chrome={false} />);
    expect(probe()).toBe('false:none');
  });
});

describe('SidebarPane as a host', () => {
  it('reports its side, so a child can lay itself out accordingly', () => {
    render(
      <SidebarPane title="Properties" side="right">
        <Probe />
      </SidebarPane>,
    );
    expect(probe()).toBe('false:right');
  });
});

describe('ChatPane placement', () => {
  it('draws its own header standalone', () => {
    render(<ChatPane title="Chat" onClose={() => {}} />);
    expect(screen.getByLabelText('Close Chat')).toBeInTheDocument();
  });

  it('omits its header inside a pane, so there is only one title', () => {
    render(
      <SidebarPane title="Chat" onClose={() => {}}>
        <ChatPane title="Chat" onClose={() => {}} />
      </SidebarPane>,
    );

    // The pane's close button, and not a second one from the chat pane.
    expect(screen.getByLabelText('Close Panel')).toBeInTheDocument();
    expect(screen.queryByLabelText('Close Chat')).not.toBeInTheDocument();
  });

  it('carries no width or edge of its own, so it fills any host', () => {
    const { container } = render(<ChatPane />);
    const root = container.querySelector('aside')!;

    // It used to hardcode `w-[320px] border-l`, which is exactly why it could
    // only ever live on the right.
    expect(root.className).not.toContain('w-[320px]');
    expect(root.className).not.toContain('border-l');
    expect(root.className).toContain('h-full');
  });
});

describe('TerminalPane placement', () => {
  it('draws its own header and a default height standalone', () => {
    const { container } = render(<TerminalPane onClose={() => {}} />);

    expect(screen.getByLabelText('Close Terminal')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveStyle({ height: '250px' });
  });

  it('fills its host instead of forcing a height', () => {
    const { container } = render(
      <PaneHostProvider chrome placement="tab">
        <TerminalPane onClose={() => {}} />
      </PaneHostProvider>,
    );
    const root = container.querySelector('.font-mono')!;

    // A 250px terminal inside a full-height tab would leave a dead gap.
    expect(root).not.toHaveStyle({ height: '250px' });
    expect(root.className).toContain('h-full');
    expect(screen.queryByLabelText('Close Terminal')).not.toBeInTheDocument();
  });

  it('still honours an explicit height inside a host', () => {
    const { container } = render(
      <PaneHostProvider chrome placement="left">
        <TerminalPane height="120px" />
      </PaneHostProvider>,
    );
    expect(container.querySelector('.font-mono')).toHaveStyle({ height: '120px' });
  });
});
