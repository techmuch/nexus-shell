import { ChatPane, type ChatPaneProps } from '../components/widgets/ChatPane';
import {
  chatReplyApi,
  useChatStore,
  type ChatSendHandler,
} from '../core/services/ChatService';

export type ConnectedChatPaneProps = Omit<
  ChatPaneProps,
  'messages' | 'slashCommands' | 'onSend' | 'onClose'
> & {
  /**
   * Handle a plain (non-slash) message. The second argument answers it —
   * `chat.reply(text)`, or `chat.stream()` for a streamed reply. A rejected
   * promise is shown as a failed reply.
   *
   * Falls back to the app-wide handler (`useChatStore().setSendHandler`, or
   * `initializeShell({ chat: { onSend } })`). With neither, the pane says so
   * rather than silently swallowing the message.
   */
  onSend?: ChatSendHandler;
};

/**
 * {@link ChatPane} bound to `useChatStore` and `useChatVisibilityStore`.
 *
 * Appends each submission to the transcript, then either dispatches a
 * registered slash command's `execute` or hands the text to `onSend`.
 *
 * Visibility belongs to whatever hosts it — a pane closes by closing the pane,
 * a tab by closing the tab. Register it with `chatPanel()`, or as a tab
 * component, and put it wherever it belongs.
 */
export const ConnectedChatPane = ({ onSend, ...props }: ConnectedChatPaneProps) => {
  const messages = useChatStore((s) => s.messages);
  const slashCommands = useChatStore((s) => s.slashCommands);
  const addMessage = useChatStore((s) => s.addMessage);
  const sendHandler = useChatStore((s) => s.sendHandler);

  const handleSend = (text: string) => {
    addMessage({ role: 'user', text });

    if (text.startsWith('/')) {
      const [word, ...args] = text.slice(1).split(/\s+/);
      const command = slashCommands.find((c) => c.command === word);
      if (command) {
        command.execute(args);
        return;
      }
      addMessage({ role: 'assistant', text: `Unknown command: /${word}` });
      return;
    }

    const handler = onSend ?? sendHandler;
    if (!handler) {
      addMessage({ role: 'assistant', text: 'Nothing is connected to this chat yet.', error: true });
      return;
    }
    const fail = (e: unknown) =>
      useChatStore.getState().addMessage({
        role: 'assistant',
        text: `Something went wrong: ${e instanceof Error ? e.message : String(e)}`,
        error: true,
      });
    try {
      const result = handler(text, chatReplyApi);
      if (result && typeof (result as Promise<unknown>).catch === 'function') {
        (result as Promise<unknown>).catch(fail);
      }
    } catch (e) {
      fail(e);
    }
  };

  return (
    <ChatPane
      {...props}
      messages={messages}
      slashCommands={slashCommands}
      onSend={handleSend}
    />
  );
};
