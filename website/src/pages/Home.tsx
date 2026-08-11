import {
  ArrowRight,
  Blocks,
  BookOpen,
  FileCode2,
  Feather,
  Layers,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { CodeBlock } from '@site/site/CodeBlock';
import { Link } from '@site/lib/router';
import { COMPONENTS } from '@site/content/components';
import { allApi } from '@site/site/PropsTable';
import { Full as ShellDemo } from '@site/demos/ShellLayout';

declare const __SITE_BASE__: string;

const propCount = allApi.reduce((n, c) => n + c.props.length, 0);

const QUICK_START = `npm install nexus-shell`;

const SNIPPET = `import { createRoot } from 'react-dom/client';
import { AppTitle, ShellLayout, componentRegistry, initializeShell } from 'nexus-shell';
import 'nexus-shell/style.css';

// Views register by id, so the shell never imports them.
componentRegistry.register('editor', Editor);

initializeShell({
  panels: [{ id: 'files', label: 'Explorer', icon: Files, component: FileTree }],
  commands: [{ id: 'file.save', label: 'File: Save', keybinding: 'Control+s', execute: save }],
  menus: { File: [{ id: 'save', label: 'Save', commandId: 'file.save' }] },
  statusBar: [{ id: 'branch', label: 'main', alignment: 'left' }],
});

createRoot(el).render(
  <ShellLayout title={<AppTitle title="Acme Studio" />} />,
);`;

const FEATURES = [
  {
    icon: Blocks,
    title: 'A working IDE in one component',
    body: 'ShellLayout is the whole frame — menus, activity bar, sidebar, dockable tabs, terminal, chat and status bar. Call initializeShell, render it, and you have an application to build on.',
  },
  {
    icon: Layers,
    title: 'Grow by registering, not restructuring',
    body: 'New views, commands, hotkeys, menu entries and status items all register themselves by id. The shell hosts features it never imports, which is what lets plugins and distant code contribute to it.',
  },
  {
    icon: Feather,
    title: 'Six dependencies',
    body: 'The published package pulls in clsx, tailwind-merge, lucide-react, react-virtuoso, flexlayout-react and zustand — all externalised from the bundle, so you get one copy of each. 20 kB gzipped.',
  },
  {
    icon: ShieldCheck,
    title: 'And you can drop below it',
    body: `Every component the shell is assembled from is exported, pure and prop-driven, with all ${propCount} props documented. Reach for them to embed one piece into an app you already have.`,
  },
];

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="p-4 rounded-xl border border-border/50 bg-card/30 backdrop-blur-xs flex flex-col items-center justify-center">
    <p className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">{value}</p>
    <p className="text-xs font-medium text-muted-foreground/80 mt-1">{label}</p>
  </div>
);

export const Home = () => (
  <div className="pb-16 space-y-16">
    {/* ------------------------------------------------------------- hero */}
    <section className="pt-16 pb-12 text-center max-w-4xl mx-auto px-4 relative">
      {/* Background glow circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <p className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-xs font-semibold text-primary mb-8 shadow-xs">
        <Terminal size={14} className="text-primary" />
        React 19 · TypeScript · Tailwind
      </p>

      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] text-foreground">
        Components for building{' '}
        <span className="bg-gradient-to-r from-primary via-indigo-400 to-sky-400 bg-clip-text text-transparent">
          IDE-style applications
        </span>
      </h1>

      <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-normal">
        Menu bar, activity bar, sidebar, docking layout, terminal, chat pane, and status bar. Use the full workspace shell or compose individual primitives directly.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/docs/getting-started"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/35 transition-all duration-200"
        >
          Get started <ArrowRight size={16} />
        </Link>
        <Link
          to="/components"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border/80 bg-card/50 text-sm font-semibold text-foreground hover:bg-accent/80 hover:border-primary/40 transition-all duration-200"
        >
          <Blocks size={16} className="text-primary" /> Browse components
        </Link>
      </div>

      <div className="mt-10 max-w-md mx-auto text-left shadow-lg rounded-xl overflow-hidden border border-border/60">
        <CodeBlock label="bash" code={QUICK_START} />
      </div>
    </section>

    {/* ------------------------------------------------------------ stats */}
    <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto px-4">
      <Stat value={String(COMPONENTS.length)} label="Components" />
      <Stat value={String(propCount)} label="Documented props" />
      <Stat value="20 kB" label="Gzipped" />
      <Stat value="6" label="Dependencies" />
    </section>

    {/* ------------------------------------------------------- live shell */}
    <section className="pt-4 max-w-5xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">This is the real thing</h2>
        <p className="mt-2.5 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Not a screenshot. Drag tabs to split the workspace, open panels from the rail, or run <code className="font-mono text-xs bg-muted/80 px-2 py-0.5 rounded border border-border text-foreground">help</code> in the terminal.
        </p>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md overflow-hidden shadow-2xl shadow-primary/5 flex flex-col theme-dark border-opacity-80">
        {/* IDE Window Title Bar */}
        <div className="h-9 bg-muted/40 border-b border-border/70 px-4 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
          </div>
          <span className="text-xs font-mono font-medium text-muted-foreground/80">nexus-shell workspace preview</span>
          <div className="w-12" />
        </div>

        <div className="h-[560px] flex flex-col bg-background text-foreground">
          <ShellDemo />
        </div>
      </div>
    </section>

    {/* --------------------------------------------------------- features */}
    <section className="max-w-5xl mx-auto px-4">
      <div className="grid sm:grid-cols-2 gap-6">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="group rounded-2xl border border-border/70 bg-card/40 backdrop-blur-xs p-7 hover:border-primary/50 hover:bg-card/70 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary grid place-items-center mb-5 group-hover:scale-105 transition-transform">
              <Icon size={20} />
            </div>
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ---------------------------------------------------------- snippet */}
    <section className="max-w-5xl mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">This is the whole app</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed text-sm sm:text-base">
            An application starts by rendering <code className="font-mono text-xs bg-muted/80 px-1.5 py-0.5 rounded border border-border text-foreground">ShellLayout</code> and grows by registering features into it. Views, commands, hotkeys, menu entries and status items all attach by id — the shell hosts them without importing them.
          </p>
          <p className="mt-3.5 text-muted-foreground leading-relaxed text-sm sm:text-base">
            Everything the shell is assembled from is exported too, pure and prop-driven. That is the escape hatch for embedding a single piece into an app you already have — not the way in.
          </p>
          <Link
            to="/docs/getting-started"
            className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Build one from scratch <ArrowRight size={16} />
          </Link>
        </div>

        <div className="shadow-xl rounded-xl overflow-hidden border border-border/70">
          <CodeBlock label="App.tsx" code={SNIPPET} />
        </div>
      </div>
    </section>

    {/* ------------------------------------------------------------- next */}
    <section className="max-w-5xl mx-auto px-4">
      <div className="grid sm:grid-cols-3 gap-5">
        {[
          {
            to: '/docs/getting-started',
            icon: FileCode2,
            title: 'Getting Started',
            body: 'Install, theme, and build a working shell in a few minutes.',
          },
          {
            to: '/components',
            icon: Blocks,
            title: 'Component gallery',
            body: 'Live examples and generated props tables for all of them.',
          },
        ].map(({ to, icon: Icon, title, body }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl border border-border/70 bg-card/40 backdrop-blur-xs p-6 hover:border-primary/50 hover:bg-card/70 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary grid place-items-center mb-4 group-hover:scale-105 transition-transform">
                <Icon size={18} />
              </div>
              <h3 className="font-bold text-base flex items-center justify-between text-foreground">
                {title}
                <ArrowRight
                  size={15}
                  className="text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all"
                />
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{body}</p>
            </div>
          </Link>
        ))}

        <a
          href={`${__SITE_BASE__.replace(/\/$/, '')}/storybook/`}
          className="group rounded-2xl border border-border/70 bg-card/40 backdrop-blur-xs p-6 hover:border-primary/50 hover:bg-card/70 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary grid place-items-center mb-4 group-hover:scale-105 transition-transform">
              <BookOpen size={18} />
            </div>
            <h3 className="font-bold text-base flex items-center justify-between text-foreground">
              Storybook
              <ArrowRight
                size={15}
                className="text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all"
              />
            </h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Every story and state, with interactive prop controls.
            </p>
          </div>
        </a>
      </div>
    </section>
  </div>
);

