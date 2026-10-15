#!/usr/bin/env node
/**
 * Derive the published stylesheet variants from dist/style.css.
 *
 *   style.css           everything, in `nexus.*` cascade layers (the default)
 *   style.no-reset.css  the same without the `nexus.reset` layer (Tailwind's
 *                       preflight), for apps that bring their own reset
 *
 * The reset is removed by finding the `@layer nexus.reset{…}` block that
 * src/index.css's `@import … layer(nexus.reset)` compiles to, and cutting it
 * out with brace matching. Fails loudly if the block is not found, so a
 * change to how the CSS is built cannot silently ship a variant that still
 * contains the reset.
 *
 * Run after `vite build`.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const SOURCE = 'dist/style.css';
const css = readFileSync(SOURCE, 'utf8');

const marker = /@layer nexus\.reset\s*\{/;
const match = marker.exec(css);
if (!match) {
  console.error(`build-css-variants: no "@layer nexus.reset {" block in ${SOURCE}`);
  process.exit(1);
}

let depth = 0;
let end = -1;
for (let i = match.index + match[0].length - 1; i < css.length; i += 1) {
  if (css[i] === '{') depth += 1;
  else if (css[i] === '}') {
    depth -= 1;
    if (depth === 0) {
      end = i + 1;
      break;
    }
  }
}
if (end < 0) {
  console.error('build-css-variants: unbalanced braces in the nexus.reset block');
  process.exit(1);
}

const noReset = css.slice(0, match.index) + css.slice(end);
if (marker.test(noReset)) {
  console.error('build-css-variants: more than one nexus.reset block');
  process.exit(1);
}
writeFileSync('dist/style.no-reset.css', noReset);
console.log(
  `build-css-variants: style.no-reset.css (${(noReset.length / 1024).toFixed(1)} kB, reset removed: ${((end - match.index) / 1024).toFixed(1)} kB)`,
);
