export interface ICommand {
  id: string;
  label: string;
  execute: (...args: any[]) => void;
  icon?: string;
  keybinding?: string;
}

export class CommandRegistry {
  private commands = new Map<string, ICommand>();

  registerCommand(command: ICommand): void {
    if (this.commands.has(command.id)) {
      console.warn(`Command ${command.id} is already registered.`);
      return;
    }
    this.commands.set(command.id, command);
  }

  executeCommand(id: string, ...args: any[]): void {
    const command = this.commands.get(id);
    if (command) {
      command.execute(...args);
    } else {
      console.warn(`Command ${id} not found.`);
    }
  }

  getCommand(id: string): ICommand | undefined {
    return this.commands.get(id);
  }

  getCommands(): ICommand[] {
    return Array.from(this.commands.values());
  }
}

export const commandRegistry = new CommandRegistry();
