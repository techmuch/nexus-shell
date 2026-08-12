import { describe, expect, it } from 'vitest';
import {
  getPath,
  readValue,
  readValues,
  setPath,
  writeValue,
  writeValues,
} from '../properties';

/**
 * The two things a property panel has to get right before any input is
 * rendered: writing a nested value without mutating, and deciding what a
 * selection with disagreeing values should show.
 */

interface Node {
  id: string;
  kind?: string;
  data?: { label?: string; tags?: string[]; meta?: { owner?: string } };
}

const node = (id: string, data: Node['data'] = {}, kind?: string): Node => ({
  id,
  kind,
  data,
});

describe('getPath', () => {
  it('reads a shallow key', () => {
    expect(getPath(node('a'), 'id')).toBe('a');
  });

  it('reads a nested path', () => {
    expect(getPath(node('a', { label: 'Hello' }), 'data.label')).toBe('Hello');
    expect(getPath(node('a', { meta: { owner: 'ada' } }), 'data.meta.owner')).toBe('ada');
  });

  it('returns undefined for a missing path rather than throwing', () => {
    // A panel routinely renders objects that lack a field entirely.
    expect(getPath(node('a'), 'data.label')).toBeUndefined();
    expect(getPath(node('a'), 'data.meta.owner')).toBeUndefined();
    expect(getPath(node('a'), 'nope.deeply.missing')).toBeUndefined();
  });

  it('handles null and undefined subjects', () => {
    expect(getPath(null, 'anything')).toBeUndefined();
    expect(getPath(undefined, 'a.b')).toBeUndefined();
  });
});

describe('setPath', () => {
  it('sets a shallow key', () => {
    expect(setPath(node('a'), 'kind', 'idea').kind).toBe('idea');
  });

  it('sets a nested path', () => {
    const result = setPath(node('a', { label: 'Old' }), 'data.label', 'New');
    expect(result.data?.label).toBe('New');
  });

  it('does not mutate the original, at any depth', () => {
    const original = node('a', { label: 'Old', meta: { owner: 'ada' } });
    const originalData = original.data;

    const result = setPath(original, 'data.meta.owner', 'alan');

    expect(original.data?.meta?.owner).toBe('ada');
    // Every object on the path is a new reference, so React sees the change.
    expect(result.data).not.toBe(originalData);
    expect(result.data?.meta).not.toBe(originalData?.meta);
  });

  it('preserves siblings along the path', () => {
    const original = node('a', { label: 'Keep', tags: ['x'] });
    const result = setPath(original, 'data.meta.owner', 'ada');

    expect(result.data?.label).toBe('Keep');
    expect(result.data?.tags).toEqual(['x']);
    expect(result.id).toBe('a');
  });

  it('creates missing intermediate objects', () => {
    const result = setPath(node('a'), 'data.meta.owner', 'ada');
    expect(result.data?.meta?.owner).toBe('ada');
  });

  it('replaces a non-object intermediate rather than losing the write', () => {
    // Spreading a primitive would produce `{}` and drop the value silently.
    const odd = { id: 'a', data: 5 } as unknown as Node;
    const result = setPath(odd, 'data.label', 'Hello');
    expect(result.data?.label).toBe('Hello');
  });

  it('handles an undefined subject', () => {
    expect(setPath(undefined, 'a.b', 1)).toEqual({ a: { b: 1 } });
  });
});

describe('readValues across a selection', () => {
  const label = { key: 'data.label' };

  it('is empty and not mixed for no subjects', () => {
    expect(readValues([], label)).toEqual({ value: undefined, mixed: false });
  });

  it('is the value for one subject', () => {
    expect(readValues([node('a', { label: 'One' })], label)).toEqual({
      value: 'One',
      mixed: false,
    });
  });

  it('is the shared value when subjects agree', () => {
    const subjects = [node('a', { label: 'Same' }), node('b', { label: 'Same' })];
    expect(readValues(subjects, label)).toEqual({ value: 'Same', mixed: false });
  });

  it('is mixed, with no value, when subjects disagree', () => {
    const subjects = [node('a', { label: 'One' }), node('b', { label: 'Two' })];
    const result = readValues(subjects, label);

    expect(result.mixed).toBe(true);
    // Crucially, no value: showing one subject's is how a multi-edit flattens.
    expect(result.value).toBeUndefined();
  });

  it('treats a missing value as a value, so present vs absent reads as mixed', () => {
    const subjects = [node('a', { label: 'One' }), node('b')];
    expect(readValues(subjects, label).mixed).toBe(true);
  });

  it('agrees when every subject is missing the property', () => {
    expect(readValues([node('a'), node('b')], label)).toEqual({
      value: undefined,
      mixed: false,
    });
  });

  it('compares by identity, so equal-looking objects read as mixed', () => {
    const subjects = [node('a', { tags: ['x'] }), node('b', { tags: ['x'] })];
    // The panel cannot know whether deep equality is meaningful for an
    // arbitrary payload, and claiming agreement it hasn't verified is worse.
    expect(readValues(subjects, { key: 'data.tags' }).mixed).toBe(true);
  });

  it('honours a custom getter', () => {
    const subjects = [node('a'), node('b')];
    const upper = { key: 'id', get: (n: Node) => n.id.toUpperCase() };
    expect(readValues(subjects, upper).mixed).toBe(true);
    expect(readValue(subjects[0], upper)).toBe('A');
  });
});

describe('writeValues across a selection', () => {
  const label = { key: 'data.label' };

  it('applies the value to every subject', () => {
    const subjects = [node('a', { label: 'One' }), node('b', { label: 'Two' })];
    const result = writeValues(subjects, label, 'Both');

    expect(result.map((n) => n.data?.label)).toEqual(['Both', 'Both']);
  });

  it('leaves the originals untouched', () => {
    const subjects = [node('a', { label: 'One' })];
    writeValues(subjects, label, 'Changed');
    expect(subjects[0].data?.label).toBe('One');
  });

  it('returns unchanged subjects by identity', () => {
    const subjects = [node('a', { label: 'Same' }), node('b', { label: 'Other' })];
    const result = writeValues(subjects, label, 'Same');

    // 'a' already held the value, so an edit across a large selection only
    // invalidates what actually moved.
    expect(result[0]).toBe(subjects[0]);
    expect(result[1]).not.toBe(subjects[1]);
  });

  it('honours a custom setter', () => {
    const accessor = {
      key: 'id',
      set: (n: Node, value: unknown) => ({ ...n, id: `${value}!` }),
    };
    expect(writeValue(node('a'), accessor, 'b').id).toBe('b!');
  });

  it('handles an empty selection', () => {
    expect(writeValues([], label, 'x')).toEqual([]);
  });
});
