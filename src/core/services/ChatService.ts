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

interface ChatState {
  messages: IChatMessage[];
  slashCommands: ISlashCommandConfig[];
  setMessages: (messages: IChatMessage[]) => void;
  addMessage: (message: Omit<IChatMessage, 'id'> & { id?: string }) => void;
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
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, { ...message, id: message.id ?? nextId() }],
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

export type { IChatMessage, ISlashCommand };
