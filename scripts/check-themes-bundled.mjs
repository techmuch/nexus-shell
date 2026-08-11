#!/usr/bin/env node
/**
 * Assert every registered theme survived into the built stylesheet.
 *
 * Theme blocks sit outside `@layer base` because Tailwind tree-shakes unused
 * rules within a layer, and a theme class is only ever applied at runtime
 * (`theme-${id}`) — so nothing in the content globs references it literally.
 * Move one back inside a layer and it vanishes from `dist/style.css` while
 * every test still passes, which is exactly the kind of failure worth a
 * dedicated check.
 *
 * Run after `npm run build`.
 */
import { readFileSync } from 'node:fs';

const REGISTRY = 'src/lib/themes.ts';
const STYLESHEET = 'dist/style.css';

const ids = [...readFileSync(REGISTRY, 'utf8').matchAll(/^\s*id: '([^']+)'/gm)].map(
  (m) => m[1],
);

if (ids.length === 0) {
  console.error(`check-themes: found no theme ids in ${REGISTRY}`);
  process.exit(1);
}

const css = readFileSync(STYLESHEET, 'utf8');
const missing = ids.filter((id) => !css.includes(`.theme-${id}{`));

if (missing.length > 0) {
  console.error(
    `check-themes: missing from ${STYLESHEET}: ${missing.join(', ')}\n` +
      'Theme blocks must stay outside @layer base or Tailwind will drop them.',
  );
  process.exit(1);
}

console.log(`check-themes: all ${ids.length} themes present in ${STYLESHEET}`);
