#!/usr/bin/env node
/**
 * Extract the public API of every library component into JSON for the site.
 *
 * The props tables on the site are generated from the component sources at
 * build time, so a prop that is renamed, removed or newly documented shows up
 * on the site the moment it changes. Nothing here is hand-maintained.
 *
 * This reads TypeScript as text rather than through the compiler API. That is
 * a deliberate trade: it keeps the site free of a `typescript` build step, and
 * the library's own interfaces are written in a plain, consistent style. If a
 * component ever needs a genuinely complex prop type, prefer extracting a named
 * type for it — which reads better in the docs anyway.
 *
 * Usage: node website/scripts/generate-api.mjs
 */

import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const COMPONENTS = join(ROOT, 'src', 'components');
const OUT = join(HERE, '..', 'src', 'generated', 'api.json');

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

/** Strip comment markers and leading asterisks from a JSDoc block. */
const cleanDoc = (raw) =>
  raw
    .replace(/^\s*\/\*\*/, '')
    .replace(/\*\/\s*$/, '')
    .split('\n')
    .map((line) => line.replace(/^\s*\*ic?\s?/, '').replace(/^\s*\*\s?/, ''))
    .join('\n')
    .trim();

/** Split a JSDoc body into its description and any `@example` block. */
const splitDoc = (doc) => {
  const exampleAt = doc.indexOf('@example');
  if (exampleAt === -1) return { description: doc.trim(), example: null };

  const description = doc.slice(0, exampleAt).trim();
  const example = doc
    .slice(exampleAt + '@example'.length)
    .replace(/^\s*```t?sx?\s*\n?/, '')
    .replace(/```\s*$/, '')
    .trim();
  return { description, example };
};

/**
 * Find the body of `export interface <Name> ... { ... }` by brace matching, so
 * nested object types inside props don't truncate the capture.
 */
const interfaceBody = (source, name) => {
  const header = new RegExp(`export\\s+interface\\s+${name}\\b[^{]*\\{`);
  const match = header.exec(source);
  if (!match) return null;

  let depth = 1;
  let i = match.index + match[0].length;
  const start = i;

  while (i < source.length && depth > 0) {
    const ch = source[i];
    if (ch === '{') depth += 1;
    else if (ch === '}') depth -= 1;
    i += 1;
  }
  return depth === 0 ? source.slice(start, i - 1) : null;
};

/** Names of interfaces this one extends, so inherited props can be merged. */
const interfaceExtends = (source, name) => {
  const m = new RegExp(`export\\s+interface\\s+${name}\\b([^{]*)\\{`).exec(source);
  if (!m || !/extends/.test(m[1])) return [];
  return m[1]
    .replace(/.*extends/, '')
    .split(',')
    .map((s) => s.trim().replace(/<.*>$/, ''))
    .filter(Boolean);
};

/**
 * Parse one interface body into props.
 *
 * Walks member by member at brace depth 0, pairing each member with the JSDoc
 * block immediately preceding it.
 */
const parseProps = (body) => {
  const props = [];
  let pendingDoc = null;
  let i = 0;

  const readBlockComment = () => {
    const end = body.indexOf('*/', i);
    if (end === -1) return false;
    pendingDoc = cleanDoc(body.slice(i, end + 2));
    i = end + 2;
    return true;
  };

  while (i < body.length) {
    const ch = body[i];

    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (body.startsWith('/**', i)) {
      readBlockComment();
      continue;
    }
    if (body.startsWith('/*', i)) {
      const end = body.indexOf('*/', i);
      i = end === -1 ? body.length : end + 2;
      continue;
    }
    if (body.startsWith('//', i)) {
      const end = body.indexOf('\n', i);
      i = end === -1 ? body.length : end + 1;
      continue;
    }

    // A member runs to the `;` or newline at depth 0.
    let depth = 0;
    let j = i;
    while (j < body.length) {
      const c = body[j];
      if (c === '{' || c === '(' || c === '[' || c === '<') depth += 1;
      else if (c === '}' || c === ')' || c === ']' || c === '>') depth -= 1;
      else if ((c === ';' || c === '\n') && depth <= 0) break;
      j += 1;
    }

    const member = body.slice(i, j).trim();
    i = j + 1;
    if (!member) {
      continue;
    }

    const nameMatch = /^(?:readonly\s+)?(\[[^\]]+\]|'[^']+'|"[^"]+"|[A-Za-z_$][\w$]*)(\?)?\s*:\s*([\s\S]+)$/.exec(
      member,
    );
    if (!nameMatch) {
      pendingDoc = null;
      continue;
    }

    const [, rawName, optional, rawType] = nameMatch;
    const doc = pendingDoc ? splitDoc(pendingDoc) : { description: '', example: null };
    pendingDoc = null;

    // "Defaults to `x`." in the prose is the canonical default in this codebase.
    const defaultMatch = /Defaults? to `([^`]+)`/i.exec(doc.description);

    props.push({
      name: rawName.replace(/^['"]|['"]$/g, ''),
      required: !optional,
      type: rawType.replace(/\s+/g, ' ').trim(),
      description: doc.description,
      default: defaultMatch ? defaultMatch[1] : null,
    });
  }

  return props;
};

/** The JSDoc block immediately preceding `export const <Name> =`. */
const componentDoc = (source, name) => {
  const decl = new RegExp(`export\\s+const\\s+${name}\\b`).exec(source);
  if (!decl) return { description: '', example: null };

  const before = source.slice(0, decl.index);
  const open = before.lastIndexOf('/**');
  const close = before.lastIndexOf('*/');
  if (open === -1 || close < open) return { description: '', example: null };

  // Only adopt the comment if nothing but whitespace separates it.
  if (before.slice(close + 2).trim() !== '') return { description: '', example: null };

  return splitDoc(cleanDoc(before.slice(open, close + 2)));
};

const files = walk(COMPONENTS).filter(
  (f) => f.endsWith('.tsx') && !f.includes('.stories.') && !f.includes('__tests__'),
);

// Index every source so `extends` can be resolved across files.
const sources = new Map(files.map((f) => [f, readFileSync(f, 'utf8')]));

const findInterface = (name) => {
  for (const [file, src] of sources) {
    const body = interfaceBody(src, name);
    if (body) return { file, src, body };
  }
  return null;
};

const collectProps = (file, src, propsName, seen = new Set()) => {
  if (seen.has(propsName)) return [];
  seen.add(propsName);

  const body = interfaceBody(src, propsName);
  if (!body) {
    const found = findInterface(propsName);
    if (!found) return [];
    return collectProps(found.file, found.src, propsName, seen);
  }

  const own = parseProps(body);
  const inherited = interfaceExtends(src, propsName).flatMap((parent) => {
    const found = findInterface(parent);
    return found ? collectProps(found.file, found.src, parent, seen) : [];
  });

  // Own declarations win over inherited ones of the same name.
  const byName = new Map(inherited.map((p) => [p.name, p]));
  own.forEach((p) => byName.set(p.name, p));
  return [...byName.values()];
};

const components = [];

for (const [file, src] of sources) {
  const name = basename(file, '.tsx');
  const propsName = `${name}Props`;
  if (!new RegExp(`export\\s+(interface|type)\\s+${propsName}\\b`).test(src)) continue;

  const doc = componentDoc(src, name);
  components.push({
    name,
    file: relative(ROOT, file).replace(/\\/g, '/'),
    description: doc.description,
    example: doc.example,
    props: collectProps(file, src, propsName).sort((a, b) => {
      if (a.required !== b.required) return a.required ? -1 : 1;
      return a.name.localeCompare(b.name);
    }),
  });
}

components.sort((a, b) => a.name.localeCompare(b.name));

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify({ components }, null, 2)}\n`);

const propCount = components.reduce((n, c) => n + c.props.length, 0);
const undocumented = components.flatMap((c) =>
  c.props.filter((p) => !p.description).map((p) => `${c.name}.${p.name}`),
);

console.log(`generate-api: ${components.length} components, ${propCount} props → ${relative(ROOT, OUT)}`);
if (undocumented.length) {
  console.warn(`generate-api: ${undocumented.length} undocumented props: ${undocumented.join(', ')}`);
}
