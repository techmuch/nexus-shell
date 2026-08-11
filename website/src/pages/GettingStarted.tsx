import { CodeBlock } from '@site/site/CodeBlock';
import { Callout, H2, H3, P, Paragraphs, inline } from '@site/site/Prose';
import { Link } from '@site/lib/router';

const INSTALL = `npm install nexus-shell`;

const PEERS = `npm install react@^19 react-dom@^19`;

const ENTRY = `// main.tsx
import 'nexus-shell/style.css';`;

const THEME_HTML = `<html class="theme-dark">`;

const THEME_REACT = `const [theme, setTheme] = useState<'light' | 'dark' | 'gt'>('dark');

useEffect(() => {
  document.documentElement.className = \`theme-\${theme}\`;
}, [theme]);`;

const COMPOSE = `import { useState } from 'react';
import { Files, GitBranch, Search } from 'lucide-react';
import {
  ActivityBar,
  MenuBar,
  SidebarPane,
  StatusBar,
  ThemeSwitcher,
  TreeWidget,
  type ITreeNode,
} from 'nexus-shell';

const PANELS = [
  { id: 'files', label: 'Explorer', icon: Files },
  { id: 'search', label: 'Search', icon: Search },
];

export function App() {
  const [theme, setTheme] = useState('dark');
  const [active, setActive] = useState<string | null>('files');
  const [files, setFiles] = useState<ITreeNode[]>(initialFiles);

  return (
    <div className={\`theme-\${theme} flex h-screen flex-col bg-background text-foreground\`}>
      <MenuBar
        menus={{ File: [{ id: 'save', label: 'Save', keybinding: '⌘S' }] }}
        onSelect={(item) => run(item.id)}
        right={<ThemeSwitcher value={theme} onChange={setTheme} />}
      />

      <div className="flex flex-1 overflow-hidden">
        <ActivityBar
          items={PANELS}
          activeId={active}
          onSelect={(id) => setActive(id === active ? null : id)}
        />

        {active && (
          <SidebarPane title="Explorer" onClose={() => setActive(null)}>
            <TreeWidget
              data={files}
              onToggle={(node) => setFiles(toggle(files, node.id))}
              onActivate={(node) => open(node.id)}
            />
          </SidebarPane>
        )}

        <main className="flex-1 overflow-auto">{/* your editor */}</main>
      </div>

      <StatusBar
        widgets={[
          { id: 'branch', label: 'main', icon: GitBranch, alignment: 'left' },
          { id: 'pos', label: 'Ln 1, Col 1', alignment: 'right' },
        ]}
      />
    </div>
  );
}`;

const TOGGLE = `const toggle = (items: ITreeNode[], id: string): ITreeNode[] =>
  items.map((node) =>
    node.id === id
      ? { ...node, isOpen: !node.isOpen }
      : { ...node, children: node.children && toggle(node.children, id) },
  );`;

const SHELL = `import { ShellLayout, componentRegistry, commandRegistry } from 'nexus-shell';

// Tab contents resolve by id, so plugins can contribute views without
// the shell importing them.
componentRegistry.register('editor', Editor);

commandRegistry.registerCommand({
  id: 'file.save',
  label: 'File: Save',
  keybinding: '⌘S',
  execute: () => save(),
});

<ShellLayout
  title={<AppTitle title="Acme Studio" icon={<Boxes size={16} />} />}
  panels={[{ id: 'files', label: 'Explorer', icon: Files, component: FileExplorer }]}
  menuConfig={{ File: [{ id: 'save', label: 'Save', commandId: 'file.save' }] }}
  statusBarConfig={[{ id: 'branch', label: 'main', alignment: 'left' }]}
/>;`;

const MIX = `import { ConnectedStatusBar, useStatusBarStore } from 'nexus-shell';

// From anywhere — a plugin, an effect, a websocket handler:
useStatusBarStore.getState().addWidget({
  id: 'lint',
  label: '0 problems',
  alignment: 'left',
  commandId: 'view.problems',
});`;

const TAILWIND = `// tailwind.config.js
export default {
  content: [
    './src/**/*.{ts,tsx}',
    './node_modules/nexus-shell/dist/**/*.js',
  ],
};`;

export const GettingStarted = () => (
  <article>
    <header className="mb-10">
      <h1 className="text-3xl font-bold tracking-tight">Getting Started</h1>
      <P className="mt-3">
        Build a working shell from primitives, then swap in{' '}
        <code className="font-mono text-[14px]">ShellLayout</code> if you want the
        batteries-included version.
      </P>
    </header>

    <H2 id="install">1. Install</H2>
    <CodeBlock label="bash" code={INSTALL} />
    <P className="mt-4">
      React 19 is a peer dependency, so bring your own if the project doesn’t have it yet:
    </P>
    <div className="mt-3">
      <CodeBlock label="bash" code={PEERS} />
    </div>

    <P className="mt-6">
      Import the stylesheet once, in your entry file. It defines the design tokens every
      component reads — without it, components render unstyled.
    </P>
    <div className="mt-3">
      <CodeBlock code={ENTRY} />
    </div>

    <Callout title="Using Tailwind in your app?">
      <p>
        Add the package to your <code className="font-mono text-[13px]">content</code> globs
        so classes used inside the library aren’t purged.
      </p>
      <div className="mt-3">
        <CodeBlock label="tailwind.config.js" code={TAILWIND} />
      </div>
    </Callout>

    <H2 id="theme">2. Apply a theme</H2>
    <P>
      Colors live on CSS custom properties scoped to a theme class, so switching themes is
      a class on an ancestor — no context, no provider. Three ship in the stylesheet:{' '}
      <code className="font-mono text-[14px]">theme-light</code>,{' '}
      <code className="font-mono text-[14px]">theme-dark</code> and{' '}
      <code className="font-mono text-[14px]">theme-gt</code>.
    </P>
    <div className="mt-4">
      <CodeBlock label="index.html" code={THEME_HTML} />
    </div>
    <P className="mt-4">Or manage it from React:</P>
    <div className="mt-3">
      <CodeBlock code={THEME_REACT} />
    </div>

    <H2 id="compose">3. Compose a shell</H2>
    <P>
      Every primitive is controlled, so state stays in your app. Nothing here reaches into
      a store.
    </P>
    <div className="mt-4">
      <CodeBlock label="App.tsx" code={COMPOSE} />
    </div>

    <H3>The one piece of boilerplate</H3>
    <Paragraphs
      items={[
        '`TreeWidget` renders expansion from each node’s `isOpen` but does not own it. That keeps a single source of truth for your file data, at the cost of writing the toggle yourself:',
      ]}
    />
    <div className="mt-4">
      <CodeBlock code={TOGGLE} />
    </div>

    <H2 id="shell">4. Or use the assembled shell</H2>
    <P>
      If you want the docking layout, terminal and chat pane too,{' '}
      <code className="font-mono text-[14px]">ShellLayout</code> composes all of it against
      the shell stores.
    </P>
    <div className="mt-4">
      <CodeBlock code={SHELL} />
    </div>

    <Callout title="Note the difference">
      <p>
        {inline(
          'Primitives take `onSelect` handlers. The shell takes `commandId` strings it resolves against the registry. That indirection is what lets a plugin add a menu item without holding a function reference.',
        )}
      </p>
    </Callout>

    <H2 id="mixing">5. Mixing the two</H2>
    <P>
      The <code className="font-mono text-[14px]">Connected*</code> components are
      exported, so you can take the assembled shell and still drive one piece yourself — or
      take a primitive and bind it to a store.
    </P>
    <div className="mt-4">
      <CodeBlock code={MIX} />
    </div>

    <H2 id="next">Where next</H2>
    <div className="grid sm:grid-cols-2 gap-3 mt-4">
      <Link
        to="/components"
        className="rounded-xl border border-border p-4 hover:border-primary/40 transition-colors"
      >
        <p className="font-semibold text-[15px]">Component gallery</p>
        <p className="text-[13px] text-muted-foreground mt-1">
          Live examples and props tables for all of them.
        </p>
      </Link>
      <Link
        to="/docs/architecture"
        className="rounded-xl border border-border p-4 hover:border-primary/40 transition-colors"
      >
        <p className="font-semibold text-[15px]">Architecture</p>
        <p className="text-[13px] text-muted-foreground mt-1">
          Why the library splits into two tiers, and when to use each.
        </p>
      </Link>
    </div>
  </article>
);
