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
export declare const useChatStore: import('zustand').UseBoundStore<import('zustand').StoreApi<ChatState>>;
export {};
