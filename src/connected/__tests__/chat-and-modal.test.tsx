import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { ConnectedChatPane } from '../ConnectedChatPane';
import { ConnectedModal } from '../ConnectedModal';
import { chatPanel } from '../panels';
import { chatReplyApi, useChatStore } from '../../core/services/ChatService';
import { useModalStore } from '../../core/services/ModalStoreService';
import { initializeShell } from '../../core/Boot';
import { Modal } from '../../components/widgets/Modal';
import { resetShell } from '../../testing';

beforeEach(() => resetShell());
afterEach(cleanup);

const send = (text: string) => {
  const box = screen.getByRole('textbox');
  fireEvent.change(box, { target: { value: text } });
  fireEvent.keyDown(box, { key: 'Enter' });
};

describe('chat', () => {
  it('chatPanel({ onSend }) wires a handler that can reply', () => {
    const panel = chatPanel({ side: 'bottom', onSend: (text, chat) => void chat.reply(`echo ${text}`) });
    expect(panel.side).toBe('bottom');
    const Pane = panel.component as React.ComponentType;
    render(<Pane />);
    send('hello');
    expect(screen.getByText('echo hello')).toBeInTheDocument();
  });

  it('streams a reply: typing indicator, appended text, done', () => {
    let stream: ReturnType<typeof chatReplyApi.stream> | undefined;
    render(<ConnectedChatPane onSend={(_t, chat) => void (stream = chat.stream())} />);
    send('question');
    expect(screen.getByRole('status', { name: /typing/ })).toBeInTheDocument();

    act(() => stream!.append('Part one, '));
    act(() => stream!.append('part two.'));
    expect(screen.getByText('Part one, part two.')).toBeInTheDocument();
    const msgs = useChatStore.getState().messages;
    expect(msgs[msgs.length - 1].pending).toBe(true);

    act(() => stream!.done());
    const last = useChatStore.getState().messages[useChatStore.getState().messages.length - 1];
    expect(last).toMatchObject({ text: 'Part one, part two.', pending: false });
  });

  it('marks a failed stream as an error', () => {
    let stream: ReturnType<typeof chatReplyApi.stream> | undefined;
    render(<ConnectedChatPane onSend={(_t, chat) => void (stream = chat.stream())} />);
    send('q');
    act(() => stream!.fail('Model unavailable'));
    const last = useChatStore.getState().messages[useChatStore.getState().messages.length - 1];
    expect(last).toMatchObject({ error: true, pending: false, text: 'Model unavailable' });
  });

  it('shows a rejected handler as a failed reply', async () => {
    render(<ConnectedChatPane onSend={async () => Promise.reject(new Error('gateway down'))} />);
    send('q');
    expect(await screen.findByText(/gateway down/)).toBeInTheDocument();
  });

  it('uses the app-wide handler from initializeShell when none is passed', () => {
    initializeShell({ chat: { onSend: (t, chat) => void chat.reply(`global ${t}`) } });
    render(<ConnectedChatPane />);
    send('hi');
    expect(screen.getByText('global hi')).toBeInTheDocument();
  });

  it('says so when nothing is connected, rather than swallowing the message', () => {
    render(<ConnectedChatPane />);
    send('anyone?');
    expect(screen.getByText(/Nothing is connected/)).toBeInTheDocument();
  });

  it('keeps old single-argument handlers working', () => {
    const legacy = vi.fn((text: string) => {
      useChatStore.getState().addMessage({ role: 'assistant', text: `legacy ${text}` });
    });
    render(<ConnectedChatPane onSend={legacy} />);
    send('x');
    expect(screen.getByText('legacy x')).toBeInTheDocument();
  });

  it('addMessage returns the id; updateMessage and appendToMessage edit in place', () => {
    const id = useChatStore.getState().addMessage({ role: 'assistant', text: 'a' });
    useChatStore.getState().appendToMessage(id, 'b');
    useChatStore.getState().updateMessage(id, { author: 'Bot' });
    expect(useChatStore.getState().messages.find((m) => m.id === id)).toMatchObject({ text: 'ab', author: 'Bot' });
  });
});

describe('content modal', () => {
  const Form = ({ onSave, onCancel }: { onSave: (v: string) => void; onCancel: () => void }) => {
    const [v, setV] = useState('');
    return (
      <div>
        <textarea aria-label="notes" value={v} onChange={(e) => setV(e.target.value)} />
        <button onClick={() => onSave(v)}>Save</button>
        <button onClick={onCancel}>Discard</button>
      </div>
    );
  };

  it('openCustom renders content and resolves with what it closes with', async () => {
    render(<ConnectedModal />);
    let result: unknown = 'pending';
    act(() => {
      useModalStore
        .getState()
        .openCustom<string>((close) => <Form onSave={close} onCancel={() => close()} />, { title: 'Notes', size: 'lg' })
        .then((v) => (result = v));
    });
    const notes = screen.getByLabelText('notes');
    // The first field gets focus.
    expect(document.activeElement).toBe(notes);
    fireEvent.change(notes, { target: { value: 'line one' } });
    // Enter in a content dialog is typing, not confirm.
    fireEvent.keyDown(notes, { key: 'Enter' });
    expect(useModalStore.getState().isOpen).toBe(true);

    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(result).toBe('line one'));
    expect(screen.queryByLabelText('notes')).toBeNull();
  });

  it('resolves undefined when dismissed with Escape', async () => {
    render(<ConnectedModal />);
    let result: unknown = 'pending';
    act(() => {
      useModalStore.getState().openCustom((close) => <Form onSave={close} onCancel={() => close()} />, { title: 'N' }).then((v) => (result = v));
    });
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(result).toBeUndefined());
  });

  it('settles a dialog that is replaced by another, so its caller never hangs', async () => {
    let first: unknown = 'pending';
    useModalStore.getState().openConfirm('First?').then((v) => (first = v));
    useModalStore.getState().openAlert('Second');
    await waitFor(() => expect(first).toBe(false));
  });

  it('traps Tab inside the dialog and restores focus on close', () => {
    const outside = document.createElement('button');
    outside.textContent = 'outside';
    document.body.appendChild(outside);
    outside.focus();

    const { rerender } = render(
      <Modal open title="Trap" onCancel={() => {}} footer={<button>Last</button>}>
        <input aria-label="first" />
      </Modal>,
    );
    const close = screen.getByLabelText('Close');
    const last = screen.getByText('Last');
    last.focus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);

    rerender(
      <Modal open={false} title="Trap" onCancel={() => {}}>
        <input aria-label="first" />
      </Modal>,
    );
    expect(document.activeElement).toBe(outside);
    outside.remove();
  });

  it('can refuse backdrop dismissal', () => {
    const onCancel = vi.fn();
    const { container } = render(
      <Modal open title="Sticky" onCancel={onCancel} closeOnBackdrop={false}>
        <p>body</p>
      </Modal>,
    );
    fireEvent.click(container.firstChild as HTMLElement);
    expect(onCancel).not.toHaveBeenCalled();
  });
});

describe('chat handler typing', () => {
  it('accepts an async handler that returns the reply id, as the README shows', () => {
    const ask = async (t: string) => `answer to ${t}`;
    const panel = chatPanel({ side: 'right', onSend: async (text, chat) => chat.reply(await ask(text)) });
    expect(panel.id).toBe('chat');
  });
});
