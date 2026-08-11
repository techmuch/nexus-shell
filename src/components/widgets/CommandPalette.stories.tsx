import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CommandPalette, type ICommandItem } from './CommandPalette';

const COMMANDS: ICommandItem[] = [
  { id: 'file.new', label: 'File: New File', keybinding: '⌘N' },
  { id: 'file.save', label: 'File: Save', keybinding: '⌘S' },
  { id: 'file.saveAll', label: 'File: Save All', keybinding: '⌥⌘S' },
  { id: 'view.terminal', label: 'View: Toggle Terminal', keybinding: '⌃`' },
  { id: 'view.sidebar', label: 'View: Toggle Sidebar', keybinding: '⌘B' },
  { id: 'theme.select', label: 'Preferences: Color Theme', keybinding: '⌘K ⌘T' },
  { id: 'git.commit', label: 'Git: Commit' },
  { id: 'git.push', label: 'Git: Push' },
];

const meta = {
  title: 'Primitives/CommandPalette',
  component: CommandPalette,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A VS Code-style command palette. Fully controlled — it owns only the query and the highlighted row, and binds no global keyboard shortcut. Arrow keys navigate, Enter selects, Escape closes. See `ConnectedCommandPalette` for the variant that reads the `commandRegistry` and binds `Cmd/Ctrl+Shift+P`.\n\nThese stories use `inline` so the palette renders in place rather than as a fullscreen overlay.',
      },
    },
  },
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { open: true, inline: true, commands: COMMANDS, onSelect: () => {} },
};

/** With no commands registered the palette explains itself rather than showing a blank list. */
export const NoCommands: Story = {
  args: { open: true, inline: true, commands: [], onSelect: () => {} },
};

/** Type to filter, Enter to pick. The chosen command is echoed below. */
export const Interactive: Story = {
  args: { open: true, inline: true, commands: COMMANDS, onSelect: () => {} },
  render: function Render(args) {
    const [chosen, setChosen] = useState<string | null>(null);
    return (
      <div className="flex flex-col items-center gap-4 w-[36rem]">
        <CommandPalette {...args} onSelect={(cmd) => setChosen(cmd.label)} />
        <p className="text-xs text-muted-foreground">
          {chosen ? `Ran: ${chosen}` : 'Nothing run yet.'}
        </p>
      </div>
    );
  },
};

/** Toggle a real overlay palette, the way it appears in an app. */
export const AsOverlay: Story = {
  args: { open: false, commands: COMMANDS, onSelect: () => {} },
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-8">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground"
        >
          Open command palette
        </button>
        <CommandPalette
          {...args}
          open={open}
          onSelect={() => setOpen(false)}
          onClose={() => setOpen(false)}
        />
      </div>
    );
  },
};

/** Swap in your own matcher — here, a strict prefix match on the label. */
export const CustomFilter: Story = {
  args: {
    open: true,
    inline: true,
    commands: COMMANDS,
    onSelect: () => {},
    filter: (command, query) =>
      command.label.toLowerCase().startsWith(query.toLowerCase()),
  },
};
