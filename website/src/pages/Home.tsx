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

const SNIPPET = `import { ActivityBar, SidebarPane, StatusBar, TreeWidget } from 'nexus-shell';
import 'nexus-shell/style.css';

export const App = () => {
  const [active, setActive] = useState<string | null>('files');

  return (
    <div className="theme-dark flex h-screen flex-col">
      <div className="flex flex-1">
        <ActivityBar items={panels} activeId={active} onSelect={setActive} />
        {active && (
          <SidebarPane title="Explorer" onClose={() => setActive(null)}>
            <TreeWidget data={files} onToggle={toggle} />
          </SidebarPane>
        )}
        <main className="flex-1">{children}</main>
      </div>
      <StatusBar widgets={[{ id: 'branch', label: 'main', alignment: 'left' }]} />
    </div>
  );
};`;

const FEATURES = [
  {
    icon: Blocks,
    title: 'Pure and prop-driven',
    body: 'No global state, no registry lookups, no hidden singletons. Every component takes data as props and reports changes through callbacks, so it can be rendered twice with different data — and tested without standing anything up.',
  },
  {
    icon: Layers,
    title: 'Two tiers, your choice',
    body: 'Take the primitives and compose your own layout, or take ShellLayout and get the whole IDE frame wired to a set of stores. Connected wrappers bridge the two, so you can mix them.',
  },
  {
    icon: Feather,
    title: 'Six dependencies',
    body: 'The published package pulls in clsx, tailwind-merge, lucide-react, react-virtuoso, flexlayout-react and zustand — all externalised from the bundle, so you get one copy of each. 20 kB gzipped.',
  },
  {
    icon: ShieldCheck,
    title: 'Typed and documented',
    body: `Every one of the ${propCount} props carries a JSDoc comment explaining what it does and what it defaults to. The tables on this site are generated from those types, so they cannot drift.`,
  },
];

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div>
    <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
    <p className="text-[12px] text-muted-foreground mt-0.5">{label}</p>
  </div>
);

export const Home = () => (
  <div className="pb-8">
    {/* ------------------------------------------------------------- hero */}
    <section className="pt-14 pb-16 text-center max-w-3xl mx-auto px-2">
      <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/60 text-[12px] text-muted-foreground mb-6">
        <Terminal size={12} />
        React 19 · TypeScript · Tailwind
      </p>

      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-foreground">
        Components for building
        <br />
        <span className="text-primary">IDE-style applications</span>
      </h1>

      <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
        Menu bar, activity bar, sidebar, docking layout, terminal, chat pane and status
        bar. Use the whole shell, or take one piece into an app you already have.
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/docs/getting-started"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Get started <ArrowRight size={15} />
        </Link>
        <Link
          to="/components"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
        >
          <Blocks size={15} /> Browse components
        </Link>
      </div>

      <div className="mt-8 max-w-sm mx-auto text-left">
        <CodeBlock label="bash" code={QUICK_START} />
      </div>
    </section>

    {/* ------------------------------------------------------------ stats */}
    <section className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-8 border-y border-border text-center">
      <Stat value={String(COMPONENTS.length)} label="Components" />
      <Stat value={String(propCount)} label="Documented props" />
      <Stat value="20 kB" label="Gzipped" />
      <Stat value="6" label="Dependencies" />
    </section>

    {/* ------------------------------------------------------- live shell */}
    <section className="py-16">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight">This is the real thing</h2>
        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
          Not a screenshot. Drag the tabs to split the workspace, open a panel from the
          rail, run <code className="font-mono text-[13px]">help</code> in the terminal.
        </p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden shadow-2xl h-[560px] flex flex-col">
        <ShellDemo />
      </div>
    </section>

    {/* --------------------------------------------------------- features */}
    <section className="py-12">
      <div className="grid sm:grid-cols-2 gap-6">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-xl border border-border bg-card/40 p-6">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary grid place-items-center mb-4">
              <Icon size={17} />
            </div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ---------------------------------------------------------- snippet */}
    <section className="py-12">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Composable by default</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Primitives are controlled, so state stays in your app. That is what makes them
            reusable — a component that reads a global store can’t be configured by its
            caller, rendered twice, or meaningfully documented.
          </p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            If you would rather not wire it yourself, <code className="font-mono text-[13px]">ShellLayout</code>{' '}
            composes the whole frame against a set of stores, and every primitive has a{' '}
            <code className="font-mono text-[13px]">Connected*</code> counterpart you can
            mix in.
          </p>
          <Link
            to="/docs/architecture"
            className="inline-flex items-center gap-1.5 mt-5 text-sm text-primary hover:underline"
          >
            Read about the two tiers <ArrowRight size={14} />
          </Link>
        </div>

        <CodeBlock label="App.tsx" code={SNIPPET} />
      </div>
    </section>

    {/* ------------------------------------------------------------- next */}
    <section className="py-12">
      <div className="grid sm:grid-cols-3 gap-4">
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
            className="group rounded-xl border border-border bg-card/40 p-5 hover:border-primary/40 transition-colors"
          >
            <Icon size={17} className="text-primary mb-3" />
            <h3 className="font-semibold text-[15px] flex items-center gap-1.5">
              {title}
              <ArrowRight
                size={13}
                className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
              />
            </h3>
            <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">{body}</p>
          </Link>
        ))}

        <a
          href={`${__SITE_BASE__.replace(/\/$/, '')}/storybook/`}
          className="group rounded-xl border border-border bg-card/40 p-5 hover:border-primary/40 transition-colors"
        >
          <BookOpen size={17} className="text-primary mb-3" />
          <h3 className="font-semibold text-[15px] flex items-center gap-1.5">
            Storybook
            <ArrowRight
              size={13}
              className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
            />
          </h3>
          <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
            Every story and state, with interactive prop controls.
          </p>
        </a>
      </div>
    </section>
  </div>
);
