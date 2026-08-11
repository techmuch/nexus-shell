import { useState } from 'react';
import { CommandPalette, type ICommandItem } from 'nexus-shell';

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

// #region inline
export const Inline = () => {
  const [ran, setRan] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* `inline` renders in place instead of as a fullscreen overlay. */}
      <CommandPalette
        open
        inline
        commands={COMMANDS}
        onSelect={(command) => setRan(command.label)}
      />
      <p className="text-[13px] text-muted-foreground">
        {ran ? `Ran: ${ran}` : 'Type to filter. ↑↓ to navigate, Enter to run.'}
      </p>
    </div>
  );
};
// #endregion

// #region overlay
export const Overlay = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground"
      >
        Open command palette
      </button>

      <CommandPalette
        open={open}
        commands={COMMANDS}
        onSelect={(command) => {
          console.log('run', command.id);
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    </div>
  );
};
// #endregion

// #region customFilter
export const CustomFilter = () => (
  <CommandPalette
    open
    inline
    commands={COMMANDS}
    onSelect={() => {}}
    // Swap in your own matcher — fuzzy, scored, or remote.
    filter={(command, query) => command.label.toLowerCase().startsWith(query.toLowerCase())}
  />
);
// #endregion
