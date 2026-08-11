/**
 * Demo source extraction.
 *
 * Every demo on this site is a real component in `src/demos/*.tsx`. The page
 * renders the component and displays its source, both taken from the same
 * file — so the snippet a visitor copies is provably the code that produced
 * the thing they just interacted with. There is no second copy to fall out of
 * date.
 *
 * Demos mark their own boundaries:
 *
 * ```tsx
 * // #region basic
 * export const Basic = () => <StatusBar widgets={[…]} />;
 * // #endregion
 * ```
 */

const DEMO_MODULES = import.meta.glob('../demos/*.tsx', { eager: true }) as Record<
  string,
  Record<string, React.ComponentType>
>;

const DEMO_SOURCES = import.meta.glob('../demos/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const fileKey = (path: string) => path.replace(/^.*\/demos\//, '').replace(/\.tsx$/, '');

const byName = <T,>(record: Record<string, T>): Record<string, T> =>
  Object.fromEntries(Object.entries(record).map(([path, v]) => [fileKey(path), v]));

const modules = byName(DEMO_MODULES);
const sources = byName(DEMO_SOURCES);

export const demoModule = (file: string): Record<string, React.ComponentType> =>
  modules[file] ?? {};

/** Trim the common leading indentation so extracted blocks start at column 0. */
const dedent = (text: string): string => {
  const lines = text.split('\n');
  const indents = lines
    .filter((l) => l.trim().length > 0)
    .map((l) => l.match(/^[ \t]*/)?.[0].length ?? 0);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(min)).join('\n');
};

/**
 * Pull one `#region`-delimited block out of a demo file.
 *
 * Returns a clear placeholder rather than throwing if the region is missing —
 * a typo in a region name should not blank the page, and the placeholder makes
 * the mistake obvious in review.
 */
export const demoSource = (file: string, region: string): string => {
  const raw = sources[file];
  if (!raw) return `// demo file not found: ${file}.tsx`;

  const pattern = new RegExp(
    `//\\s*#region\\s+${region}\\s*\\n([\\s\\S]*?)\\n\\s*//\\s*#endregion`,
    'm',
  );
  const match = pattern.exec(raw);
  if (!match) return `// region not found: ${region} in ${file}.tsx`;

  return dedent(match[1]).trim();
};

/**
 * The import line a consumer needs for a demo, derived from the demo file's
 * own imports so it lists exactly the symbols in play.
 */
export const demoImports = (file: string): string => {
  const raw = sources[file];
  if (!raw) return '';
  const lines = raw.split('\n').filter((l) => /^import .*from '(nexus-shell|lucide-react)'/.test(l));
  return lines.join('\n');
};
