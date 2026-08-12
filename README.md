# Nexus Shell

React components for building IDE-style application shells — menu bar, activity
bar, sidebar, docking layout, terminal, chat pane and status bar.

**[Documentation and live examples →](https://techmuch.github.io/nexus-shell/)** ·
[Storybook](https://techmuch.github.io/nexus-shell/storybook/)

```bash
npm install nexus-shell
```

```ts
import 'nexus-shell/style.css';
```

React 19 is a peer dependency.

## Start with the shell

An application built on this library starts with `ShellLayout` and grows by
registering features into it.

```tsx
// main.tsx — a complete application
import { createRoot } from 'react-dom/client';
import { Boxes, Files } from 'lucide-react';
import {
  AppTitle,
  ShellLayout,
  componentRegistry,
  initializeShell,
  useLayoutStore,
} from 'nexus-shell';
import 'nexus-shell/style.css';

// Views register by id, so the shell never has to import them.
componentRegistry.register('editor', Editor);

initializeShell({
  panels: [{ id: 'files', label: 'Explorer', icon: Files, component: FileExplorer }],
  commands: [
    { id: 'file.save', label: 'File: Save', keybinding: 'Control+s', execute: save },
  ],
  menus: { File: [{ id: 'save', label: 'Save', commandId: 'file.save' }] },
  statusBar: [{ id: 'branch', label: 'main', alignment: 'left' }],
});

useLayoutStore.getState().addTab('editor', 'App.tsx');

createRoot(document.getElementById('root')!).render(
  <ShellLayout title={<AppTitle title="Acme Studio" icon={<Boxes size={16} />} />} />,
);
```

That is a working IDE: dockable tabs, a command palette on `Cmd/Ctrl+Shift+P`, a
terminal, a chat pane, and a themable frame.

## Growing an app

You add capability by **registering** it. None of this changes the layout, which
is what lets plugins and distant code contribute to the shell.

| To add | Do this |
| :-- | :-- |
| A view or tab | `componentRegistry.register(id, Component)`, then `useLayoutStore().addTab(id, title)` |
| An action or hotkey | `commandRegistry.registerCommand({ id, label, keybinding, execute })` — appears in the palette automatically |
| A menu entry | `menuRegistry.registerMenu('File', { id, label, commandId })` |
| A sidebar panel | Add it to `panels`; it becomes an activity bar icon |
| A status bar item | `useStatusBarStore.getState().addWidget(...)` |
| A dialog from anywhere | `await useModalStore.getState().openConfirm('Sure?')` |
| An unsaved-changes guard | `useLayoutStore.getState().setTabDirty(tabId, true)` |

## When you need less than the shell

Every component the shell is assembled from is exported on its own — pure and
prop-driven, with no global state or registry lookups. This is the escape hatch:
reach for it when you're embedding one piece into an app you already have, or
building a frame `ShellLayout` can't express.

```tsx
import { ActivityBar, SidebarPane, StatusBar, TreeWidget } from 'nexus-shell';

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
        <TreeWidget data={nodes} onToggle={toggle} onActivate={open} />
      </SidebarPane>
    )}
    <main className="flex-1">{children}</main>
  </div>
  <StatusBar widgets={[{ id: 'branch', label: 'main', alignment: 'left' }]} />
</div>;
```

These are controlled, so state stays in your app — a real cost the shell was
absorbing for you.

Between the two sit the `Connected*` variants, each binding one component to its
store. `ShellLayout` is built entirely out of them, so you can rearrange the
shell's own frame and keep every registration working.

## Components

`ShellLayout` assembles all of these. Each is also exported on its own.

| Component | What it is |
| :-- | :-- |
| `ActivityBar` | Vertical icon rail for switching sidebar panels |
| `ChatPane` | Docked chat transcript with slash-command autocomplete |
| `CommandPalette` | Filterable, keyboard-navigable command list |
| `ContextMenu` | Floating menu positioned at viewport coordinates |
| `DataGrid` | Sortable, filterable table with optional virtualisation |
| `MenuBar` | Application menu bar with submenus and content slots |
| `Modal` | Alert / confirm / prompt dialog |
| `QuickSearch` | Compact search field with grouped results, for the menu bar |
| `SearchWidget` | Full-height search panel with autocomplete, for the sidebar |
| `SettingsPanel` | Theme picker body for the settings sidebar |
| `SidebarPane` | Titled, closable container for sidebar content |
| `StatusBar` | Footer with left / center / right item groups |
| `TerminalPane` | Bottom-docked terminal log and input |
| `ThemeSwitcher` | Segmented theme control |
| `TreeWidget` | Virtualised tree for any hierarchy, with drag-to-move and a data-driven menu |
| `GraphCanvas` | Infinite pannable, zoomable field for node-and-edge editing |
| `GraphNode` | Positioned, focusable node with edge ports |
| `GraphEdge` | Directed edge with bezier / smoothstep / straight routing |
| `GraphMiniMap` | Scaled graph overview with a viewport indicator |
| `NodePalette` | Drag-to-create and keyboard-to-create node types |
| `useGraphKeyboard` | Spatial keyboard navigation and editing for a graph |
| `useGraphLayout` | Auto layout engines, with a freeform escape for hand placement |
| `layeredLayout` | Layered tree layout in four directions; handles cycles |
| `gridLayout` | Uniform grid, ignoring edges |
| `PropertyPanel` | Inspector for the current selection, with mixed-value editing |
| `TextField` … `StaticField` | Nine composable property fields, usable on their own |
| `FieldShell` | The label / description / error frame, for fields of your own |
| `UserProfile` | Avatar and identity widget |

## Theming

Four themes ship in the stylesheet: `theme-light`, `theme-dark`, `theme-gt`
(Georgia Tech) and `theme-tamu` (Texas A&M).
Colors are CSS custom properties scoped to those classes, so switching themes is
a class on an ancestor — no React context, no provider.

Add your own by defining a `.theme-yourname` block with the same properties.

## Development

```bash
npm install

npm run site           # documentation site at :5173
npm run storybook      # component workbench at :6006
npm run dev            # showcase app at :5173

npm run typecheck      # library sources
npm test               # vitest — unit and architecture tests
npm run site:test      # renders every site route and demo
npm run build          # library build to dist/
npm run build-storybook
npm run site:build     # documentation site to website/dist/
npm run e2e            # Playwright against the showcase app
```

`npm run typecheck` covers `src/` only. To include the examples:

```bash
npx tsc --noEmit -p tsconfig.examples.json
```

CI runs all of the above on every push and pull request.

### Layout

```
src/
  components/       Pure, prop-driven components — what the shell is made of
  connected/        Store-bound wrappers used by ShellLayout
  core/             Stores (zustand), registries, and initializeShell
  lib/              Shared utilities
  stories/          MDX documentation pages
examples/
  showcase/         Demo apps built on the library — not published
    dialogue-mapper/
    mockup-reviewer/
    wiki/
    wargame/
    e2e/            Playwright specs for the showcase app
  basic-app/        Minimal integration example
website/
  src/demos/        Live examples — the source shown on the site
  src/content/      The component gallery, as data
  scripts/          Generates the props tables from the library's types
```

### Documentation site

`website/` is a Vite app that imports the library from `../src`, not from
`dist`. Every example on the site is rendered by the current source, so a demo
that no longer compiles against the real API fails the build rather than
quietly documenting an API that no longer exists.

Two generation steps keep it honest:

- **Props tables** come from `website/scripts/generate-api.mjs`, which parses
  the component sources for prop names, types, defaults and JSDoc. Nothing is
  hand-written.
- **Code samples** are extracted from the demo files by `#region` marker, so the
  snippet a visitor copies is provably the code that produced the thing they
  just interacted with.

Adding a component to the site is one entry in `website/src/content/components.ts`
plus a demo file. There is no per-component page to keep in sync.

The site ships no dependencies of its own — routing, syntax highlighting and the
copy button are all local, so the docs can't drag the repo's install surface
around.

**Deployment.** `.github/workflows/deploy-pages.yml` builds the site and
Storybook on every push to `main` and publishes them as one Pages artifact — the
site at the root, Storybook under `/storybook/`. First-time setup needs your
credentials: run `./scripts/setup-pages.sh`.

The split between `components/` and `connected/` is the load-bearing one. A
component that reads a global store can't be configured by its caller, rendered
twice with different data, or documented — its props table is empty because it
has no props. Everything in `components/` is therefore forbidden from importing
`core/services`, and the tests in `components/__tests__` exist to keep it that
way.

Anything under `examples/` is a consumer of the library, not part of it. It's
built and documented alongside the components to prove the primitives are
sufficient, but it ships to nobody.

## License

MIT
