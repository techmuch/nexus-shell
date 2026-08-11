import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BUNDLED_THEMES, BUNDLED_THEME_CLASSES, themeClass } from '../themes';

/**
 * Every bundled theme is checked against the stylesheet and against WCAG.
 *
 * A theme is easy to add and easy to get subtly wrong: a missing token falls
 * back to whatever the previous theme set, and a low-contrast pair is invisible
 * to the person who chose the colours but not to everyone else.
 */

const CSS = readFileSync(join(process.cwd(), 'src/index.css'), 'utf8');

/** Every custom property the components actually read. */
const REQUIRED_TOKENS = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'border',
  'input',
  'ring',
] as const;

/** Foreground/background pairs that must stay legible. */
const CONTRAST_PAIRS: [string, string][] = [
  ['background', 'foreground'],
  ['card', 'card-foreground'],
  ['popover', 'popover-foreground'],
  ['primary', 'primary-foreground'],
  ['secondary', 'secondary-foreground'],
  ['muted', 'muted-foreground'],
  ['accent', 'accent-foreground'],
  ['destructive', 'destructive-foreground'],
  // Muted text sits on the page background as often as on a muted surface.
  ['background', 'muted-foreground'],
];

/** Pull one `.theme-x { … }` block's custom properties out of the stylesheet. */
const readTheme = (id: string): Record<string, string> => {
  const match = new RegExp(`\\.theme-${id}\\s*\\{([\\s\\S]*?)\\n\\s*\\}`).exec(CSS);
  if (!match) return {};

  return Object.fromEntries(
    [...match[1].matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [
      name,
      value.trim(),
    ]),
  );
};

const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  const sat = s / 100;
  const lit = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(lit, 1 - lit);
  const f = (n: number) =>
    lit - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
};

/** Relative luminance, per WCAG 2.1. */
const luminance = ([r, g, b]: [number, number, number]) => {
  const channel = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const parseHsl = (value: string): [number, number, number] => {
  const [h, s, l] = value.split(/\s+/).map((v) => parseFloat(v));
  return [h, s, l];
};

const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(hslToRgb(...parseHsl(a))), luminance(hslToRgb(...parseHsl(b)))]
    .sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe('bundled themes', () => {
  it('exposes a class name per theme', () => {
    expect(BUNDLED_THEME_CLASSES).toEqual(BUNDLED_THEMES.map((t) => `theme-${t.id}`));
    expect(themeClass('solar')).toBe('theme-solar');
  });

  it('has unique ids and non-empty labels', () => {
    const ids = BUNDLED_THEMES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    BUNDLED_THEMES.forEach((theme) => {
      expect(theme.label.length, `${theme.id} label`).toBeGreaterThan(0);
      expect(theme.shortLabel.length, `${theme.id} shortLabel`).toBeGreaterThan(0);
      expect(theme.description.length, `${theme.id} description`).toBeGreaterThan(0);
    });
  });

  it.each(BUNDLED_THEMES.map((t) => [t.id] as const))(
    '.theme-%s exists in the stylesheet',
    (id) => {
      expect(Object.keys(readTheme(id)).length, `.theme-${id} block`).toBeGreaterThan(0);
    },
  );

  it.each(BUNDLED_THEMES.map((t) => [t.id] as const))(
    '.theme-%s defines every token the components read',
    (id) => {
      const tokens = readTheme(id);
      const missing = REQUIRED_TOKENS.filter((token) => !(token in tokens));
      expect(missing, `.theme-${id} is missing tokens`).toEqual([]);
    },
  );

  it.each(BUNDLED_THEMES.map((t) => [t.id] as const))(
    '.theme-%s meets WCAG AA on every foreground pair',
    (id) => {
      const tokens = readTheme(id);

      const failures = CONTRAST_PAIRS.filter(([bg, fg]) => tokens[bg] && tokens[fg])
        .map(([bg, fg]) => ({
          pair: `${bg}/${fg}`,
          ratio: contrast(tokens[bg], tokens[fg]),
        }))
        // 4.5:1 is AA for body text, which is what these tokens carry.
        .filter((r) => r.ratio < 4.5)
        .map((r) => `${r.pair} = ${r.ratio.toFixed(2)}:1`);

      expect(failures, `.theme-${id} contrast failures`).toEqual([]);
    },
  );
});
