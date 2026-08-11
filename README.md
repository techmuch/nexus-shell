# Nexus Shell

React components for building IDE-style application shells — menu bar, activity
bar, sidebar, docking layout, terminal, chat pane and status bar.

```bash
npm install nexus-shell
```

```ts
import 'nexus-shell/style.css';
```

React 19 is a peer dependency.

## Two tiers

**Primitives** are pure and prop-driven. No global state, no registry lookups.
You pass data in, you get callbacks out.

```tsx
import { StatusBar, ActivityBar, SidebarPane, TreeWidget } from 'nexus-shell';

const [active, setActive] = useState<string | null>('files');

<div className="theme-light flex h-screen flex-col">
  <div className="flex flex-1">
    <ActivityBar
      items={panels}
      activeId={active}
      onSelect={(id) => setActive(id === active ? null : id)}
    />
    {active && (
      <SidebarPane title="Explorer" onClose={() => setActive(null)}>
        <TreeWidget data={files} onToggle={toggle} onActivate={open} />
      </SidebarPane>
    )}
    <main className="flex-1">{children}</main>
  </div>
  <StatusBar widgets={[{ id: 'branch', label: 'main', alignment: 'left' }]} />
</div>;
```

**`ShellLayout`** is the assembled frame — the same components, wired to a set of
zustand stores and registries so you configure declaratively:

```tsx
import { ShellLayout, componentRegistry } from 'nexus-shell';

componentRegistry.register('editor', Editor);

<ShellLayout
  title={<Logo />}
  panels={[{ id: 'files', label: 'Explorer', icon: Files, component: FileTree }]}
  menuConfig={{ File: [{ id: 'save', label: 'Save', commandId: 'file.save' }] }}
  statusBarConfig={[{ id: 'branch', label: 'main', alignment: 'left' }]}
/>;
```

Each primitive also has a `Connected*` variant that binds it to the matching
store. `ShellLayout` is built out of those, and they're exported, so you can mix
tiers freely.

## Components

| Primitive | What it is |
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
| `TreeWidget` | Virtualised file tree with drag-to-move and a data-driven menu |
| `UserProfile` | Avatar and identity widget |

`ShellLayout` composes all of them.

## Theming

Three themes ship in the stylesheet: `theme-light`, `theme-dark`, `theme-gt`.
Colors are CSS custom properties scoped to those classes, so switching themes is
a class on an ancestor — no React context, no provider.

Add your own by defining a `.theme-yourname` block with the same properties.

## Development

```bash
npm install
npm run storybook      # docs and component workbench at :6006
npm run dev            # showcase app at :5173

npm run typecheck      # library sources
npm test               # vitest — unit and architecture tests
npm run build          # library build to dist/
npm run build-storybook
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
  components/       Primitives — pure, prop-driven, the public API
  connected/        Store-bound wrappers used by ShellLayout
  core/             Stores (zustand) and registries
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
```

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
