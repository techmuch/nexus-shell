import { TerminalPane, type TerminalPaneProps } from '../components/widgets/TerminalPane';
import { useTerminalStore } from '../core/services/TerminalService';

export type ConnectedTerminalPaneProps = Omit<
  TerminalPaneProps,
  'history' | 'onCommand' | 'onClose'
> & {
  /**
   * Handle a command the built-ins don't cover. Return `true` if you handled
   * it; return `false` or omit the handler to fall through to
   * "command not found".
   */
  onCommand?: (command: string) => boolean | void;
};

const BUILT_IN_HELP = [
  'Available commands:',
  '  help   — show this message',
  '  clear  — clear the terminal',
];

/**
 * {@link TerminalPane} bound to `useTerminalStore`.
 *
 * Renders nothing while the store reports the terminal closed. Echoes each
 * command into history and handles `help` and `clear` internally; anything else
 * is offered to `onCommand` before falling back to a not-found message.
 */
export const ConnectedTerminalPane = ({
  onCommand,
  ...props
}: ConnectedTerminalPaneProps) => {
  const isOpen = useTerminalStore((s) => s.isOpen);
  const history = useTerminalStore((s) => s.history);
  const setOpen = useTerminalStore((s) => s.setOpen);
  const addHistory = useTerminalStore((s) => s.addHistory);
  const clearHistory = useTerminalStore((s) => s.clearHistory);

  if (!isOpen) return null;

  const handleCommand = (command: string) => {
    addHistory(`$ ${command}`);
    const normalized = command.toLowerCase();

    if (normalized === 'clear') {
      clearHistory();
      return;
    }
    if (normalized === 'help') {
      BUILT_IN_HELP.forEach(addHistory);
      return;
    }
    if (onCommand?.(command) === true) return;

    addHistory(`command not found: ${command.split(' ')[0]}`);
  };

  return (
    <TerminalPane
      {...props}
      history={history}
      onCommand={handleCommand}
      onClose={() => setOpen(false)}
    />
  );
};
