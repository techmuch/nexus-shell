export interface ICommand {
  id: string;
  label: string;
  execute: (...args: any[]) => void;
  icon?: string;
  /**
   * Keyboard shortcut, e.g. `"Mod+S"`, `"Control+Shift+K"`, `"F1"`. `Mod` is
   * Cmd on macOS and Control elsewhere. Shown in menus and the palette.
   */
  keybinding?: string;
  /**
   * When this returns `false`, the shortcut does not fire and the palette
   * hides the command. `executeCommand` still runs it — an explicit call is
   * the caller's decision.
   */
  when?: () => boolean;
  /**
   * Whether the shortcut fires while focus is in a text field. Defaults to
   * `true` for bindings with Control, Alt or Meta (Mod+S should save from an
   * editor) and `false` for bare keys and Shift+key, which are typing.
   */
  allowInInputs?: boolean;
}

type Listener = () => void;

export class CommandRegistry {
  private commands = new Map<string, ICommand>();
  private listeners = new Set<Listener>();
  private version = 0;

  /**
   * Register a command, replacing any existing one with the same id.
   *
   * Replacing rather than ignoring is what lets a component register in an
   * effect: the newest closure wins, so a command never runs against stale
   * state, and React StrictMode's double mount is harmless.
   *
   * @returns A disposer that unregisters this command — and only this one, so
   * disposing a registration that has since been replaced does nothing.
   */
  registerCommand(command: ICommand): () => void {
    this.commands.set(command.id, command);
    this.notify();
    return () => {
      if (this.commands.get(command.id) === command) this.unregisterCommand(command.id);
    };
  }

  /** Remove a command. Unknown ids are ignored. */
  unregisterCommand(id: string): void {
    if (this.commands.delete(id)) this.notify();
  }

  /** Whether a command with this id is registered. */
  hasCommand(id: string): boolean {
    return this.commands.has(id);
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

  /** Run `listener` whenever a command is registered or removed. */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Changes on every registration; for `useSyncExternalStore`. */
  getVersion(): number {
    return this.version;
  }

  private notify(): void {
    this.version += 1;
    this.listeners.forEach((l) => l());
  }
}

export const commandRegistry = new CommandRegistry();
