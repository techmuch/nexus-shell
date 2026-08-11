import { useMemo } from 'react';
import { StatusBar, type StatusBarProps } from '../components/widgets/StatusBar';
import { useStatusBarStore } from '../core/services/StatusBarService';
import { commandRegistry } from '../core/registry/CommandRegistry';

export type ConnectedStatusBarProps = Omit<StatusBarProps, 'widgets'>;

/**
 * {@link StatusBar} bound to `useStatusBarStore`.
 *
 * Reads items from the shell store and resolves each item's `commandId`
 * against the {@link commandRegistry}, so store-registered items can trigger
 * commands without holding a function reference. An explicit `onClick` on the
 * item takes precedence over its `commandId`.
 *
 * Use this inside a shell; use the plain {@link StatusBar} when you want to
 * supply items yourself.
 */
export const ConnectedStatusBar = (props: ConnectedStatusBarProps) => {
  const widgets = useStatusBarStore((s) => s.widgets);

  const resolved = useMemo(
    () =>
      widgets.map(({ commandId, ...widget }) => ({
        ...widget,
        onClick:
          widget.onClick ??
          (commandId ? () => commandRegistry.executeCommand(commandId) : undefined),
      })),
    [widgets],
  );

  return <StatusBar {...props} widgets={resolved} />;
};
