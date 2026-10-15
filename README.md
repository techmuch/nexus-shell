# Nexus Shell

React components for building IDE-style application shells — menu bar, activity
bar, sidebar, docking layout, terminal, chat pane and status bar.

**[Documentation and live examples →](https://techmuch.github.io/nexus-shell/)** ·
[Storybook](https://techmuch.github.io/nexus-shell/storybook/)

```bash
npm install nexus-shell zustand
```

```ts
import 'nexus-shell/style.css';
```

React 19 and zustand (4.5 or 5) are peer dependencies, so the shell shares your
app's copy of zustand rather than bundling a second one.

Upgrading from 0.2? See [CHANGELOG.md](./CHANGELOG.md#030) for the breaking
changes and how to adopt the new APIs.

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
  chatPanel,
  componentRegistry,
  initializeShell,
  terminalPanel,
  workspace,
} from 'nexus-shell';
import 'nexus-shell/style.css';

// Views register by id, so the shell never has to import them.
componentRegistry.register('editor', Editor);

initializeShell({
  panels: [
    { id: 'files', label: 'Explorer', icon: Files, component: FileExplorer },
    terminalPanel({ side: 'bottom' }),
    // Chat on the right rail, answered by your own backend. Nothing about it
    // is bound to one edge — or to being a panel at all.
    chatPanel({ side: 'right', onSend: async (text, chat) => chat.reply(await ask(text)) }),
  ],
  commands: [
    // `Mod` is Cmd on macOS and Ctrl elsewhere.
    { id: 'file.save', label: 'File: Save', keybinding: 'Mod+S', execute: save },
  ],
  menus: { File: [{ id: 'save', label: 'Save', commandId: 'file.save' }] },
  statusBar: [{ id: 'branch', label: 'main', alignment: 'left' }],
});

// Opens the editor, or brings it forward if it is already open.
workspace.open('editor', { title: 'App.tsx' });

createRoot(document.getElementById('root')!).render(
  <ShellLayout title={<AppTitle title="Acme Studio" icon={<Boxes size={16} />} />} />,
);
```

That is a working IDE: dockable tabs, a command palette on `Cmd/Ctrl+Shift+P`,
keyboard shortcuts, dialogs, a terminal, a chat pane, and a themable frame.
`ShellLayout` mounts the shortcut listener, modal host and palette itself.

## Where things go

The shell has four places a view can live, and nothing is nailed to one of
them. Chat and the terminal are ordinary registrations, so they go wherever you
put them — including into a dockable tab, alongside your own views.

| Place | How |
| :-- | :-- |
| Left rail | `panels: [...]` |
| Right rail | A panel with `side: 'right'` |
| Bottom drawer | A panel with `side: 'bottom'` |
| Dockable tab | `componentRegistry.register(id, Component)` + `workspace.open(id)` |
| Bottom of the workspace | A tab in the bottom row of your `initialLayoutJson` |

Anything hosted in a pane or a tab is told so, and drops its own title bar —
`SidebarPane` and the tab strip already draw one. Pass `chrome` explicitly to
force it either way.

## Growing an app

You add capability by **registering** it. None of this changes the layout, which
is what lets plugins and distant code contribute to the shell.

| To add | Do this |
| :-- | :-- |
| A view or tab | `componentRegistry.register(id, Component)`, then `workspace.open(id, { title })` |
| An action or hotkey | `commandRegistry.registerCommand({ id, label, keybinding, execute })`, or `useCommand(...)` from a component — appears in the palette automatically |
| A menu entry | `menuRegistry.contribute('File', [{ id, label, commandId }])` |
| A sidebar panel | Add it to `panels`; it becomes an activity bar icon |
| An inspector or properties panel | A panel with `side: 'right'`; it docks right, with its own rail |
| Chat or a terminal, anywhere | `chatPanel({ onSend })` / `terminalPanel()` with any `side`, or register the component as a tab |
| A status bar item | `useStatusBarStore.getState().addWidget(...)` |
| A dialog from anywhere | `await useModalStore.getState().openConfirm('Sure?')`, or `openCustom(close => <Form onSave={close} />, { title })` |
| An unsaved-changes guard | `useTab().setDirty(true)` inside the tab, or `useLayoutStore.getState().setTabDirty(tabId, true)` |

## Working with tabs

`workspace` is the docking area as an API, usable from anywhere — components,
commands, or code outside React. You never need FlexLayout's model or actions.

```ts
import { workspace } from 'nexus-shell';

workspace.open('desk');                                  // open, or focus the one already open
workspace.open('settings', { config: { section: 'system' } }); // re-open with new parameters
workspace.open('editor', { title: 'a.ts', reuseKey: 'file:a.ts' }); // one tab per document
workspace.open('editor', { reuseKey: null });            // always a new tab
workspace.open('log', { location: 'bottom' });           // split below the active tabset

workspace.find('viewer');         // TabRef[] — id, component, title, config, selected, active, dirty
workspace.snapshot();             // { tabs, active } — what is on screen
await workspace.close(id);        // asks first if the tab is dirty
workspace.reset();                // back to initialLayoutJson, saved layout cleared
workspace.onDidActivate((tab) => …);
```

Inside a tab, `useTab()` is the tab's view of itself:

```tsx
const Desk = () => {
  const input = useRef<HTMLTextAreaElement>(null);
  const { config, setTitle, setDirty } = useTab<{ query?: string }>({
    // On open, on focus, on click — the place to focus an input.
    onActivate: () => input.current?.focus(),
  });
  …
};
```

**Saved layouts evolve with your app.** Layouts persist by component id. When
you rename a component, alias the old id rather than registering it forever —
saved tabs are rewritten on load:

```ts
componentRegistry.alias('mail', 'desk', { title: 'Desk' });
```

For bigger changes, version the layout and migrate it:

```ts
initializeShell({
  layout: {
    version: 2,
    migrate: (json, fromVersion) => rewrite(json, fromVersion),
    onUnknownComponent: 'drop', // or 'placeholder' (default), or (id) => <Gone id={id} />
  },
});
```

`initialLayoutJson` on `ShellLayout` seeds a first run only; a layout the user
has arranged is restored instead.

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
| `ActivityBar` | Vertical icon rail for switching side panels, either edge |
| `ChatPane` | Chat transcript with slash-command autocomplete; fills any host |
| `CommandPalette` | Filterable, keyboard-navigable command list |
| `ContextMenu` | Floating menu positioned at viewport coordinates |
| `DataGrid` | Sortable, filterable, keyboard-driven table: multi-select, preview vs. open, server-side sort and paging, expandable rows, virtualisation |
| `MenuBar` | Application menu bar with submenus and content slots |
| `Modal` | Alert / confirm / prompt dialog, or any content, with a focus trap |
| `QuickSearch` | Compact search field with grouped results, for the menu bar |
| `SearchWidget` | Full-height search panel with autocomplete, for the sidebar |
| `SettingsPanel` | Theme picker body for the settings sidebar |
| `SidebarPane` | Titled, closable side panel; `side` docks it left or right |
| `StatusBar` | Footer with left / center / right item groups |
| `TerminalPane` | Terminal log and input; fills any host |
| `PaneHostProvider` | Tells hosted components a title bar is already drawn |
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

## Styles and Tailwind

Everything in `style.css` lives in `nexus.*` cascade layers, so your styles win
without specificity fights — unlayered CSS beats every layer, and your own
layers win as long as `nexus` is declared first. With Tailwind v4:

```css
/* your entry stylesheet */
@layer nexus, theme, base, components, utilities;
@import 'nexus-shell/style.css' layer(nexus);
@import 'tailwindcss';
```

Or import `nexus-shell/style.css` from JavaScript before your own CSS.
FlexLayout's stylesheet is bundled inside `style.css`; the library's JavaScript
imports no CSS, so test runners need no special configuration.

`nexus-shell/style.no-reset.css` is the same stylesheet without Tailwind's
preflight, for apps that bring their own reset.

## Theming

Four themes ship in the stylesheet: `theme-light`, `theme-dark`, `theme-gt`
(Georgia Tech) and `theme-tamu` (Texas A&M).
Colors are CSS custom properties scoped to those classes, so switching themes is
a class on an ancestor — no React context, no provider.

Add your own by defining a `.theme-yourname` block with the same properties,
and register it so pickers, commands and `scheme` know about it:

```ts
registerTheme({ id: 'midnight', label: 'Midnight', scheme: 'dark' });
```

For code that draws outside CSS — charts, canvas — read the resolved colors:

```tsx
const t = useThemeTokens(); // { scheme, background, muted, mutedForeground, primary, … }
<ResponsiveCalendar emptyColor={t.muted} theme={{ text: { fill: t.mutedForeground } }} />
```

Every corner radius derives from `--radius`, and pills and avatars from
`--radius-pill`. For a square UI:

```css
:root { --radius: 0; --radius-pill: 0; }
```

## Testing

The shell's state lives in module-level stores, so reset it between tests and
drive a real, headless workspace rather than mocking FlexLayout:

```ts
import { resetShell, createTestWorkspace } from 'nexus-shell/testing';

beforeEach(() => resetShell());

it('opens Desk once', () => {
  const ws = createTestWorkspace({ components: { desk: Desk } });
  openDesk();
  openDesk();
  expect(ws.find('desk')).toHaveLength(1);
});
```

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
