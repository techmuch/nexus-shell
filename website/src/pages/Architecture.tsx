import { CodeBlock } from '@site/site/CodeBlock';
import { Callout, H2, H3, P, Paragraphs } from '@site/site/Prose';

const PURE = `// A primitive: everything it renders comes from props.
<StatusBar
  widgets={[{ id: 'branch', label: 'main', alignment: 'left', onClick: pick }]}
/>`;

const CONNECTED = `// The connected variant: same component, bound to a store.
export const ConnectedStatusBar = (props) => {
  const widgets = useStatusBarStore((s) => s.widgets);

  const resolved = widgets.map(({ commandId, ...widget }) => ({
    ...widget,
    onClick: widget.onClick ??
      (commandId ? () => commandRegistry.executeCommand(commandId) : undefined),
  }));

  return <StatusBar {...props} widgets={resolved} />;
};`;

const REGISTRY = `componentRegistry.register('editor', Editor);

Model.fromJson({
  layout: {
    type: 'row',
    children: [{
      type: 'tabset',
      // Names an id, not an import. The shell never sees your component.
      children: [{ type: 'tab', name: 'App.tsx', component: 'editor' }],
    }],
  },
});`;

const EXTENSION_BAD = `// Don't: a generic file tree should not know dialogue maps exist.
<TreeWidget onNewDialogueMap={createMap} />`;

const EXTENSION_GOOD = `// Do: contribute an entry to the data-driven menu.
<TreeWidget
  actions={[
    {
      id: 'new-map',
      label: 'New Dialogue Map',
      icon: <Map size={14} />,
      showFor: ['folder', 'background'],
      onSelect: (ctx) => createMap(ctx.nodeId),
    },
  ]}
/>`;

const TYPES = `// components/widgets/StatusBar.tsx — what the component renders
export interface IStatusBarWidget {
  id: string;
  label: string;
  alignment: 'left' | 'center' | 'right';
}

// core/services/StatusBarService.ts — what the store holds
export interface IStatusBarWidgetConfig extends IStatusBarWidget {
  commandId?: string;
}`;

export const Architecture = () => (
  <article>
    <header className="mb-10">
      <h1 className="text-3xl font-bold tracking-tight">Architecture</h1>
      <P className="mt-3">
        Why the library splits into two tiers, and how to decide which one you want.
      </P>
    </header>

    <H2 id="two-tiers">Two tiers</H2>
    <Paragraphs
      items={[
        'The public surface is deliberately split. **Primitives** are pure, prop-driven components with no global state — they are the supported API and what most integrations should reach for. **`ShellLayout`** is the assembled application frame, wired to a set of zustand stores and registries.',
        'Neither is more correct than the other. They answer different questions: *"I want a status bar in my app"* and *"I want an IDE."*',
      ]}
    />

    <div className="grid md:grid-cols-2 gap-4 mt-6">
      <div className="rounded-xl border border-border bg-card/40 p-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">
          Tier 1
        </p>
        <h3 className="font-semibold text-foreground">Primitives — you compose</h3>
        <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed">
          You own layout and state. Best when adopting one or two pieces into an app you
          already have, or when you want a shell that doesn’t look like VS Code.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card/40 p-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">
          Tier 2
        </p>
        <h3 className="font-semibold text-foreground">Shell — it composes</h3>
        <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed">
          You configure declaratively and adopt the shell’s state model. Best when you want
          the full frame and plugins that contribute to it.
        </p>
      </div>
    </div>

    <H2 id="why">Why the split exists</H2>
    <Paragraphs
      items={[
        'A component that reads a global store can’t be configured by its caller, can’t be rendered twice with different data, and can’t be tested without standing the store up.',
        'The visible symptom is documentation. A component with no props generates an empty props table — there is nothing to describe, because everything it does depends on state it fetched itself. Every table on this site is generated from real prop declarations; if a component were store-coupled, its page would be blank.',
      ]}
    />

    <div className="mt-6">
      <CodeBlock code={PURE} />
    </div>

    <H2 id="bridge">The bridge between them</H2>
    <P>
      Each primitive has a <code className="font-mono text-[14px]">Connected*</code>{' '}
      counterpart that binds it to the matching store.{' '}
      <code className="font-mono text-[14px]">ShellLayout</code> is built entirely out of
      these — it is not a separate implementation.
    </P>
    <div className="mt-4">
      <CodeBlock code={CONNECTED} />
    </div>
    <P className="mt-4">
      They are exported, so the tiers mix: take the assembled shell but swap one connected
      piece for a plain one you drive yourself.
    </P>

    <H2 id="registries">Registries and inversion of control</H2>
    <Paragraphs
      items={[
        'The shell tier uses three registries so it never imports the features it hosts. `componentRegistry` binds React components to id strings, `commandRegistry` holds executable actions, and `menuRegistry` holds menu structure.',
        'A tab in your layout model names a component id rather than an import:',
      ]}
    />
    <div className="mt-4">
      <CodeBlock code={REGISTRY} />
    </div>
    <Callout title="Primitives read no registry">
      <p>
        This applies to the shell tier only. If you’re composing primitives yourself, you
        never touch any of it — you pass menus as data and handle{' '}
        <code className="font-mono text-[13px]">onSelect</code>.
      </p>
    </Callout>

    <H2 id="types">Types that exist in two layers</H2>
    <P>
      Where a store needs fields the component doesn’t render — a{' '}
      <code className="font-mono text-[14px]">commandId</code> to dispatch, an{' '}
      <code className="font-mono text-[14px]">execute</code> handler — the presentational
      type lives in the component and the service extends it.
    </P>
    <div className="mt-4">
      <CodeBlock code={TYPES} />
    </div>
    <P className="mt-4">
      The connected wrapper resolves the extra field. This is why{' '}
      <code className="font-mono text-[14px]">MenuBar</code> takes{' '}
      <code className="font-mono text-[14px]">onSelect</code> while{' '}
      <code className="font-mono text-[14px]">ShellLayout</code> takes{' '}
      <code className="font-mono text-[14px]">commandId</code>.
    </P>

    <H2 id="extension">Extension points, not props</H2>
    <Paragraphs
      items={[
        'When an app needs a new command inside a component, the answer is a data-driven extension point rather than a new prop.',
        '`TreeWidget` once had an `onNewDialogueMap` prop. A generic file tree should not know that dialogue maps exist.',
      ]}
    />

    <div className="grid lg:grid-cols-2 gap-4 mt-5">
      <div>
        <H3>Before</H3>
        <CodeBlock code={EXTENSION_BAD} />
      </div>
      <div>
        <H3>After</H3>
        <CodeBlock code={EXTENSION_GOOD} />
      </div>
    </div>

    <P className="mt-5">
      If you find yourself adding a prop named after a feature, add an array entry instead.
    </P>

    <H2 id="enforcement">How this is kept true</H2>
    <Paragraphs
      items={[
        'The boundary is enforced by tests, not convention. `src/components/__tests__/architecture.test.ts` fails the build if anything under `src/components` imports from `core/services` or `core/registry`, or calls a zustand hook. `ShellLayout` is the single allowlisted exception, because composing connected components is its whole job.',
        'CI runs those tests on every push and pull request, so the split cannot quietly erode.',
      ]}
    />
  </article>
);
