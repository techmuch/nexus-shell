#!/usr/bin/env node
/**
 * Guard the published stylesheets. Run after `npm run build`.
 *
 * - Every rule in style.css is inside a `nexus.*` cascade layer. A single
 *   unlayered rule beats every layered rule in the consumer's app, which is
 *   the bug layering exists to fix — and Tailwind will happily emit one (it
 *   appends variants at the end unless told otherwise).
 * - style.no-reset.css exists and contains no reset layer.
 * - The JavaScript bundles import no CSS, which would land unlayered and
 *   break consumers' test runners.
 */
import { readFileSync, existsSync } from 'node:fs';

const fail = (msg) => {
  console.error(`check-css: ${msg}`);
  process.exit(1);
};

const css = readFileSync('dist/style.css', 'utf8');

const unlayered = (source) => {
  let out = '';
  let i = 0;
  while (i < source.length) {
    const m = source.slice(i).match(/^@layer [^{;]*\{/);
    if (m) {
      let depth = 0;
      let j = i + m[0].length - 1;
      for (; j < source.length; j += 1) {
        if (source[j] === '{') depth += 1;
        else if (source[j] === '}' && --depth === 0) break;
      }
      i = j + 1;
      continue;
    }
    out += source[i];
    i += 1;
  }
  return out
    .replace(/@layer [^;{]*;/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim();
};

const stray = unlayered(css);
if (stray) fail(`unlayered CSS in dist/style.css: ${stray.slice(0, 200)}…`);
if (!css.startsWith('@layer nexus.reset,')) fail('dist/style.css must open with the nexus layer order statement');

if (!existsSync('dist/style.no-reset.css')) fail('dist/style.no-reset.css missing');
const noReset = readFileSync('dist/style.no-reset.css', 'utf8');
if (/@layer nexus\.reset\s*\{/.test(noReset)) fail('style.no-reset.css still contains the reset layer');
if (unlayered(noReset)) fail('unlayered CSS in dist/style.no-reset.css');

for (const bundle of ['dist/nexus-shell.es.js', 'dist/nexus-shell.umd.js']) {
  const js = readFileSync(bundle, 'utf8');
  if (/import\s*["'][^"']+\.css["']|require\(["'][^"']+\.css["']\)/.test(js)) {
    fail(`${bundle} imports CSS`);
  }
}

console.log('check-css: style.css fully layered; no-reset variant ok; no CSS imports in JS');
