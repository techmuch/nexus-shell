import { useState } from 'react';
import { ChatPane, type IChatMessage } from 'nexus-shell';

const SLASH_COMMANDS = [
  { command: 'clear', description: 'Clear the transcript' },
  { command: 'help', description: 'List available commands' },
  { command: 'explain', description: 'Explain the selected code' },
];

// #region basic
export const Basic = () => {
  const [messages, setMessages] = useState<IChatMessage[]>([
    { id: '1', role: 'assistant', text: 'Welcome. Ask me anything, or type / for commands.' },
  ]);

  const send = (text: string) => {
    const id = String(Date.now());
    setMessages((current) => [
      ...current,
      { id, role: 'user', text },
      { id: `${id}-reply`, role: 'assistant', text: `You said: ${text}` },
    ]);
  };

  return (
    <ChatPane
      messages={messages}
      slashCommands={SLASH_COMMANDS}
      onSend={send}
      onClose={() => {}}
    />
  );
};
// #endregion

// #region authors
export const NamedAuthors = () => (
  <ChatPane
    onClose={() => {}}
    // `author` overrides the label above a bubble, for multi-agent transcripts.
    messages={[
      { id: '1', role: 'user', text: 'Who is reviewing this?', author: 'David' },
      { id: '2', role: 'assistant', text: 'I have the diff open.', author: 'Reviewer' },
      { id: '3', role: 'assistant', text: 'Tests are green.', author: 'CI' },
    ]}
  />
);
// #endregion

// #region empty
export const EmptyState = () => (
  <ChatPane
    messages={[]}
    slashCommands={SLASH_COMMANDS}
    // Override the default placeholder with your own node.
    emptyState={
      <div className="h-full grid place-items-center text-center px-6">
        <p className="text-xs text-muted-foreground">
          No conversation yet.
          <br />
          Try <span className="font-mono">/help</span>.
        </p>
      </div>
    }
  />
);
// #endregion
