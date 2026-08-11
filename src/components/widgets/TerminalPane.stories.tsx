import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TerminalPane } from './TerminalPane';

const meta = {
  title: 'Primitives/TerminalPane',
  component: TerminalPane,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A bottom-docked terminal: a scrolling output log over a single-line input. It owns only the in-progress input — it does not echo commands or interpret them, so `clear`, `help` and anything app-specific stay yours. See `ConnectedTerminalPane` for the variant bound to `useTerminalStore` with `clear` and `help` built in.',
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
