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
  registerSlashCommand: (command: ISlashCommandConfig) => void;
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
    set((state) => ({ slashCommands: [...state.slashCommands, command] })),
}));

export type { IChatMessage, ISlashCommand };
