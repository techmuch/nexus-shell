import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The boundary that makes this a library rather than an application.
 *
 * Components under `src/components` must render purely from their props. The
 * moment one reaches into a zustand store or a registry singleton, it stops
 * being configurable by its caller, stops being renderable twice with different
 * data, and stops being documentable — Storybook generates an empty props table
 * for a component with no props.
 *
 * Store wiring belongs in `src/connected`, which is what `ShellLayout` composes.
 */

const ROOT = process.cwd();
const COMPONENTS = join(ROOT, 'src/components');

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

/**
 * `ShellLayout` is the one sanctioned exception: it *is* the assembled shell,
 * so composing connected components and seeding the stores is its whole job.
 */
const EXEMPT = ['src/components/layout/ShellLayout.tsx'];

const sourceFiles = walk(COMPONENTS).filter(
  (f) =>
    /\.tsx?$/.test(f) &&
    !f.includes('.stories.') &&
    !f.includes('__tests__') &&
    !EXEMPT.some((e) => f.endsWith(e)),
);

const importsOf = (file: string): string[] =>
  [...readFileSync(file, 'utf8').matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);

/**
 * Comments legitimately mention stores — every component's JSDoc points at its
 * `Connected*` counterpart. Only actual code should be scanned.
 */
const codeOf = (file: string): string =>
  readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');

describe('component layer boundaries', () => {
  it('finds component sources to check', () => {
    expect(sourceFiles.length).toBeGreaterThan(10);
  });

  it.each(sourceFiles.map((f) => [relative(ROOT, f), f]))(
    '%s does not import a store or registry',
    (_name, file) => {
      const violations = importsOf(file).filter((spec) =>
        /core\/(services|registry)/.test(spec),
      );
      expect(violations).toEqual([]);
    },
  );

  it.each(sourceFiles.map((f) => [relative(ROOT, f), f]))(
    '%s does not import from the connected layer',
    (_name, file) => {
      const violations = importsOf(file).filter((spec) => /connected/.test(spec));
      expect(violations).toEqual([]);
    },
  );

  it('does not call zustand hooks or getState anywhere in the component layer', () => {
    const offenders = sourceFiles.filter((file) =>
      /\buse[A-Z]\w*Store\b|\.getState\(/.test(codeOf(file)),
    );
    expect(offenders.map((f) => relative(ROOT, f))).toEqual([]);
  });
});

describe('ShellLayout', () => {
  it('is the one place allowed to compose connected components', () => {
    const src = readFileSync(join(ROOT, 'src/components/layout/ShellLayout.tsx'), 'utf8');
    // It is the assembled shell, so it is expected to break the rule above.
    expect(src).toMatch(/connected\/Connected/);
  });
});
