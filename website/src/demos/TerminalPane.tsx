import { useState } from 'react';
import { TerminalPane } from 'nexus-shell';

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
