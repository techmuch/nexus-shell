/**
 * Reading and writing property values across one or many subjects.
 *
 * The awkward parts of a property panel are not the inputs — they are knowing
 * what to show when several things are selected and their values disagree, and
 * writing a nested value back without mutating anything. Both live here, as
 * pure functions, so they can be tested without rendering.
 */

/** A value shared by every selected subject, or a marker that they differ. */
export interface IPropertyValue<T = unknown> {
  /** The common value, or `undefined` when subjects disagree or none are selected. */
  value: T | undefined;
  /**
   * Subjects hold different values for this property.
   *
   * A field showing `mixed` must not display one subject's value as if it were
   * everyone's — that is how a multi-selection edit silently flattens data.
   */
  mixed: boolean;
}

/**
 * Read a dot-separated path, e.g. `"data.label"`.
 *
 * Returns `undefined` for a missing path rather than throwing, because a
 * property panel routinely renders objects that don't have every field yet.
 */
export const getPath = (subject: unknown, path: string): unknown => {
  if (subject == null) return undefined;

  return path
    .split('.')
    .reduce<unknown>(
      (current, key) =>
        current == null ? undefined : (current as Record<string, unknown>)[key],
      subject,
    );
};

/**
 * Return a copy of `subject` with `path` set to `value`.
 *
 * Every object along the path is cloned, so the original is untouched and React
 * sees a new reference at each level it needs to. Missing intermediate objects
 * are created.
 */
export const setPath = <T>(subject: T, path: string, value: unknown): T => {
  const [key, ...rest] = path.split('.');
  if (key === undefined) return subject;

  const source = (subject ?? {}) as Record<string, unknown>;

  if (rest.length === 0) {
    return { ...source, [key]: value } as T;
  }

  const child = source[key];
  // Replace a non-object (or absent) intermediate rather than trying to spread
  // it — `{...5}` would silently produce `{}` and lose the write.
  const base = child != null && typeof child === 'object' ? child : {};

  return {
    ...source,
    [key]: setPath(base, rest.join('.'), value),
  } as T;
};

/** How a property is read from and written to a subject. */
export interface IPropertyAccessor<S = unknown, V = unknown> {
  /** Dot path, used for both reading and writing unless overridden. */
  key: string;
  /** Custom read. Defaults to `getPath(subject, key)`. */
  get?: (subject: S) => V;
  /** Custom write, returning a new subject. Defaults to `setPath`. */
  set?: (subject: S, value: V) => S;
}

/** Read a property from one subject, honouring a custom accessor. */
export const readValue = <S, V>(subject: S, accessor: IPropertyAccessor<S, V>): V =>
  accessor.get ? accessor.get(subject) : (getPath(subject, accessor.key) as V);

/** Write a property to one subject, honouring a custom accessor. */
export const writeValue = <S, V>(
  subject: S,
  accessor: IPropertyAccessor<S, V>,
  value: V,
): S => (accessor.set ? accessor.set(subject, value) : setPath(subject, accessor.key, value));

/**
 * Read a property across a selection.
 *
 * With one subject this is just its value. With several, it is the shared value
 * — or `mixed`, if they disagree. With none, it is empty and not mixed.
 *
 * Comparison is by `Object.is`, so two structurally equal objects at the same
 * path read as mixed. That is deliberate: a panel cannot know whether deep
 * equality is meaningful for an arbitrary payload, and claiming agreement it
 * hasn't verified is the more damaging error.
 */
export const readValues = <S, V>(
  subjects: S[],
  accessor: IPropertyAccessor<S, V>,
): IPropertyValue<V> => {
  if (subjects.length === 0) return { value: undefined, mixed: false };

  const first = readValue(subjects[0], accessor);
  const agree = subjects.every((subject) => Object.is(readValue(subject, accessor), first));

  return agree ? { value: first, mixed: false } : { value: undefined, mixed: true };
};

/**
 * Apply a value to every subject, returning new copies.
 *
 * Subjects that already hold the value are returned unchanged by identity, so
 * an edit across a large selection only invalidates what actually moved.
 */
export const writeValues = <S, V>(
  subjects: S[],
  accessor: IPropertyAccessor<S, V>,
  value: V,
): S[] =>
  subjects.map((subject) =>
    Object.is(readValue(subject, accessor), value)
      ? subject
      : writeValue(subject, accessor, value),
  );
