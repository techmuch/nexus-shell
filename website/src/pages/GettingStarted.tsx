import { CodeBlock } from '@site/site/CodeBlock';
import { Callout, H2, H3, P, Paragraphs, inline } from '@site/site/Prose';
import { Link } from '@site/lib/router';

const INSTALL = `npm install nexus-shell`;

const PEERS = `npm install react@^19 react-dom@^19`;

const ENTRY = `// main.tsx
import 'nexus-shell/style.css';`;

const THEME_HTML = `<html class="theme-dark">`;

const TAILWIND = `// tailwind.config.js
export default {
  content: [
    './src/**/*.{ts,tsx}',
    './node_modules/nexus-shell/dist/**/*.js',
  ],
};`;

const APP = `// main.tsx — a complete application
import { createRoot } from 'react-dom/client';
import { Boxes, Files, GitBranch } from 'lucide-react';
import {
  AppTitle,
  ShellLayout,
  componentRegistry,
  initializeShell,
  useLayoutStore,
} from 'nexus-shell';
import 'nexus-shell/style.css';

import { Editor } from './Editor';
import { FileExplorer } from './FileExplorer';

// Views are registered by id, so the shell never has to import them.
componentRegistry.register('editor', Editor);

initializeShell({
  panels: [{ id: 'files', label: 'Explorer', icon: Files, component: FileExplorer }],
  commands: [
    {
      id: 'file.save',
      label: 'File: Save',
      keybinding: 'Control+s',
      execute: () => save(),
    },
  ],
  menus: {
    File: [{ id: 'save', label: 'Save', commandId: 'file.save' }],
  },
  statusBar: [{ id: 'branch', label: 'main', icon: GitBranch, alignment: 'left' }],
});

// Open something on startup.
useLayoutStore.getState().addTab('editor', 'App.tsx');

createRoot(document.getElementById('root')!).render(
  <ShellLayout title={<AppTitle title="Acme Studio" icon={<Boxes size={16} />} />} />,
);`;

const ADD_VIEW = `componentRegistry.register('settings', SettingsView);

// Open it from a command, a menu entry, or on startup.
useLayoutStore.getState().addTab('settings', 'Settings');`;

const ADD_COMMAND = `commandRegistry.registerCommand({
  id: 'git.commit',
  label: 'Git: Commit',
  keybinding: 'Control+Enter',
  execute: () => commit(),
});

menuRegistry.registerMenu('Git', {
  id: 'git.commit',
  label: 'Commit',
  commandId: 'git.commit',
});`;

const ADD_STATUS = `useStatusBarStore.getState().addWidget({
  id: 'lint',
  label: '0 problems',
  alignment: 'left',
  commandId: 'view.problems',
});`;

const ADD_MODAL = `const confirmed = await useModalStore.getState().openConfirm('Discard changes?');`;

const DIRTY = `useLayoutStore.getState().setTabDirty(tabId, true);`;

const PRIMITIVES = `import { ActivityBar, SidebarPane, StatusBar, TreeWidget } from 'nexus-shell';

const [active, setActive] = useState<string | null>('files');

<div className="theme-dark flex h-screen flex-col">
  <div className="flex flex-1">
    <ActivityBar
      items={panels}
      activeId={active}
      onSelect={(id) => setActive(id === active ? null : id)}
    />
    {active && (
      <SidebarPane title="Explorer" onClose={() => setActive(null)}>
        <TreeWidget data={files} onToggle={toggle} />
      </SidebarPane>
    )}
    <main className="flex-1">{children}</main>
  </div>
  <StatusBar widgets={[{ id: 'branch', label: 'main', alignment: 'left' }]} />
</div>;`;

const TOGGLE = `const toggle = (items: ITreeNode[], id: string): ITreeNode[] =>
  items.map((node) =>
    node.id === id
      ? { ...node, isOpen: !node.isOpen }
      : { ...node, children: node.children && toggle(node.children, id) },
  );`;

const MIX = `import { ConnectedActivityBar, ConnectedStatusBar } from 'nexus-shell';

<div className="theme-dark flex h-screen flex-col">
  <div className="flex flex-1">
    <ConnectedActivityBar />
    <YourOwnSidebar />
    <main className="flex-1">{children}</main>
  </div>
  <ConnectedStatusBar />
</div>;`;

export const GettingStarted = () => (
  <article>
    <header className="mb-10">
      <h1 className="text-3xl font-bold tracking-tight">Getting Started</h1>
      <P className="mt-3">
        From an empty directory to a working IDE-style application, then growing it.
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
      component reads — without it, everything renders unstyled.
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

    <H2 id="shell">3. Render the shell</H2>
    <Paragraphs
      items={[
        'This is where an application starts. `initializeShell` registers your commands, menus and panels; `ShellLayout` renders the frame around them.',
        'The code below is a complete app — dockable tabs, a command palette on `Cmd/Ctrl+Shift+P`, a terminal, a chat pane and a themable frame.',
      ]}
    />
    <div className="mt-5">
      <CodeBlock label="main.tsx" code={APP} />
    </div>

    <Callout title="What you get for free">
      <p>
        {inline(
          '`initializeShell` also registers built-in commands — toggle terminal, toggle chat, toggle sidebar and the three themes — plus a default **View** menu. Pass `defaultCommands: false` to own every id yourself.',
        )}
      </p>
    </Callout>

    <H2 id="grow">4. Grow it</H2>
    <P>
      You add capability by <strong className="text-foreground">registering</strong> it.
      None of the following change the layout, which is what lets plugins and distant code
      contribute to the shell.
    </P>

    <H3>A new view</H3>
    <CodeBlock code={ADD_VIEW} />

    <H3>An action, with a hotkey and a menu entry</H3>
    <CodeBlock code={ADD_COMMAND} />
    <P className="mt-3">
      Registered commands appear in the command palette automatically.
    </P>

    <H3>A status bar item, from anywhere</H3>
    <CodeBlock code={ADD_STATUS} />

    <H3>A dialog, from outside React</H3>
    <CodeBlock code={ADD_MODAL} />

    <H3>An unsaved-changes guard</H3>
    <CodeBlock code={DIRTY} />
    <P className="mt-3">Closing that tab now prompts before discarding it.</P>

    <H2 id="less">5. When you need less than the shell</H2>
    <Paragraphs
      items={[
        'Every component the shell is built from is exported on its own, pure and prop-driven. Reach for them when you are embedding one piece into an app you already have, or need a frame `ShellLayout` cannot express.',
      ]}
    />
    <div className="mt-4">
      <CodeBlock label="App.tsx" code={PRIMITIVES} />
    </div>
    <P className="mt-4">
      These components are controlled, so state stays in your app. That is a real cost —
      the shell manages this state for you — which is why it’s the fallback rather than the
      default.
    </P>

    <H3>The one gotcha</H3>
    <Paragraphs
      items={[
        '`TreeWidget` renders expansion from each node’s `isOpen` but does not own it, so your file data stays the single source of truth. You write the toggle:',
      ]}
    />
    <div className="mt-4">
      <CodeBlock code={TOGGLE} />
    </div>

    <H2 id="mixing">6. Mixing the two</H2>
    <P>
      The <code className="font-mono text-[14px]">Connected*</code> components are exported,
      so you can rearrange the shell’s own parts while keeping its behaviour. These read the
      same stores <code className="font-mono text-[14px]">initializeShell</code> populates,
      so your registrations keep working.
    </P>
    <div className="mt-4">
      <CodeBlock code={MIX} />
    </div>

    <H2 id="next">Where next</H2>
    <div className="grid sm:grid-cols-2 gap-3 mt-4">
      <Link
        to="/components/shell-layout"
        className="rounded-xl border border-border p-4 hover:border-primary/40 transition-colors"
      >
        <p className="font-semibold text-[15px]">ShellLayout</p>
        <p className="text-[13px] text-muted-foreground mt-1">
          The frame you start from, running live.
        </p>
      </Link>
      <Link
        to="/docs/architecture"
        className="rounded-xl border border-border p-4 hover:border-primary/40 transition-colors"
      >
        <p className="font-semibold text-[15px]">Architecture</p>
        <p className="text-[13px] text-muted-foreground mt-1">
          How registration works, and when to drop below the shell.
        </p>
      </Link>
    </div>
  </article>
);
