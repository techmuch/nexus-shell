import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, Terminal, User, X } from 'lucide-react';
import { cn } from '../../lib/cn';

/** A single message in the {@link ChatPane} transcript. */
export interface IChatMessage {
  /** Stable identifier. Used as the React key. */
  id: string;
  /** Who sent it. `'user'` right-aligns; anything else left-aligns. */
  role: 'user' | 'assistant';
  /** Message body. Rendered as plain text with newlines preserved. */
  text: string;
  /** Optional display name shown above the bubble. Defaults from `role`. */
  author?: string;
}

/** A `/`-prefixed shortcut offered in the composer's autocomplete. */
export interface ISlashCommand {
  /** Command word without the leading slash, e.g. `"clear"`. */
  command: string;
  /** One-line description shown beside the command in the suggestion list. */
  description: string;
}

export interface ChatPaneProps {
  /** Messages to display, oldest first. */
  messages?: IChatMessage[];
  /**
   * Called with the trimmed message text on send. The component clears its
   * composer but does not append to `messages` — that is the caller's job.
   */
  onSend?: (text: string) => void;
  /** Slash commands offered once the composer starts with `/`. */
  slashCommands?: ISlashCommand[];
  /** Called when a slash command is picked from the suggestion list. */
  onSlashCommand?: (command: ISlashCommand) => void;
  /** Called when the close button is pressed. Omit to hide the button. */
  onClose?: () => void;
  /** Title shown in the pane header. Defaults to `"Chat"`. */
  title?: string;
  /** Placeholder for the composer. */
  placeholder?: string;
  /** Shown in place of the transcript when `messages` is empty. */
  emptyState?: React.ReactNode;
  /** Extra classes merged onto the root element. */
  className?: string;
}

const DEFAULT_EMPTY_STATE = (
  <div className="h-full flex flex-col items-center justify-center text-center px-6 text-muted-foreground">
    <MessageCircle size={28} className="mb-3 opacity-40" />
    <p className="text-xs">No messages yet.</p>
    <p className="text-[11px] mt-1 opacity-70">
      Type a message, or <span className="font-mono">/</span> for commands.
    </p>
  </div>
);

/**
 * A docked chat panel: a scrolling transcript over a composer with slash-command
 * autocomplete.
 *
 * Fully controlled — it owns only the in-progress input and the suggestion
 * highlight. Messages, sending and visibility belong to the caller, so the same
 * component works against a local array, a websocket, or an LLM endpoint. For
 * the store-backed variant used by `ShellLayout`, see `ConnectedChatPane`.
 *
 * @example
 * ```tsx
 * <ChatPane
 *   messages={messages}
 *   onSend={(text) => send(text)}
 *   slashCommands={[{ command: 'clear', description: 'Clear the transcript' }]}
 *   onClose={() => setOpen(false)}
 * />
 * ```
 */
export const ChatPane = ({
  messages = [],
  onSend,
  slashCommands = [],
  onSlashCommand,
  onClose,
  title = 'Chat',
  placeholder = 'Send a message…',
  emptyState = DEFAULT_EMPTY_STATE,
  className,
}: ChatPaneProps) => {
  const [input, setInput] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestions = input.startsWith('/')
    ? slashCommands.filter((cmd) =>
        `/${cmd.command}`.startsWith(input.toLowerCase().split(' ')[0]),
      )
    : [];
  const showSuggestions = suggestions.length > 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setSuggestionIndex(0);
  }, [input]);

  const submit = () => {
    const text = input.trim();
    if (!text) return;
    onSend?.(text);
    setInput('');
  };

  const pickSuggestion = (cmd: ISlashCommand) => {
    onSlashCommand?.(cmd);
    setInput(`/${cmd.command} `);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSuggestionIndex((i) => (i + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSuggestionIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault();
        pickSuggestion(suggestions[suggestionIndex]);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <aside
      role="complementary"
      aria-label={title}
      className={cn(
        'w-[320px] h-full bg-muted border-l border-border flex flex-col select-none shrink-0',
        className,
      )}
    >
      <div className="h-10 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <MessageCircle size={13} />
          <span className="text-[11px] font-bold uppercase tracking-widest">
            {title}
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Chat"
            className="p-1 rounded hover:bg-accent hover:text-foreground text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        role="log"
        aria-label={`${title} transcript`}
        className="flex-1 overflow-y-auto border-t border-border/50 bg-background/50 px-3 py-3 space-y-3"
      >
        {messages.length === 0
          ? emptyState
          : messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div
                  key={message.id}
                  className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}
                >
                  <div className="flex items-center space-x-1 mb-1 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    {isUser ? <User size={10} /> : <Terminal size={10} />}
                    <span>{message.author ?? (isUser ? 'You' : 'Assistant')}</span>
                  </div>
                  <div
                    className={cn(
                      'max-w-[85%] rounded-lg px-3 py-2 text-xs whitespace-pre-wrap break-words',
                      isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border text-foreground',
                    )}
                  >
                    {message.text}
                  </div>
                </div>
              );
            })}
      </div>

      <div className="relative border-t border-border/50 p-2 shrink-0">
        {showSuggestions && (
          <div
            role="listbox"
            aria-label="Slash commands"
            className="absolute bottom-full left-2 right-2 mb-1 bg-popover border border-border rounded-md shadow-lg overflow-hidden z-20"
          >
            {suggestions.map((cmd, i) => (
              <div
                key={cmd.command}
                role="option"
                aria-selected={i === suggestionIndex}
                onMouseEnter={() => setSuggestionIndex(i)}
                onClick={() => pickSuggestion(cmd)}
                className={cn(
                  'px-3 py-1.5 text-xs cursor-pointer flex items-baseline justify-between gap-3',
                  i === suggestionIndex
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50',
                )}
              >
                <span className="font-mono">/{cmd.command}</span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {cmd.description}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end space-x-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            aria-label={`${title} message`}
            placeholder={placeholder}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 resize-none bg-background border border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 max-h-32"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!input.trim()}
            aria-label="Send message"
            className="p-2 rounded-md bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};
