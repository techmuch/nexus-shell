import { useState } from 'react';
import { ChatPane, SidebarPane, type IChatMessage } from 'nexus-shell';

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

// #region placement
export const Placement = () => {
  const [side, setSide] = useState<'left' | 'right'>('right');

  // The pane carries no width or edge — the host decides both. Flipping this
  // switch is the entire difference between a left-hand and right-hand chat.
  const pane = (
    <SidebarPane title="Chat" side={side} width="300px" onClose={() => {}}>
      <ChatPane
        messages={[
          { id: '1', role: 'user', text: 'Where does this pane live?' },
          { id: '2', role: 'assistant', text: 'Wherever you register it.' },
        ]}
      />
    </SidebarPane>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 gap-2 border-b border-border p-2">
        {(['left', 'right'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSide(option)}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
              side === option
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 bg-background">
        {side === 'left' && pane}
        <div className="grid flex-1 place-items-center text-xs text-muted-foreground">
          workspace
        </div>
        {side === 'right' && pane}
      </div>
    </div>
  );
};
// #endregion
