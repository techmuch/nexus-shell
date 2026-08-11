/**
 * A small TSX/bash syntax highlighter.
 *
 * The site ships no highlighting dependency. Shiki and Prism are both larger
 * than everything else on these pages combined, and the snippets here are
 * short and stylistically uniform — a single-pass tokenizer covers them.
 *
 * It is a tokenizer, not a parser: it will mis-colour pathological input. For
 * the curated snippets on this site that trade is worth several hundred
 * kilobytes.
 */

export type TokenKind =
  | 'plain'
  | 'comment'
  | 'string'
  | 'keyword'
  | 'number'
  | 'tag'
  | 'attr'
  | 'punctuation'
  | 'fn';

export interface Token {
  kind: TokenKind;
  value: string;
}

const KEYWORDS = new Set([
  'import', 'from', 'export', 'default', 'const', 'let', 'var', 'function',
  'return', 'if', 'else', 'for', 'while', 'new', 'type', 'interface', 'extends',
  'implements', 'class', 'async', 'await', 'typeof', 'keyof', 'as', 'in', 'of',
  'null', 'undefined', 'true', 'false', 'void', 'this', 'super', 'try', 'catch',
  'finally', 'throw', 'switch', 'case', 'break', 'continue', 'satisfies',
]);

/** Ordered — the first pattern that matches at the cursor wins. */
const RULES: { kind: TokenKind; re: RegExp }[] = [
  { kind: 'comment', re: /^\/\/[^\n]*/ },
  { kind: 'comment', re: /^\/\*[\s\S]*?\*\// },
  { kind: 'string', re: /^`(?:\\.|[^`\\])*`/ },
  { kind: 'string', re: /^'(?:\\.|[^'\\])*'/ },
  { kind: 'string', re: /^"(?:\\.|[^"\\])*"/ },
  { kind: 'number', re: /^\b\d+(?:\.\d+)?\b/ },
  // JSX tag names, including the closing slash and any dotted namespace.
  { kind: 'tag', re: /^<\/?[A-Za-z][\w.]*/ },
  { kind: 'tag', re: /^\/?>/ },
  // A word immediately followed by `(` reads as a call.
  { kind: 'fn', re: /^\b[A-Za-z_$][\w$]*(?=\()/ },
  // A word immediately followed by `=` inside a tag reads as an attribute.
  { kind: 'attr', re: /^\b[A-Za-z_$][\w$-]*(?==)/ },
  { kind: 'punctuation', re: /^[{}[\]().,;:=<>+\-*/%!?&|]+/ },
];

const WORD = /^[A-Za-z_$][\w$]*/;
const WHITESPACE = /^\s+/;

export const tokenize = (source: string): Token[] => {
  const tokens: Token[] = [];
  let rest = source;

  /** Merge adjacent same-kind tokens to keep the DOM small. */
  const push = (kind: TokenKind, value: string) => {
    const last = tokens[tokens.length - 1];
    if (last && last.kind === kind) last.value += value;
    else tokens.push({ kind, value });
  };

  while (rest.length > 0) {
    const ws = WHITESPACE.exec(rest);
    if (ws) {
      push('plain', ws[0]);
      rest = rest.slice(ws[0].length);
      continue;
    }

    const word = WORD.exec(rest);
    if (word && KEYWORDS.has(word[0])) {
      push('keyword', word[0]);
      rest = rest.slice(word[0].length);
      continue;
    }

    let matched = false;
    for (const rule of RULES) {
      const m = rule.re.exec(rest);
      if (!m) continue;
      push(rule.kind, m[0]);
      rest = rest.slice(m[0].length);
      matched = true;
      break;
    }
    if (matched) continue;

    if (word) {
      push('plain', word[0]);
      rest = rest.slice(word[0].length);
      continue;
    }

    push('plain', rest[0]);
    rest = rest.slice(1);
  }

  return tokens;
};

export const TOKEN_CLASS: Record<TokenKind, string> = {
  plain: 'text-foreground/85',
  comment: 'text-muted-foreground/60 italic',
  string: 'text-emerald-500 dark:text-emerald-400',
  keyword: 'text-violet-500 dark:text-violet-400',
  number: 'text-amber-600 dark:text-amber-400',
  tag: 'text-sky-600 dark:text-sky-400',
  attr: 'text-orange-600 dark:text-orange-400',
  punctuation: 'text-muted-foreground',
  fn: 'text-blue-600 dark:text-blue-400',
};
