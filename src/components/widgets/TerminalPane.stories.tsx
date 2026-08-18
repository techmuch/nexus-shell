import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TerminalPane } from './TerminalPane';
import { SidebarPane } from './SidebarPane';
import { PaneHostProvider } from '../layout/PaneHost';

const meta = {
  title: 'Primitives/TerminalPane',
  component: TerminalPane,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A terminal: a scrolling output log over a single-line input. It owns only the in-progress input — it does not echo commands or interpret them, so `clear`, `help` and anything app-specific stay yours.\n\n**It fills whatever hosts it.** Register it as a side panel with `terminalPanel()`, or as a dockable tab; inside a host that draws a title bar it omits its own header and fixed height. Standalone it keeps both. See `ConnectedTerminalPane` for the variant bound to `useTerminalStore`.',
      },
    },
  },
} satisfies Meta<typeof TerminalPane>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    history: [
      'Welcome to Nexus Shell Terminal v0.1.0',
      'Type "help" for a list of commands.',
    ],
  },
};

/** A fresh terminal with nothing written yet. */
export const Empty: Story = {
  args: { history: [] },
};

/** Type a command and press Enter. This story implements `clear` and `echo` itself. */
export const Interactive: Story = {
  args: {},
  render: function Render() {
    const [history, setHistory] = useState<string[]>([
      'Try: help, echo hello, clear',
    ]);

    const run = (command: string) => {
      const [verb, ...args] = command.split(/\s+/);
      if (verb === 'clear') return setHistory([]);

      const output =
        verb === 'help'
          ? 'Available: help, echo, clear'
          : verb === 'echo'
            ? args.join(' ')
            : `command not found: ${verb}`;

      setHistory((h) => [...h, `$ ${command}`, output]);
    };

    return <TerminalPane history={history} onCommand={run} onClose={() => {}} />;
  },
};

/** Long output scrolls and pins to the bottom as lines arrive. */
export const LongOutput: Story = {
  args: {
    history: Array.from({ length: 60 }, (_, i) =>
      i % 3 === 0 ? `$ step ${i / 3}` : `  processed module-${i}.ts`,
    ),
  },
};

/** Omitting `onClose` hides the header buttons; `prompt` and `title` are overridable. */
export const CustomPrompt: Story = {
  args: {
    title: 'Python',
    prompt: '>>>',
    height: '200px',
    history: ['Python 3.12.0', 'Type "help", "copyright", "credits" or "license".'],
  },
};

/**
 * The same terminal in a side pane.
 *
 * `SidebarPane` draws the title bar and owns the size, so the terminal drops
 * its own header and its 250px default rather than leaving a dead gap.
 */
export const InASidePane: Story = {
  render: () => (
    <div className="flex h-[420px] bg-background">
      <div className="grid flex-1 place-items-center text-xs text-muted-foreground">
        workspace
      </div>
      <SidebarPane title="Terminal" side="right" width="360px" onClose={() => {}}>
        <TerminalPane history={['$ npm test', '363 passed']} />
      </SidebarPane>
    </div>
  ),
};

/**
 * And as a dockable tab. The tab strip is the title bar, so again there is only
 * one — `PaneHostProvider` is what the shell's tab factory uses to say so.
 */
export const InATab: Story = {
  render: () => (
    <div className="h-[420px] bg-background p-4">
      <div className="flex h-full flex-col overflow-hidden rounded-md border border-border">
        <div className="flex shrink-0 items-center gap-2 border-b border-border bg-muted px-3 py-1.5 text-[11px]">
          <span className="rounded bg-background px-2 py-1 font-medium">Terminal</span>
          <span className="text-muted-foreground">App.tsx</span>
        </div>
        <div className="min-h-0 flex-1">
          <PaneHostProvider chrome placement="tab">
            <TerminalPane history={['$ git status', 'nothing to commit']} />
          </PaneHostProvider>
        </div>
      </div>
    </div>
  ),
};
