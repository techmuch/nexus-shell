import { ICommand } from '../../core/registry/CommandRegistry';

interface CommandPaletteProps {
    commands?: ICommand[];
    forcedOpen?: boolean;
}
export declare const CommandPalette: ({ commands: customCommands, forcedOpen }: CommandPaletteProps) => import("react/jsx-runtime").JSX.Element | null;
export {};
