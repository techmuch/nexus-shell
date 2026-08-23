import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useChatStore, type ISlashCommandConfig } from '../ChatService';

/**
 * Slash commands are registered by components, so the store has to survive the
 * things components do: mounting twice under StrictMode, remounting on a route
 * change, and unmounting while the shell stays up.
 */

const command = (
  name: string,
  execute: ISlashCommandConfig['execute'] = () => {},
): ISlashCommandConfig => ({
  command: name,
  description: `the ${name} command`,
  execute,
});

beforeEach(() => {
  useChatStore.setState({ messages: [], slashCommands: [] });
});

describe('registerSlashCommand', () => {
  it('adds a command', () => {
    useChatStore.getState().registerSlashCommand(command('clear'));

    expect(useChatStore.getState().slashCommands.map((c) => c.command)).toEqual(['clear']);
  });

  it('does not duplicate on a second registration of the same command', () => {
    // React invokes effects twice in StrictMode, and again on every remount.
    useChatStore.getState().registerSlashCommand(command('clear'));
    useChatStore.getState().registerSlashCommand(command('clear'));

    expect(useChatStore.getState().slashCommands).toHaveLength(1);
  });

  it('lets the newest handler win', () => {
    const stale = vi.fn();
    const fresh = vi.fn();

    useChatStore.getState().registerSlashCommand(command('clear', stale));
    useChatStore.getState().registerSlashCommand(command('clear', fresh));

    useChatStore.getState().slashCommands[0].execute([]);
    expect(fresh).toHaveBeenCalledOnce();
    // The handler from the unmounted instance must not be the one left behind.
    expect(stale).not.toHaveBeenCalled();
  });

  it('replaces in place, so re-registering does not reorder the list', () => {
    useChatStore.getState().registerSlashCommand(command('alpha'));
    useChatStore.getState().registerSlashCommand(command('beta'));
    useChatStore.getState().registerSlashCommand(command('alpha'));

    expect(useChatStore.getState().slashCommands.map((c) => c.command)).toEqual([
      'alpha',
      'beta',
    ]);
  });
});

describe('unregisterSlashCommand', () => {
  it('removes a command so it stops being offered', () => {
    useChatStore.getState().registerSlashCommand(command('clear'));
    useChatStore.getState().registerSlashCommand(command('help'));

    useChatStore.getState().unregisterSlashCommand('clear');

    expect(useChatStore.getState().slashCommands.map((c) => c.command)).toEqual(['help']);
  });

  it('ignores an unknown command', () => {
    useChatStore.getState().registerSlashCommand(command('help'));

    expect(() => useChatStore.getState().unregisterSlashCommand('nope')).not.toThrow();
    expect(useChatStore.getState().slashCommands).toHaveLength(1);
  });

  it('completes a register/unregister cycle, leaving nothing behind', () => {
    // The mount/unmount round trip a component performs.
    useChatStore.getState().registerSlashCommand(command('clear'));
    useChatStore.getState().unregisterSlashCommand('clear');

    expect(useChatStore.getState().slashCommands).toEqual([]);
  });
});
