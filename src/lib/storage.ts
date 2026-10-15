/**
 * `localStorage` access that survives having no `localStorage`.
 *
 * The shell's stores are created at module scope, so their initialisers run on
 * import — before any component renders, and in environments with no DOM at
 * all. Touching `localStorage` unguarded there throws and takes the whole
 * import down with it, which breaks server-side rendering and any test file
 * that has not set up jsdom.
 *
 * The try/catch is not redundant with the `typeof` check: Safari's private mode
 * and browsers with site data blocked expose `localStorage` but throw on
 * access. A failed read is "nothing stored"; a failed write costs the value its
 * persistence, never the caller its behaviour.
 */

/** The `localStorage` keys the shell itself writes. */
export const STORAGE_KEYS = {
  layout: 'nexus-shell-layout',
  theme: 'nexus-shell-theme',
  userProfile: 'nexus-shell-user-profile',
  leftPane: 'nexus-shell-pane-left',
  rightPane: 'nexus-shell-pane-right',
  bottomPane: 'nexus-shell-pane-bottom',
} as const;

const storage = (): Storage | null => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
};

/** Read a value, or `null` when it is absent or storage is unavailable. */
export const readStored = (key: string): string | null => {
  try {
    return storage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

/** Write a value. `null` removes the key. Never throws. */
export const writeStored = (key: string, value: string | null): void => {
  try {
    const s = storage();
    if (!s) return;
    if (value === null) s.removeItem(key);
    else s.setItem(key, value);
  } catch {
    // Storage is unavailable or full. The value still applies for this
    // session; it just will not be remembered across reloads.
  }
};

/** Read and parse a JSON value, or `null` when absent, unavailable or invalid. */
export const readStoredJson = <T = unknown>(key: string): T | null => {
  const raw = readStored(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};
