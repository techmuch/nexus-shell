import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Files, Search } from 'lucide-react';

import { ActivityBar } from '../ActivityBar';
import { ChatPane } from '../ChatPane';
import { CommandPalette } from '../CommandPalette';
import { Modal } from '../Modal';
import { SidebarPane } from '../SidebarPane';
import { StatusBar } from '../StatusBar';
import { TerminalPane } from '../TerminalPane';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { TreeWidget, type ITreeNode } from '../TreeWidget';

/**
 * These tests exist to protect the property that makes this a library rather
 * than an application: every primitive must render purely from its props, and
 * report every state change outward. If one of these starts failing because a
 * component "needs" a store, that's the regression.
 */

describe('StatusBar', () => {
  it('renders items into their alignment groups', () => {
    render(
      <StatusBar
        widgets={[
          { id: 'a', label: 'Left', alignment: 'left' },
          { id: 'b', label: 'Center', alignment: 'center' },
          { id: 'c', label: 'Right', alignment: 'right' },
        ]}
      />,
    );
    expect(screen.getByText('Left')).toBeInTheDocument();
    expect(screen.getByText('Center')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();
  });

  it('sorts by descending priority within a group', () => {
    render(
      <StatusBar
        widgets={[
          { id: 'low', label: 'Low', alignment: 'left', priority: 1 },
          { id: 'high', label: 'High', alignment: 'left', priority: 10 },
        ]}
      />,
    );
    const bar = screen.getByRole('status');
    expect(bar.textContent).toBe('HighLow');
  });

  it('only makes items with onClick interactive', () => {
    render(
      <StatusBar
        widgets={[
          { id: 'static', label: 'Static', alignment: 'left' },
          { id: 'button', label: 'Button', alignment: 'left', onClick: () => {} },
        ]}
      />,
    );
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('fires onClick for mouse and keyboard', async () => {
    const onClick = vi.fn();
    render(
      <StatusBar widgets={[{ id: 'a', label: 'Go', alignment: 'left', onClick }]} />,
    );
    const item = screen.getByRole('button');
    await userEvent.click(item);
    item.focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('renders nothing but the landmark when empty', () => {
    render(<StatusBar />);
    expect(screen.getByRole('status').textContent).toBe('');
  });
});

describe('ActivityBar', () => {
  const items = [
    { id: 'files', label: 'Explorer', icon: Files },
    { id: 'search', label: 'Search', icon: Search },
  ];

  it('marks only the active item as pressed', () => {
    render(<ActivityBar items={items} activeId="search" bottomItems={[]} />);
    expect(screen.getByLabelText('Search')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Explorer')).toHaveAttribute('aria-pressed', 'false');
  });

  it('reports selection without changing anything itself', async () => {
    const onSelect = vi.fn();
    render(<ActivityBar items={items} activeId={null} onSelect={onSelect} bottomItems={[]} />);
    await userEvent.click(screen.getByLabelText('Explorer'));
    expect(onSelect).toHaveBeenCalledWith('files');
    // Still unselected: the parent owns that decision.
    expect(screen.getByLabelText('Explorer')).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders a default Settings item, and omits it when bottomItems is empty', () => {
    const { rerender } = render(<ActivityBar items={items} />);
    expect(screen.getByLabelText('Settings')).toBeInTheDocument();
    rerender(<ActivityBar items={items} bottomItems={[]} />);
    expect(screen.queryByLabelText('Settings')).not.toBeInTheDocument();
  });
});

describe('SidebarPane', () => {
  it('shows the close button only when onClose is given', () => {
    const { rerender } = render(<SidebarPane title="Explorer">body</SidebarPane>);
    expect(screen.queryByLabelText('Close Panel')).not.toBeInTheDocument();
    rerender(
      <SidebarPane title="Explorer" onClose={() => {}}>
        body
      </SidebarPane>,
    );
    expect(screen.getByLabelText('Close Panel')).toBeInTheDocument();
  });

  it('renders arbitrary children', () => {
    render(
      <SidebarPane title="Explorer">
        <p>custom content</p>
      </SidebarPane>,
    );
    expect(screen.getByText('custom content')).toBeInTheDocument();
  });
});

describe('ThemeSwitcher', () => {
  it('reflects value and reports changes', async () => {
    const onChange = vi.fn();
    render(<ThemeSwitcher value="dark" onChange={onChange} />);
    expect(screen.getByRole('radio', { name: 'Dark' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await userEvent.click(screen.getByRole('radio', { name: 'Light' }));
    expect(onChange).toHaveBeenCalledWith('light');
  });

  it('accepts custom options', () => {
    render(
      <ThemeSwitcher
        value="mono"
        onChange={() => {}}
        options={[{ id: 'mono', label: 'Mono' }]}
      />,
    );
    expect(screen.getAllByRole('radio')).toHaveLength(1);
  });
});

describe('CommandPalette', () => {
  const commands = [
    { id: 'file.save', label: 'File: Save' },
    { id: 'file.new', label: 'File: New' },
    { id: 'git.push', label: 'Git: Push' },
  ];

  it('renders nothing when closed', () => {
    const { container } = render(
      <CommandPalette open={false} commands={commands} onSelect={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('filters by label and id', async () => {
    render(<CommandPalette open inline commands={commands} onSelect={() => {}} />);
    await userEvent.type(screen.getByRole('combobox'), 'git');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByText('Git: Push')).toBeInTheDocument();
  });

  it('selects the highlighted command on Enter', async () => {
    const onSelect = vi.fn();
    render(<CommandPalette open inline commands={commands} onSelect={onSelect} />);
    const input = screen.getByRole('combobox');
    await userEvent.type(input, '{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledWith(commands[1]);
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(
      <CommandPalette open inline commands={commands} onSelect={() => {}} onClose={onClose} />,
    );
    await userEvent.type(screen.getByRole('combobox'), '{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('explains itself when there are no commands', () => {
    render(<CommandPalette open inline commands={[]} onSelect={() => {}} />);
    expect(screen.getByText('No commands available.')).toBeInTheDocument();
  });
});

describe('Modal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<Modal open={false} title="Hi" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows one button for alert and two otherwise', () => {
    const { rerender } = render(<Modal open type="alert" title="Alert" />);
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();

    rerender(<Modal open type="confirm" title="Confirm" />);
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('returns the edited text from a prompt', async () => {
    const onConfirm = vi.fn();
    render(
      <Modal open type="prompt" title="Rename" defaultValue="old" onConfirm={onConfirm} />,
    );
    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'new');
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledWith('new');
  });

  it('cancels on Escape', async () => {
    const onCancel = vi.fn();
    render(<Modal open type="confirm" title="Confirm" onCancel={onCancel} />);
    await userEvent.type(screen.getByRole('dialog'), '{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });
});

describe('TerminalPane', () => {
  it('renders history lines in order', () => {
    render(<TerminalPane history={['line one', 'line two']} />);
    expect(screen.getByRole('log').textContent).toBe('line oneline two');
  });

  it('reports commands without echoing them itself', async () => {
    const onCommand = vi.fn();
    render(<TerminalPane history={[]} onCommand={onCommand} />);
    await userEvent.type(screen.getByRole('textbox'), 'help{Enter}');
    expect(onCommand).toHaveBeenCalledWith('help');
    // The caller owns the transcript, so nothing was written.
    expect(screen.getByRole('log').textContent).toBe('');
  });

  it('ignores empty submissions', async () => {
    const onCommand = vi.fn();
    render(<TerminalPane history={[]} onCommand={onCommand} />);
    await userEvent.type(screen.getByRole('textbox'), '   {Enter}');
    expect(onCommand).not.toHaveBeenCalled();
  });
});

describe('ChatPane', () => {
  const messages = [
    { id: '1', role: 'user' as const, text: 'hello' },
    { id: '2', role: 'assistant' as const, text: 'hi there' },
  ];

  it('renders the transcript', () => {
    render(<ChatPane messages={messages} />);
    expect(screen.getByText('hello')).toBeInTheDocument();
    expect(screen.getByText('hi there')).toBeInTheDocument();
  });

  it('shows an empty state with no messages', () => {
    render(<ChatPane messages={[]} />);
    expect(screen.getByText('No messages yet.')).toBeInTheDocument();
  });

  it('sends on Enter and clears the composer', async () => {
    const onSend = vi.fn();
    render(<ChatPane messages={[]} onSend={onSend} />);
    const input = screen.getByLabelText('Chat message');
    await userEvent.type(input, 'a question{Enter}');
    expect(onSend).toHaveBeenCalledWith('a question');
    expect(input).toHaveValue('');
  });

  it('offers slash command autocomplete', async () => {
    render(
      <ChatPane
        messages={[]}
        slashCommands={[
          { command: 'clear', description: 'Clear' },
          { command: 'help', description: 'Help' },
        ]}
      />,
    );
    await userEvent.type(screen.getByLabelText('Chat message'), '/cl');
    expect(screen.getByRole('option', { name: /clear/i })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /help/i })).not.toBeInTheDocument();
  });
});

describe('TreeWidget', () => {
  const data: ITreeNode[] = [
    {
      id: 'src',
      label: 'src',
      type: 'folder',
      isOpen: true,
      children: [{ id: 'app', label: 'App.tsx', type: 'file' }],
    },
    { id: 'closed', label: 'closed', type: 'folder', children: [{ id: 'x', label: 'x.ts', type: 'file' }] },
  ];

  it('renders children only for open folders', () => {
    render(<TreeWidget data={data} virtualized={false} />);
    expect(screen.getByText('App.tsx')).toBeInTheDocument();
    expect(screen.queryByText('x.ts')).not.toBeInTheDocument();
  });

  it('reports toggles rather than owning expansion', async () => {
    const onToggle = vi.fn();
    render(<TreeWidget data={data} onToggle={onToggle} virtualized={false} />);
    await userEvent.click(screen.getByText('closed'));
    expect(onToggle).toHaveBeenCalledWith(expect.objectContaining({ id: 'closed' }));
    // Still collapsed: the data didn't change.
    expect(screen.queryByText('x.ts')).not.toBeInTheDocument();
  });

  it('activates files on double click', async () => {
    const onActivate = vi.fn();
    render(<TreeWidget data={data} onActivate={onActivate} virtualized={false} />);
    await userEvent.dblClick(screen.getByText('App.tsx'));
    expect(onActivate).toHaveBeenCalledWith(expect.objectContaining({ id: 'app' }));
  });

  it('exposes custom actions in the context menu, honouring showFor', async () => {
    const onSelect = vi.fn();
    render(
      <TreeWidget
        data={data}
        virtualized={false}
        actions={[
          { id: 'folder-only', label: 'Folder Only', showFor: ['folder'], onSelect },
          { id: 'file-only', label: 'File Only', showFor: ['file'], onSelect },
        ]}
      />,
    );

    await userEvent.pointer({ keys: '[MouseRight]', target: screen.getByText('App.tsx') });
    expect(screen.getByText('File Only')).toBeInTheDocument();
    expect(screen.queryByText('Folder Only')).not.toBeInTheDocument();

    await userEvent.click(screen.getByText('File Only'));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ nodeId: 'app' }),
    );
  });

  it('passes a null nodeId for background right-clicks', async () => {
    const onSelect = vi.fn();
    const { container } = render(
      <TreeWidget
        data={data}
        virtualized={false}
        actions={[{ id: 'new', label: 'New File', onSelect }]}
      />,
    );
    await userEvent.pointer({ keys: '[MouseRight]', target: container.firstChild as Element });
    await userEvent.click(screen.getByText('New File'));
    expect(onSelect).toHaveBeenCalledWith({ nodeId: null, node: null });
  });
});
