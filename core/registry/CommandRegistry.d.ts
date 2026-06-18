export interface ICommand {
    id: string;
    label: string;
    execute: (...args: any[]) => void;
    icon?: string;
    keybinding?: string;
}
export declare class CommandRegistry {
    private commands;
    registerCommand(command: ICommand): void;
    executeCommand(id: string, ...args: any[]): void;
    getCommand(id: string): ICommand | undefined;
    getCommands(): ICommand[];
}
export declare const commandRegistry: CommandRegistry;
