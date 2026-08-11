import { useState } from 'react';
import { cn } from 'nexus-shell';
import { CodeBlock } from '@site/site/CodeBlock';
import { Callout, H2, P, Paragraphs } from '@site/site/Prose';

const APPLY = `<html class="theme-dark">`;

const CUSTOM = `/* your-theme.css — every token the components read */
.theme-solar {
  --background: 44 87% 94%;
  --foreground: 24 20% 18%;
  --card: 44 60% 97%;
  --card-foreground: 24 20% 18%;
  --popover: 44 60% 97%;
  --popover-foreground: 24 20% 18%;
  --primary: 18 80% 44%;
  --primary-foreground: 44 87% 97%;
  --secondary: 44 40% 88%;
  --secondary-foreground: 24 20% 18%;
  --muted: 44 40% 90%;
  --muted-foreground: 24 12% 42%;
  --accent: 44 45% 84%;
  --accent-foreground: 24 20% 18%;
  --destructive: 0 72% 45%;
  --destructive-foreground: 44 87% 97%;
  --border: 40 30% 82%;
  --input: 40 30% 82%;
  --ring: 18 80% 44%;
  --radius: 0.5rem;
}`;

const USE_CUSTOM = `<ThemeSwitcher
  value={theme}
  onChange={setTheme}
  options={[
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'solar', label: 'Solar' },
  ]}
/>`;

const SCOPED = `{/* Themes are just classes, so they nest. */}
<div className="theme-dark">
  <StatusBar widgets={widgets} />

  <div className="theme-light">
    <StatusBar widgets={widgets} />
  </div>
</div>`;

const TOKENS: { name: string; role: string }[] = [
  { name: '--background', role: 'Page background' },
  { name: '--foreground', role: 'Default text' },
  { name: '--card', role: 'Raised surfaces — panels, dialogs' },
  { name: '--card-foreground', role: 'Text on card surfaces' },
  { name: '--popover', role: 'Floating surfaces — menus, palettes' },
  { name: '--popover-foreground', role: 'Text on floating surfaces' },
  { name: '--primary', role: 'Accent — status bar, active items, buttons' },
  { name: '--primary-foreground', role: 'Text on the accent colour' },
  { name: '--secondary', role: 'Recessed controls — inputs, segmented groups' },
  { name: '--secondary-foreground', role: 'Text on secondary surfaces' },
  { name: '--muted', role: 'Sidebars, rails, inactive areas' },
  { name: '--muted-foreground', role: 'Secondary and label text' },
  { name: '--accent', role: 'Hover states' },
  { name: '--accent-foreground', role: 'Text on hover states' },
  { name: '--destructive', role: 'Errors and destructive actions' },
  { name: '--destructive-foreground', role: 'Text on destructive surfaces' },
  { name: '--border', role: 'All borders and dividers' },
  { name: '--input', role: 'Input borders' },
  { name: '--ring', role: 'Focus rings' },
  { name: '--radius', role: 'Base corner radius' },
];

const THEMES = ['light', 'dark', 'gt'] as const;

/** Renders the palette of a theme without changing the surrounding page. */
const Swatches = ({ theme }: { theme: string }) => (
  <div className={cn(`theme-${theme}`, 'rounded-xl border border-border overflow-hidden')}>
    <div className="bg-background p-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
        theme-{theme}
      </p>
      <div className="flex flex-wrap gap-2">
        {[
          ['bg-background border border-border', 'background'],
          ['bg-card border border-border', 'card'],
          ['bg-muted', 'muted'],
          ['bg-accent', 'accent'],
          ['bg-primary', 'primary'],
          ['bg-secondary', 'secondary'],
          ['bg-destructive', 'destructive'],
        ].map(([cls, label]) => (
          <div key={label} className="text-center">
            <div className={cn('w-14 h-10 rounded-md', cls)} />
            <p className="text-[9px] text-muted-foreground mt-1 font-mono">{label}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-foreground mt-4">
        Foreground text, <span className="text-muted-foreground">muted text</span>, and a{' '}
        <span className="text-primary font-medium">primary accent</span>.
      </p>
    </div>
  </div>
);

export const Theming = () => {
  const [preview, setPreview] = useState<string>('dark');

  return (
    <article>
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Theming</h1>
        <P className="mt-3">
          Colours are CSS custom properties scoped to a theme class. Switching themes is a
          class on an ancestor element — there is no React context and no provider to wire.
        </P>
      </header>

      <H2 id="applying">Applying a theme</H2>
      <P>
        Three themes ship in the stylesheet:{' '}
        <code className="font-mono text-[14px]">theme-light</code>,{' '}
        <code className="font-mono text-[14px]">theme-dark</code> and{' '}
        <code className="font-mono text-[14px]">theme-gt</code>. Put one on{' '}
        <code className="font-mono text-[14px]">&lt;html&gt;</code>, or on any wrapper.
      </P>
      <div className="mt-4">
        <CodeBlock label="index.html" code={APPLY} />
      </div>

      <Callout title="Portalled UI needs the class high up">
        <p>
          Modals, context menus and the command palette render as fixed-position overlays.
          Put the theme class on <code className="font-mono text-[13px]">&lt;html&gt;</code> or{' '}
          <code className="font-mono text-[13px]">&lt;body&gt;</code> so those pick it up too.
        </p>
      </Callout>

      <H2 id="bundled">The bundled themes</H2>
      <div className="flex items-center gap-1 mb-4 p-0.5 rounded-lg border border-border bg-secondary/60 w-fit">
        {THEMES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setPreview(t)}
            className={cn(
              'px-3 py-1 rounded-md text-[11px] font-medium transition-colors',
              preview === t
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <Swatches theme={preview} />

      <H2 id="tokens">Tokens</H2>
      <P>
        A theme is these twenty properties. Colours are space-separated HSL channels without
        the <code className="font-mono text-[14px]">hsl()</code> wrapper, which is what lets
        Tailwind apply opacity modifiers like{' '}
        <code className="font-mono text-[14px]">bg-primary/10</code>.
      </P>

      <div className="mt-5 rounded-xl border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Token
              </th>
              <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Role
              </th>
            </tr>
          </thead>
          <tbody>
            {TOKENS.map((token, i) => (
              <tr
                key={token.name}
                className={cn('border-b border-border/50 last:border-0', i % 2 === 1 && 'bg-muted/20')}
              >
                <td className="px-4 py-2.5">
                  <code className="font-mono text-[12px] text-sky-600 dark:text-sky-400">
                    {token.name}
                  </code>
                </td>
                <td className="px-4 py-2.5 text-[13px] text-muted-foreground">{token.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2 id="custom">Adding your own theme</H2>
      <P>
        Define a class with the same properties. Nothing needs to be registered — the
        components only ever read the variables.
      </P>
      <div className="mt-4">
        <CodeBlock label="your-theme.css" code={CUSTOM} />
      </div>
      <P className="mt-4">Then offer it in the switcher:</P>
      <div className="mt-3">
        <CodeBlock code={USE_CUSTOM} />
      </div>

      <H2 id="scoping">Scoped themes</H2>
      <Paragraphs
        items={[
          'Because a theme is a class rather than a context, themes nest. A dark shell with a light preview pane inside it is one extra `div`.',
        ]}
      />
      <div className="mt-4">
        <CodeBlock code={SCOPED} />
      </div>
      <P className="mt-4">
        The theme preview above this section works exactly this way — it renders a different
        theme inline without touching the page you’re reading.
      </P>
    </article>
  );
};
