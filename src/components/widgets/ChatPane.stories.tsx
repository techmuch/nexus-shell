import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ChatPane, type IChatMessage } from './ChatPane';

const MESSAGES: IChatMessage[] = [
  { id: '1', role: 'assistant', text: 'Welcome to Nexus Shell. How can I help?' },
  { id: '2', role: 'user', text: 'What does ShellLayout do?' },
  {
    id: '3',
    role: 'assistant',
    text: 'It composes the menu bar, activity bar, sidebar, docking area, terminal, chat pane and status bar into one frame, wired to the shell stores.',
  },
];

const SLASH_COMMANDS = [
  { command: 'clear', description: 'Clear the transcript' },
  { command: 'help', description: 'List available commands' },
  { command: 'explain', description: 'Explain the selected code' },
];

const meta = {
  title: 'Primitives/ChatPane',
  component: ChatPane,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A chat panel: a scrolling transcript over a composer with slash-command autocomplete. Fully controlled — it owns only the draft input and the suggestion highlight, so the same component backs a local array, a websocket or an LLM endpoint. Type `/` to see the autocomplete.\n\n**It fills whatever hosts it** — left rail, right rail or a dockable tab — and carries no width or edge of its own. See `ConnectedChatPane` for the variant bound to `useChatStore`, and `chatPanel()` for a ready-made registration.',
      },
    },
  },
  decorators: [
    (Story) => (
      // The pane fills its host, so the host is what decides it is 320px wide
      // and sits on the right. That decision used to be baked into the
      // component, which is why it could only ever live in one place.
      <div className="h-[460px] flex justify-end bg-background">
        <div className="w-[320px] border-l border-border">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof ChatPane>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { messages: MESSAGES, slashCommands: SLASH_COMMANDS, onClose: () => {} },
};

/** The empty state. Override it with the `emptyState` prop. */
export const Empty: Story = {
  args: { messages: [], slashCommands: SLASH_COMMANDS, onClose: () => {} },
};

/** Send messages and watch them append. Type `/` to trigger the command list. */
export const Interactive: Story = {
  args: {},
  render: function Render() {
    const [messages, setMessages] = useState<IChatMessage[]>([]);

    const send = (text: string) => {
      const id = String(Date.now());
      setMessages((m) => [
        ...m,
        { id, role: 'user', text },
        { id: `${id}-r`, role: 'assistant', text: `You said: ${text}` },
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
  },
};

/** `author` overrides the label above a bubble, for multi-agent transcripts. */
export const NamedAuthors: Story = {
  args: {
    onClose: () => {},
    messages: [
      { id: '1', role: 'user', text: 'Who is reviewing this?', author: 'David' },
      { id: '2', role: 'assistant', text: 'I have the diff open.', author: 'Reviewer' },
      { id: '3', role: 'assistant', text: 'Tests are green.', author: 'CI' },
    ],
  },
};

/** Long messages wrap and preserve newlines; the transcript pins to the bottom. */
export const LongTranscript: Story = {
  args: {
    onClose: () => {},
    slashCommands: SLASH_COMMANDS,
    messages: Array.from({ length: 12 }, (_, i) => ({
      id: String(i),
      role: i % 2 === 0 ? ('user' as const) : ('assistant' as const),
      text:
        i % 2 === 0
          ? `Question number ${i / 2 + 1}?`
          : 'A deliberately long answer that wraps across several lines so the bubble\nsizing and scroll pinning can be checked under pressure.',
    })),
  },
};

/** Omitting `onClose` hides the close button, for a pane that is always present. */
export const NotClosable: Story = {
  args: { messages: MESSAGES, slashCommands: SLASH_COMMANDS },
};
