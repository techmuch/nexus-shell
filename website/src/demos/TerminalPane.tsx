import { useState } from 'react';
import { PaneHostProvider, SidebarPane, TerminalPane } from 'nexus-shell';

// #region basic
export const Basic = () => {
  const [history, setHistory] = useState<string[]>([
    'Welcome to Nexus Shell Terminal v0.1.0',
    'Try: help, echo hello, clear',
  ]);

  /**
   * The component neither echoes the command nor interprets it — it just
   * reports the text. Command semantics stay entirely in your hands.
   */
  const run = (command: string) => {
    const [verb, ...args] = command.split(/\s+/);

    if (verb === 'clear') {
      setHistory([]);
      return;
    }

    const output =
      verb === 'help'
        ? 'Available: help, echo, clear'
        : verb === 'echo'
          ? args.join(' ')
          : `command not found: ${verb}`;

    setHistory((current) => [...current, `$ ${command}`, output]);
  };

  return <TerminalPane history={history} onCommand={run} onClose={() => {}} height="100%" />;
};
// #endregion

// #region customPrompt
export const CustomPrompt = () => {
  const [history, setHistory] = useState<string[]>([
    'Python 3.12.0',
    'Type "help", "copyright", "credits" or "license".',
  ]);

  return (
    <TerminalPane
      title="Python"
      prompt=">>>"
      height="100%"
      history={history}
      onCommand={(command) =>
        setHistory((current) => [...current, `>>> ${command}`, `'${command}'`])
      }
    />
  );
};
// #endregion

// #region hosted
export const Hosted = () => (
  <div className="flex h-full bg-background">
    {/* In a tab: the tab strip is the title bar, so the terminal omits its own
        and fills the height instead of forcing 250px. */}
    <div className="flex min-w-0 flex-1 flex-col border-r border-border">
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

    {/* And in a side pane, which does the same thing for you. */}
    <SidebarPane title="Terminal" side="right" width="300px" onClose={() => {}}>
      <TerminalPane history={['$ npm test', '363 passed']} />
    </SidebarPane>
  </div>
);
// #endregion
