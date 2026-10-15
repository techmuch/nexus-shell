import { useEffect, useState, useSyncExternalStore } from 'react';

/**
 * One live instance per key, however many are mounted.
 *
 * `ShellLayout` mounts the modal host and the command palette itself, but
 * applications written against earlier releases mount them too. Two modal
 * hosts would draw every dialog twice; two palettes would both toggle on the
 * same keystroke. Each instance claims the key on mount; only the oldest
 * surviving claim renders, and when it unmounts the next one takes over.
 */
const claims = new Map<string, number[]>();
const listeners = new Set<() => void>();
let nextToken = 0;

const notify = () => listeners.forEach((l) => l());

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Whether this component instance is the live one for `key`. */
export const useSingleton = (key: string): boolean => {
  const [token] = useState(() => (nextToken += 1));

  useEffect(() => {
    const list = claims.get(key) ?? [];
    claims.set(key, [...list, token]);
    notify();
    return () => {
      const remaining = (claims.get(key) ?? []).filter((t) => t !== token);
      if (remaining.length) claims.set(key, remaining);
      else claims.delete(key);
      notify();
    };
  }, [key, token]);

  return useSyncExternalStore(
    subscribe,
    () => claims.get(key)?.[0] === token,
    () => false,
  );
};
