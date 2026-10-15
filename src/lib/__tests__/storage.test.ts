import { afterEach, describe, expect, it, vi } from 'vitest';
import { readStored, readStoredJson, writeStored, STORAGE_KEYS } from '../storage';

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('storage', () => {
  it('round-trips values and removes on null', () => {
    writeStored('k', 'v');
    expect(readStored('k')).toBe('v');
    writeStored('k', null);
    expect(readStored('k')).toBeNull();
  });

  it('parses JSON and treats malformed JSON as absent', () => {
    writeStored('j', '{"a":1}');
    expect(readStoredJson('j')).toEqual({ a: 1 });
    writeStored('j', '{nope');
    expect(readStoredJson('j')).toBeNull();
  });

  it('survives storage that throws on access, as Safari private mode does', () => {
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(readStored('k')).toBeNull();
    expect(() => writeStored('k', 'v')).not.toThrow();
  });

  it('names every key the shell writes', () => {
    expect(Object.values(STORAGE_KEYS)).toEqual(
      expect.arrayContaining(['nexus-shell-layout', 'nexus-shell-theme', 'nexus-shell-user-profile']),
    );
  });
});
