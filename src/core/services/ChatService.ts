import { create } from 'zustand'

export interface ISlashCommand {
  command: string;
  description: string;
  execute: (args: string[]) => void;
}

interface ChatState {
  slashCommands: ISlashCommand[];
  setSlashCommands: (commands: ISlashCommand[]) => void;
  registerSlashCommand: (command: ISlashCommand) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  slashCommands: [],
  setSlashCommands: (slashCommands) => set({ slashCommands }),
  registerSlashCommand: (command) => set((state) => ({
    slashCommands: [...state.slashCommands, command]
  })),
}))
