import { create } from 'zustand';
import type { IChatMessage, ISlashCommand } from '../../components/widgets/ChatPane';

/**
 * A slash command as held in the shell store. Extends the presentational
 * {@link ISlashCommand} with the handler that runs when it is invoked.
 */
export interface ISlashCommandConfig extends ISlashCommand {
  /** Runs when the command is submitted. Receives the whitespace-split args. */
  execute: (args: string[]) => void;
}

/** A reply being written, returned by {@link ChatReplyApi.stream}. */
export interface ChatStream {
  /** The message id. */
  id: string;
  /** Append text as it arrives. */
  append: (chunk: string) => void;
  /** Finish. `text` replaces the accumulated text when given. */
  done: (text?: string) => void;
  /** Finish as failed, showing `message`. */
  fail: (message: string) => void;
}

/** Helpers handed to a send handler for answering. */
export interface ChatReplyApi {
  /** Add a complete assistant reply. Returns its id. */
  reply: (text: string, options?: { author?: string }) => string;
  /** Start a streamed assistant reply, shown as typing until text arrives. */
  stream: (options?: { author?: string }) => ChatStream;
}

/**
 * What runs when the user sends a message that is not a slash command.
 *
 * Return a promise to have a rejection shown in the transcript as a failed
 * reply, rather than lost.
 *
 * @example
 * ```ts
 * chatPanel({
 *   onSend: async (text, chat) => {
 *     const reply = chat.stream();
 *     for await (const chunk of llm.stream(text)) reply.append(chunk);
 *     reply.done();
 *   },
 * });
 * ```
 */
export type ChatSendHandler = (text: string, chat: ChatReplyApi) => void | Promise<unknown>;

interface ChatState {
  messages: IChatMessage[];
  slashCommands: ISlashCommandConfig[];
  /**
   * The app-wide send handler, used by any `ConnectedChatPane` not given its
   * own `onSend`. Set with `setSendHandler` or `initializeShell({ chat })`.
   */
  sendHandler: ChatSendHandler | null;
  setSendHandler: (handler: ChatSendHandler | null) => void;
  setMessages: (messages: IChatMessage[]) => void;
  /** Append a message. Returns its id. */
  addMessage: (message: Omit<IChatMessage, 'id'> & { id?: string }) => string;
  /** Change a message in place — mark it done, fix its text. */
  updateMessage: (id: string, patch: Partial<Omit<IChatMessage, 'id'>>) => void;
  /** Append text to a message, for streamed replies. */
  appendToMessage: (id: string, chunk: string) => void;
  clearMessages: () => void;
  setSlashCommands: (commands: ISlashCommandConfig[]) => void;
  /**
   * Add a command, replacing any existing one with the same `command` word.
   *
   * Registering is idempotent so that a component registering in an effect is
   * safe to mount twice — which React does in StrictMode, and again on every
   * remount. Appending blindly would leave the same command listed two or three
   * times in the suggestion list.
   */
  registerSlashCommand: (command: ISlashCommandConfig) => void;
  /**
   * Remove a command by its `command` word. Unknown words are ignored.
   *
   * The counterpart to {@link ChatState.registerSlashCommand}, so a component
   * that registers on mount can clean up on unmount and stop offering a command
   * whose handler is gone.
   */
  unregisterSlashCommand: (command: string) => void;
}

let messageCounter = 0;
const nextId = () => `msg-${Date.now()}-${(messageCounter += 1)}`;

/**
 * Shell-level store for the chat pane's transcript and slash commands.
 * Consumed by `ConnectedChatPane`; the presentational `ChatPane` does not read
 * it.
 */
export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  slashCommands: [],
  sendHandler: null,
  setSendHandler: (sendHandler) => set({ sendHandler }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => {
    const id = message.id ?? nextId();
    set((state) => ({ messages: [...state.messages, { ...message, id }] }));
    return id;
  },
  updateMessage: (id, patch) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),
  appendToMessage: (id, chunk) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, text: m.text + chunk } : m)),
    })),
  clearMessages: () => set({ messages: [] }),
  setSlashCommands: (slashCommands) => set({ slashCommands }),
  registerSlashCommand: (command) =>
    set((state) => {
      const existing = state.slashCommands.findIndex(
        (c) => c.command === command.command,
      );
      if (existing === -1) {
        return { slashCommands: [...state.slashCommands, command] };
      }
      // Replace in place so re-registering does not reorder the suggestion
      // list, and the newest handler wins.
      const slashCommands = [...state.slashCommands];
      slashCommands[existing] = command;
      return { slashCommands };
    }),
  unregisterSlashCommand: (command) =>
    set((state) => ({
      slashCommands: state.slashCommands.filter((c) => c.command !== command),
    })),
}));

/** The {@link ChatReplyApi} bound to the shell's chat store. */
export const chatReplyApi: ChatReplyApi = {
  reply: (text, options = {}) =>
    useChatStore.getState().addMessage({ role: 'assistant', text, author: options.author }),
  stream: (options = {}) => {
    const store = useChatStore.getState();
    const id = store.addMessage({ role: 'assistant', text: '', author: options.author, pending: true });
    return {
      id,
      append: (chunk) => useChatStore.getState().appendToMessage(id, chunk),
      done: (text) =>
        useChatStore.getState().updateMessage(id, { pending: false, ...(text !== undefined ? { text } : {}) }),
      fail: (message) => useChatStore.getState().updateMessage(id, { pending: false, error: true, text: message }),
    };
  },
};

export type { IChatMessage, ISlashCommand };
