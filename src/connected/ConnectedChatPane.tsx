import { ChatPane, type ChatPaneProps } from '../components/widgets/ChatPane';
import { useChatStore } from '../core/services/ChatService';

export type ConnectedChatPaneProps = Omit<
  ChatPaneProps,
  'messages' | 'slashCommands' | 'onSend' | 'onClose'
> & {
  /**
   * Handle a plain (non-slash) message. Append any reply with
   * `useChatStore.getState().addMessage(...)`. Without this, user messages are
   * recorded but nothing responds.
   */
  onSend?: (text: string) => void;
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

    onSend?.(text);
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
