# nexus-shell × InboxQL — Integration Review and Proposed Changes

*Reviewed 2026-10-12. nexus-shell at 0.2.13 (`fdff8cf`); InboxQL frontend at 0.0.86, resolving nexus-shell 0.2.11.*

## 1. Summary

InboxQL is the most demanding real consumer of nexus-shell: a ~23k-line React app with 17 tab components, 15 commands, persisted layouts that have survived several renames, a remote-control channel that reports what is on screen, and its own Tailwind v4 build. It uses only the shell's frame (`ShellLayout`, registries, theme store, `useLayoutStore`). It uses **none** of the library's widgets. That is not because nexus-shell lacks widgets, but because:

1. **The workspace API is too thin.** `useLayoutStore` exposes the raw FlexLayout `Model` plus one `addTab`. InboxQL wrote ~250 lines (`lib/tabs.ts`, `lib/windows.ts`) that walk `model.visitNodes`, dispatch FlexLayout actions by their wire format (`{ type: 'FlexLayout_SelectTab', data: { tabNode } } as any`), and even mutate `node._attributes` directly. The single most valuable change is a first-class **workspace API** (open-or-focus, close, rename, find, snapshot, activation events).
2. **The library still carries code from its demo apps.** `LayoutService` contains a dialogue-mapper migration, `mapId`/`projectId` dedupe rules and a hard-coded `nexus-dashboard`/`nexus-docs` singleton list. `UserProfileService` defaults to a real person's name and email. The default layout opens a `welcome` component that no consumer registers.
3. **The stylesheet fights the consumer's Tailwind.** `dist/style.css` is Tailwind v3 output, including preflight, with **no cascade layers**. FlexLayout's `light.css` is imported from JavaScript. InboxQL had to restructure its Tailwind v4 imports to make its own utilities win, and it documents a failed attempt to fix this from the consumer side.
4. **Batteries that look included aren't.** `ShellLayout` does not mount `ConnectedModal`, `ConnectedCommandPalette` or `useKeyboardShortcuts`. InboxQL's menu advertised shortcuts that did nothing until someone noticed. It still has no command palette. The dirty-tab confirmation in `ShellLayout` awaits a modal that is never rendered.
5. **Persisted layouts have no evolution story.** InboxQL permanently registers five alias components and rewrites tab attributes in place so old saved layouts don't render "Unknown Component".

Section 4 has the proposals. Together they would let InboxQL delete most of `lib/tabs.ts`, its CSS workarounds, its hand-rolled theme list and its test-time model mocks, while making nexus-shell safer for every other consumer.

---

## 2. How InboxQL uses nexus-shell today

### 2.1 Import surface

Six files import from `nexus-shell`. Excluding tests, the full surface is:

| Symbol | Where | Use |
|---|---|---|
| `initializeShell` | `main.tsx` | Called with **no options**, only for default commands and menus |
| `ShellLayout` | `App.tsx:1578` | `title`, `panels=[chatPanel({side:'bottom'})]`, `statusBarConfig`, `rightMenuBarContent` |
| `AppTitle` | `App.tsx:1581` | Branding, with a CSS override to undo forced `uppercase` |
| `componentRegistry` | `App.tsx:1291–1316` | 17 registrations, 5 of them legacy aliases |
| `commandRegistry` | `App.tsx:1411–1506` | 15 commands, registered inside a `useEffect` |
| `menuRegistry.setMenus` | `App.tsx:1508` | Replaces all menus, including the shell's default View menu |
| `useKeyboardShortcuts` | `App.tsx:1322` | Mounted manually after shortcuts were found not to work |
| `useThemeStore` | `App.tsx:140, 594` | Chart colours chosen by `theme === 'dark'`; a hand-built theme picker |
| `UserProfile` (pure) | `App.tsx:1591` | Fed from InboxQL's own `/api/profile` |
| `chatPanel` | `App.tsx:1588` | Mounted with **no send handler** (see §3.9) |
| `useLayoutStore` | `lib/tabs.ts`, `lib/windows.ts`, 2 tests | Raw `model.visitNodes` / `model.doAction` / `addTab` |

Never used: `DataGrid`, `TreeWidget`, `Modal`/`ConnectedModal`, `ContextMenu`, `CommandPalette`, `QuickSearch`, `SearchWidget`, `SettingsPanel`, `ThemeSwitcher`, `PropertyPanel`, the graph primitives (InboxQL depends on `reactflow` instead), `PaneHost`, `onLayoutChange`, `initialLayoutJson`, `setTabDirty`.

### 2.2 What InboxQL built around the shell

| InboxQL code | Why it exists | Shell gap |
|---|---|---|
| `lib/tabs.ts` `openTool` (≈90 lines) | Open-or-focus a tab, normalise legacy ids, rename legacy tabs | No open-or-focus, rename, or alias API |
| `lib/tabs.ts` `isToolOpen`, `tabNodeFor`, `applyViewerMode`, `renameViewerTab` | Find, close and rename tabs | No find/close/rename API; actions not re-exported |
| `lib/windows.ts` `currentShowing` | Report open and active tabs to the backend (`iql ui list`) | No layout snapshot API |
| `App.tsx:1440` `setTimeout(…querySelector('textarea[aria-label="Query"]').focus(), 50)` | Focus the query box after the Desk tab comes forward | No tab activation hook or event |
| `App.tsx:1568` `setTimeout(() => openToolCb('desk'), 500)` | Open Desk after login | No default-layout or "workspace ready" hook; the default layout's `welcome` tab is unregistered |
| `window` `CustomEvent`s (`iql:open-annotators`, `SETTINGS_SECTION_EVENT`) | Deep components open tabs or select a settings section | No way to open a tab *with parameters* that the tab can read |
| Global zustand stores per view (`useViewerStore`, `useErrorLogStore`) | Pass state into a tab | Same as above: `addTab`'s `config` exists but cannot be updated on an already-open tab |
| `BrowserStoragePanel.tsx` | Hard-codes `nexus-shell-layout`/`-theme`/`-user-profile` keys to offer "Reset Layout" | No `resetLayout()`, no exported storage keys |
| `index.css` split Tailwind import, `App.css` `.app-lockup h1` | Win the cascade against unlayered shell CSS | Unlayered stylesheet; `AppTitle` forces `uppercase` |
| `* { border-radius: 0 !important }` + FlexLayout overrides | Square visual language | Radius not fully token-driven |
| Hand-listed themes `[light, dark, gt]` in Settings | Theme picker | Doesn't read `BUNDLED_THEMES`, so `tamu` is missing (drift) |
| `theme === 'dark' ? '#27272a' : '#f4f4f5'` in Dashboard | Colour a nivo chart | No `scheme` on themes, no resolved token values for canvas/SVG libraries |
| Four hand-built `fixed inset-0` modals | Dialogs with custom content | `Modal` only supports alert/confirm/prompt |
| `vite.config.ts` `test.server.deps.inline: ['nexus-shell','flexlayout-react']`, `optimizeDeps.exclude` | Tests choke on the CSS import inside the library JS | CSS imported from JS (`ShellLayout.tsx:11`) |
| `tabs.test.ts`, `viewerMode.test.ts` | Fake `model` objects with `visitNodes`/`doAction`/`_attributes` | No test helpers; tests are coupled to FlexLayout internals |

### 2.3 Dependency hygiene

`frontend/node_modules/nexus-shell/node_modules/zustand` exists. InboxQL ships **two copies of zustand**: its own 5.0.11, plus the 4.x that nexus-shell declares as a hard dependency (`^4.5.2`). This costs bundle size today. It would also break anything that shares a store or uses zustand middleware across the boundary.

---

## 3. Findings in nexus-shell

Each finding cites the source. Severity: **Bug** = wrong behaviour today; **Gap** = missing capability that forces consumers into internals; **Hygiene** = leaked or misleading code.

### 3.1 `addTab` does not focus existing tabs, despite the docs saying it does (Bug)

`Boot.ts` `togglePanel` says *"`addTab` focuses an existing one rather than duplicating it"*. `LayoutService.addTab` only dedupes four special cases: the component ids `nexus-dashboard` and `nexus-docs`, and the config keys `mapId` and `projectId`. Every other call appends a new tab. So `view.toggleTerminal` with a tab-hosted terminal opens a new terminal on every press. Calling `addTab('desk')` twice gives two Desks, which is why InboxQL's `openTool` exists. The `togglePanel` test mocks `addTab`, so it never catches this.

### 3.2 Demo-app logic inside the core layout store (Hygiene)

`LayoutService.ts` exports `dialogueMappingLayoutJson` and `dialogueMapperMenus`, whose commands are all `nexus.new-tab`. On every boot it runs a *"V1 Migration: Purge old standalone dialogue-mapper sidebars"* against **every consumer's** saved layout, deleting any tab whose component is `dialogue-library` or `argument-inspector`. The dedupe rules from 3.1 are also app-specific. A consumer with a component named `argument-inspector` would have it silently deleted on reload.

### 3.3 The default layout references an unregistered component (Bug)

`defaultLayout` opens a `Welcome` tab with `component: "welcome"`. Nothing in the library registers `welcome`. Any app that doesn't pass `initialLayoutJson`, including InboxQL, shows **"Unknown Component: welcome"** on first run. `addTab` then adds the app's own tabs beside it, into the same tabset.

The default layout also seeds a left `border` with no children, which renders FlexLayout border chrome in some states.

### 3.4 `ShellLayout` is not self-sufficient (Bug and Gap)

- `ShellLayout.onAction` calls `useModalStore.getState().openConfirm(...)` for dirty tabs. `ShellLayout` never renders `ConnectedModal`, so unless the app mounts one, the promise never settles and the tab can't be closed.
- `useKeyboardShortcuts` is not mounted by `ShellLayout`. The default commands advertise `Control+b` and ``Control+` `` in menus, but they do nothing until the app adds the hook. InboxQL's comment at `App.tsx:1319` records exactly this.
- `ConnectedCommandPalette` is opt-in, so InboxQL registers 15 commands with labels and has no palette to run them from.

The showcase and basic-app examples mount all three by hand, which shows they are expected. The library just doesn't do it for you.

### 3.5 Stylesheet: unlayered Tailwind v3 output, preflight included (Gap)

- `src/index.css` compiles `@tailwind base; components; utilities` into `dist/style.css` with **no `@layer`**. Unlayered rules beat every layered rule regardless of specificity. A Tailwind v4 consumer puts its utilities in `@layer utilities`, so any utility that nexus-shell's bundle doesn't also contain loses to the shell's preflight (`button { padding: 0 }`). InboxQL's case: `px-4` worked, `px-5` did nothing.
- `ShellLayout.tsx:11` imports `flexlayout-react/style/light.css` **from JavaScript**, also unlayered. InboxQL tried the obvious consumer fix, wrapping nexus-shell in a layer. FlexLayout's own CSS then beat the shell's themed tab-strip colours, which broke every theme except Light. A consumer cannot fix this. It has to be fixed in the library.
- The same JS-side CSS import is why InboxQL's Vitest config must inline `nexus-shell` and `flexlayout-react`.

### 3.6 Theming is not consumable outside CSS (Gap)

- `IBundledTheme` has no `scheme: 'light' | 'dark'`. Canvas and SVG libraries (nivo, deck.gl, reactflow minimaps) need concrete colours. Consumers end up writing `theme === 'dark'`, which is wrong for any custom dark theme.
- There's no helper to read resolved token values (`--background`, `--muted-foreground`, …) as colour strings.
- `ThemeService` reads `localStorage` and touches `document` **at module load, unguarded**. The SSR/test fix applied to `PaneService` in 0.2.12 was not applied here. `setTheme` also writes unguarded, which throws in Safari private mode.
- `ShellLayout` also adds `theme-${theme}` to its root `div`, while `ThemeService` applies the class to `<html>`. That's harmless but redundant, and confusing when debugging.

### 3.7 Branding and radius are partly hard-coded (Gap)

- `AppTitle` hard-codes `uppercase font-mono font-black` with no opt-out. InboxQL needs an unlayered override to keep its "QL".
- `--radius` drives `rounded-lg/md/sm`, but there are 64 `rounded*` usages, and some (`rounded-full`, arbitrary values) ignore the token. InboxQL resorts to `* { border-radius: 0 !important }`. That blunt rule also squares off avatars and pills it may not have meant to.

### 3.8 Registries have no lifecycle (Gap)

- `commandRegistry.registerCommand` **ignores** re-registration (warn and return), and there is no `unregisterCommand`. InboxQL registers in a `useEffect` keyed on `[user, openTool]`. Every re-run is a no-op with a warning, so the *first* closure wins forever. That happens to be harmless today, but any command closing over changing state would silently go stale. Chat slash commands got idempotent replace-and-unregister in 0.2.12. Commands should match.
- `menuRegistry.setMenus` replaces everything, including the default **View** menu built by `initializeShell`. InboxQL's own `View` entry therefore drops the shell's theme submenu and sidebar toggle, probably without anyone deciding to. There is no additive "contribute items to menu X" with ordering or groups.
- `componentRegistry.register` warns on duplicates and has no `alias` concept (see 3.10).
- No registry exposes a change subscription. `ConnectedCommandPalette` snapshots `getCommands()` on render, so it shows commands registered after its last render only after an unrelated re-render.

### 3.9 Keyboard handling is naive (Gap)

`KeyboardService.isMatch` fires inside `<input>`/`<textarea>`/contenteditable. So `Control+Shift+C` (InboxQL: Contacts) is stolen while typing in the query box. There is no `Mod` alias (Cmd on macOS, Ctrl elsewhere), no chord support, and no `when` context. The palette's `Cmd/Ctrl+Shift+P` listener is separate from the registry, so it's not rebindable through commands.

### 3.10 Persisted layouts can't evolve (Gap)

Layouts persist component ids. When an app renames a component, it can either keep the old id registered forever, as InboxQL does for `mail`, `query`, `search`, `message`, `viewer-contact` and `viewer-file`, or users see "Unknown Component". InboxQL also rewrites stored tabs at runtime, including `node._attributes.component = id`, which writes FlexLayout private state. The library has no:

- layout schema version or migration hook,
- component alias map,
- policy for unknown components (drop the tab, or render a consumer-provided fallback).

The library's one built-in migration (3.2) is app-specific and runs unconditionally.

### 3.11 Tabs can't receive parameters or react to activation (Gap)

The factory passes `node` and spreads `config` as props. But there's no hook for a tab component to:

- know whether it is visible or selected (InboxQL's 50 ms `querySelector` focus hack),
- receive new parameters when re-opened (InboxQL's global stores and `window` events),
- set its own title or dirty state without importing `useLayoutStore` and knowing its node id.

### 3.12 Chat panel can't be wired through `chatPanel()` (Gap)

`chatPanel(overrides: Partial<IPanel>)` only overrides panel fields. Its `component` is `ConnectedChatPane` with no `onSend`, so user messages are echoed into the transcript and go nowhere. InboxQL has a working LLM gateway, but the chat it mounts is a dead end. Wiring it means replacing `component` with a hand-written wrapper. `ChatService` also has no `updateMessage` or streaming append, which an LLM-backed chat needs.

### 3.13 Personal data in library defaults (Hygiene)

`UserProfileService.DEFAULT_PROFILE` is `{ name: 'David Tech', role: 'Shell Architect', email: 'david@techmuch.io' }`. It ships to every consumer and is what `ConnectedUserProfile` renders before the app sets anything. It's also persisted under `nexus-shell-user-profile` in every consumer's browser, which is why InboxQL's storage panel has to explain it.

### 3.14 Widgets don't cover InboxQL's needs (Gap, lower priority)

| Widget | What InboxQL needed instead | Missing |
|---|---|---|
| `Modal` | Calendar editor, annotator review, model editor dialogs | Arbitrary `children`, size, footer slot; it's only alert/confirm/prompt |
| `DataGrid` | Desk results (messages, threads, aggregates, tickets, drafts), Error log | Multi-select, keyboard row navigation and focus model (InboxQL's `data-nav-row`), controlled/server-side sort and paging, expandable rows, sticky toolbar slot |
| `ThemeSwitcher` / `SettingsPanel` | A settings *tab* with sections | A settings model InboxQL could host in a tab, with deep-linking to a section |
| Graph primitives | Agent builder (uses `reactflow`) | Not evaluated in depth. Worth a dedicated comparison before recommending a switch |

`import.md` explicitly plans to adopt `TreeWidget` and `DataGrid` "to find its rough edges". The table above lists those edges ahead of time.

---

## 4. Proposed changes

Grouped by priority. Each proposal has the problem, the API sketch, what InboxQL can delete, compatibility, and rough effort (S < ½ day, M ≈ 1–2 days, L > 2 days).

### P0: correctness and hygiene (patch release, 0.2.14)

#### P0-1. Make `addTab` open-or-focus by default
- **Change:** Before adding, look for an existing tab with the same `component` *and* the same `reuseKey`. The `reuseKey` defaults to the component id, so tabs are singletons unless the caller opts out. If one exists, select it, update its `config` if given, and return its id. Return the tab id in every case.
- **API:** `addTab(component, title?, config?, opts?: { reuseKey?: string | null; focus?: boolean }) => string`. `reuseKey: null` always creates a new tab, for multi-instance editors.
- **Fixes:** 3.1, and the `togglePanel` doc claim becomes true. Add a real (non-mocked) test.
- **Compat:** Behaviour change for callers relying on duplicates. Pass `reuseKey: null` to keep them. `mapId`/`projectId` dedupe becomes `reuseKey: \`map:${id}\``.
- **Effort:** S.

#### P0-2. Remove demo-app code from `LayoutService`
- Delete the dialogue-mapper migration, `dialogueMappingLayoutJson`, `dialogueMapperMenus`, and the `nexus-dashboard`/`nexus-docs`/`mapId`/`projectId` special cases. Move the dialogue-mapper bits into `examples/` if anything still uses them.
- **Compat:** Removes two exports. They are not re-exported from `index.ts`, so not public API.
- **Effort:** S.

#### P0-3. A default layout that works
- Make the default layout one empty tabset with no `welcome` tab and no empty border. Optionally register a tiny built-in `nexus.empty` placeholder, rendered when the workspace has no tabs, that lists the most recent commands.
- Document `initialLayoutJson` as the way to choose first-run tabs. InboxQL can then delete its 500 ms `setTimeout`.
- **Effort:** S.

#### P0-4. `ShellLayout` mounts its own infrastructure
- Add props, all defaulting to `true`: `keyboardShortcuts`, `modal`, `commandPalette`. `ShellLayout` mounts `useKeyboardShortcuts`, `<ConnectedModal/>` and `<ConnectedCommandPalette/>` itself.
- Guard against double-mounting with a module-level ref count, so apps that already mount them (examples, InboxQL's `useKeyboardShortcuts()`) don't double-fire.
- **Fixes:** 3.4. The dirty-tab confirm works, and InboxQL gets a command palette for free.
- **Effort:** S.

#### P0-5. Guard all storage and DOM access at module load
- Extract `PaneService`'s `readStored`/`writeStored` into `lib/storage.ts`. Use it in `ThemeService`, `UserProfileService` and `LayoutService`. Defer `applyTheme` until `document` exists.
- **Effort:** S.

#### P0-6. Neutral user-profile defaults
- Default to empty strings, rendered as initials or a generic avatar. Don't persist the profile unless the app opts in (`persistProfile`), since most apps, InboxQL included, own the profile on a server.
- **Effort:** S.

### P1: the workspace API (minor release, 0.3.0)

This is the change that matters most to InboxQL-like apps. Today the public answer to "focus a tab" is "learn FlexLayout's action wire format".

#### P1-1. `workspace`: a typed facade over the layout model
Exported both as a plain object (usable outside React, like the registries) and as hooks:

```ts
export interface TabRef { id: string; component: string; title: string; config: Record<string, unknown>; tabsetId: string; selected: boolean; active: boolean }

export const workspace = {
  open(component: string, opts?: { title?: string; config?: object; reuseKey?: string | null; focus?: boolean; location?: 'active' | 'right' | 'bottom' | { tabsetId: string } }): string,
  focus(tabId: string): boolean,
  close(tabId: string, opts?: { force?: boolean }): Promise<boolean>,   // honours dirty prompt
  rename(tabId: string, title: string): void,
  update(tabId: string, patch: { title?: string; config?: object; component?: string }): void,
  find(pred: string | ((t: TabRef) => boolean)): TabRef[],
  isOpen(component: string): boolean,
  active(): TabRef | null,
  snapshot(): { tabs: TabRef[]; active: string | null },
  reset(): void,                                    // back to initialLayoutJson / default, clears storage
  onDidChange(cb: (s: ReturnType<typeof workspace.snapshot>) => void): () => void,
  onDidActivate(cb: (t: TabRef) => void): () => void,
};
export const useWorkspaceSnapshot: () => ReturnType<typeof workspace.snapshot>;
```

- All FlexLayout `doAction` calls live inside the facade, so any future FlexLayout upgrade that changes actions or node accessors is absorbed in one place (not yet verified against flexlayout-react 0.8).
- Keep `useLayoutStore().model` exported as an escape hatch, documented as unstable.
- **InboxQL deletes:** almost all of `openTool`'s body, plus `isToolOpen`, `tabNodeFor`, `renameViewerTab` and the walk in `currentShowing`. `iql ui list` reads `workspace.snapshot()` directly. Estimated −150 lines, and no `as any`.
- **Effort:** M.

#### P1-2. `useTab()`: the tab component's view of itself
```ts
const { id, config, visible, active, setTitle, setDirty, onActivate } = useTab<{ section?: string }>();
onActivate(() => queryRef.current?.focus());           // replaces the 50 ms querySelector hack
```
- Provide it through context from the factory (`PaneHostProvider` already wraps every tab, so this extends it).
- `workspace.open('settings', { config: { section: 'system' } })` on an open tab updates `config` and fires `onActivate`. That replaces InboxQL's `SETTINGS_SECTION_EVENT`, `iql:open-annotators` and `requestSettingsSection` plumbing.
- **Effort:** M.

#### P1-3. Layout evolution: aliases, migrations, unknown-component policy
```ts
componentRegistry.alias('mail', 'desk');                // resolves at load; stored tab is rewritten
initializeShell({
  layout: {
    version: 3,
    migrate: (json, fromVersion) => json,               // app-owned, runs before Model.fromJson
    onUnknownComponent: 'drop' | 'placeholder' | ((id) => ReactNode),
  },
});
```
- The library stores `{ version, model }` under the storage key, and treats the current bare-model format as version 0.
- Aliases rewrite `component` *and* title on load, using `Actions.updateNodeAttributes`. That replaces InboxQL's `_attributes` mutation.
- **InboxQL deletes:** five alias registrations become one `alias` map, and the legacy-rename branch of `openTool` goes away.
- **Effort:** M.

#### P1-4. Registry lifecycles
- `registerCommand(cmd)` returns a disposer and **replaces** an existing id, matching the 0.2.12 slash-command change. Add `unregisterCommand(id)`.
- Add `useCommand(cmd, deps)`, a hook that registers on mount and unregisters on unmount, so closures stay fresh.
- `menuRegistry.contribute(menu, items, { group?, order? })` appends, alongside `setMenus` (replace). `initializeShell({ menus })` should merge into the default View menu by default rather than replace it, with `defaultMenus: false` as the opt-out.
- Add `subscribe()` on command and menu registries (or back them with zustand), so the palette and menu bar update live.
- **Effort:** M.

#### P1-5. Keyboard service
- Skip editable targets unless the command sets `allowInInputs: true`.
- Add a `Mod` alias (⌘ on macOS, Ctrl elsewhere), and render bindings platform-appropriately in menus and the palette (`Mod+K` → `⌘K` or `Ctrl+K`).
- Route the palette shortcut through a registered command (`shell.commandPalette`) so it is rebindable.
- Optional `when?: () => boolean` on `ICommand`, which the palette also honours.
- **Effort:** S–M.

#### P1-6. `zustand` as a peer dependency
- Move `zustand` to `peerDependencies: "^4.5 || ^5"`. nexus-shell only uses the named `create`, which is compatible across both majors. Verify `useStore` selector equality behaviour under v5 (v5 removed the custom equality-function argument from `create`'s hook, and nexus-shell doesn't use it). Run the test suite against both majors in CI.
- **Fixes:** the duplicate copy in InboxQL's bundle.
- **Effort:** S.

### P1: styling (0.3.0, coordinated with the workspace release)

#### P1-7. Ship a layered stylesheet
- Wrap everything in `dist/style.css` in named layers: `@layer nexus.reset, nexus.vendor, nexus.base, nexus.components, nexus.themes;`.
- Bundle FlexLayout's `light.css` **into** `nexus.vendor` inside `style.css`, and remove the `import 'flexlayout-react/style/light.css'` from `ShellLayout.tsx`. That's the piece InboxQL proved a consumer can't fix, and removing the JS-side CSS import also ends the need for `deps.inline` in consumer test configs.
- Keep theme blocks in a layer *above* vendor, so themed tab strips beat FlexLayout defaults inside the library's own ordering.
- Ship two entry points: `nexus-shell/style.css` (layered, includes preflight in `nexus.reset`) and `nexus-shell/style.no-reset.css` for apps with their own preflight.
- **Consumer guide** (README section "Using with Tailwind v4"):
  ```css
  @layer nexus, theme, base, components, utilities;   /* app layers come last and win */
  @import "nexus-shell/style.css" layer(nexus);
  @import "tailwindcss";
  ```
- **InboxQL deletes:** the split Tailwind import and its 20-line explanatory comment, and the `.app-lockup h1` override (with P1-8).
- **Compat:** Apps that relied on unlayered shell CSS beating their own layered styles will see their own styles win. That's almost always the intended result, but call it out in release notes.
- **Effort:** M. It needs a visual check of all four themes in the showcase Playwright suite, which already exists.

#### P1-8. Token-driven radius and typography
- Replace hard-coded `rounded-full` and arbitrary radii in chrome with `rounded-[var(--radius-pill)]` and `rounded-[var(--radius)]`. Add `--radius-pill` and a documented "square" recipe (`--radius: 0; --radius-pill: 0`).
- `AppTitle`: add `casing?: 'upper' | 'none'` (default `'upper'` for compatibility) and `mono?: boolean`.
- **InboxQL deletes:** the `* { border-radius: 0 !important }` block and the FlexLayout radius overrides.
- **Effort:** S–M.

#### P1-9. Theme metadata and resolved tokens
- Add `scheme: 'light' | 'dark'` to `IBundledTheme`, and a `registerTheme({ id, label, scheme })` for app themes.
- Add `useThemeTokens(): { scheme; background; foreground; muted; mutedForeground; border; primary; … }`. It returns resolved `hsl(...)` strings via `getComputedStyle(document.documentElement)` and recomputes on theme change.
- `useThemeStore` exposes `themes` (bundled plus registered), so pickers don't hand-list them.
- **InboxQL deletes:** the `theme === 'dark'` branches in Dashboard. The Settings theme grid maps over `themes`, which fixes the missing TAMU entry.
- **Effort:** S.

### P2: widgets and chat (0.3.x / 0.4.0)

#### P2-1. `chatPanel({ onSend })` and streaming
- `chatPanel(overrides & { onSend?, placeholder? })` builds the wrapper itself.
- `ChatService` gains `updateMessage(id, patch)` and `appendToMessage(id, chunk)` for streamed LLM responses, and a `pending` flag per message.
- With this, InboxQL can connect its gateway in about 20 lines.
- **Effort:** S.

#### P2-2. `Modal` with content
- Add `<Modal open title size footer onClose>{children}</Modal>`, keeping the alert/confirm/prompt `type` presets. Add `useModalStore().open(render)` for imperative use.
- Include focus trap, Escape, initial focus and backdrop click. InboxQL's four hand-built dialogs each re-implement part of this, inconsistently. The calendar editor closes on `mousedown`; the others don't.
- **Effort:** M.

#### P2-3. `DataGrid` for real-data apps
In order of value to InboxQL's Desk:
1. Controlled multi-selection (`selectedKeys`, `onSelectionChange`, shift and mod range).
2. Roving-focus keyboard navigation (↑/↓/Home/End/Enter), with separate `onActivate` (Enter or double-click) and `onFocusRow` (preview). That's the move-vs-open distinction InboxQL's `previewMessage`/`openMessage` encodes.
3. Controlled sort and an `onEndReached` for server-side paging.
4. `rowClassName`, `rowProps` (for `data-*`), expandable rows (threads).

- **Effort:** L. Worth doing *with* InboxQL as the acceptance test, as `import.md` already proposes.

#### P2-4. Testing utilities (`nexus-shell/testing`)
- `resetShell()` clears every registry and store. `createTestWorkspace(json?)` returns a real `Model`-backed workspace with no DOM.
- InboxQL's `tabs.test.ts` and `viewerMode.test.ts` currently fake `visitNodes`, `doAction` and `_attributes`, so they test against FlexLayout internals and pass even when the real API rejects an action. The `tabNode` vs `tabId` bug recorded in `tabs.ts:88–94` is exactly the class of bug this would catch.
- **Effort:** S.

#### P2-5. Graph primitives vs `reactflow`
Not a proposal yet. Compare `GraphCanvas`/`useGraphLayout` against InboxQL's agent-builder needs (custom node types, handles, edge labels, persistence format) before suggesting a migration.

---

## 5. Impact on InboxQL

| Proposal | InboxQL code removed or simplified |
|---|---|
| P0-1, P1-1 | `openTool` body, `isToolOpen`, `tabNodeFor`, `renameViewerTab`, `applyViewerMode` internals, `currentShowing` walk (≈150 lines, all `as any`) |
| P0-3 | 500 ms post-login `setTimeout`; "Unknown Component: welcome" on first run |
| P0-4 | Manual `useKeyboardShortcuts()`; command palette appears with no code |
| P1-2 | 50 ms focus `setTimeout`; `SETTINGS_SECTION_EVENT`; `iql:open-annotators` listener |
| P1-3 | Five alias registrations and their comments; legacy-rename branch and `_attributes` writes |
| P1-4 | Commands move into `useCommand`, so there's no stale-closure risk; View menu keeps theme and sidebar entries |
| P1-6 | Second zustand copy |
| P1-7, P1-8 | Split Tailwind import and comment; `.app-lockup` override; global `border-radius: 0 !important` |
| P1-9 | `theme === 'dark'` colour literals; hand-listed themes |
| P0-5 / workspace `reset()` | `BrowserStoragePanel` calls `workspace.reset()` instead of hard-coding keys |
| P2-1 | Chat panel becomes useful (LLM gateway) |
| P2-2, P2-3 | Four custom modals; eventually Desk/ErrorLog tables |
| P2-4 | Model-faking tests replaced with real-model tests |
| — | `vite.config.ts` `deps.inline` and `optimizeDeps.exclude` (follows from P1-7) |

---

## 6. Sequencing

| Release | Contents | Breaking? |
|---|---|---|
| **0.2.14** | P0-1 … P0-6 | Minor behaviour changes: `addTab` dedupes, default layout changes, profile defaults are empty. Release notes required |
| **0.3.0** | P1-1 … P1-9 | Stylesheet layering (P1-7), command re-registration semantics (P1-4), `zustand` becomes a peer (P1-6) |
| **0.3.x** | P2-1, P2-4 | No |
| **0.4.0** | P2-2, P2-3 (with InboxQL Desk as acceptance), P2-5 decision | Additive |

InboxQL should upgrade to 0.2.14 immediately; it is on 0.2.11 and misses the 0.2.12 pane and slash-command fixes. It can then adopt 0.3.0 in one PR that removes the workarounds in §5.

---

## 7. Risks and open questions

1. **Singleton-by-default `addTab` (P0-1)** is the right default for InboxQL-style tools. An editor-style app (one tab per file) must pass `reuseKey`. Is any current consumer relying on duplicates? Check the examples and the website.
2. **Layering (P1-7)** reverses who wins the cascade. That's correct, but apps with bare element selectors (`button {}`) will now override the shell's chrome. Mitigation: scope shell chrome selectors by class, not element.
3. **FlexLayout version.** The facade (P1-1) should land *before* any flexlayout-react upgrade (0.7.15 today). Check 0.8's changes to actions and node accessors before upgrading. Doing it the other way round means touching every consumer twice.
4. **Persisted layout format (P1-3).** Wrapping the stored model in `{ version, model }` must read the old bare format, or every user loses their layout once.
5. **InboxQL's remote control** (`iql ui`) is an unusual capability. `workspace.snapshot()` and `onDidChange` would make it straightforward for other apps too. It may deserve a documented "external control" recipe.
6. **Widget scope creep.** P2-3 can grow into a full data-grid product. Keep it to the four listed capabilities, measured against Desk.

## 8. Method

Read InboxQL's frontend integration points (`main.tsx`, `App.tsx`, `lib/tabs.ts`, `lib/windows.ts`, `App.css`, `index.css`, `vite.config.ts`, related tests and `BrowserStoragePanel.tsx`). Read its planning notes that mention the shell (`open-avatars-skills-plan.md`, `ui-sessions-plan.md`, `import.md`, `project-review-2026-08-23.md`). Then read nexus-shell's `src/index.ts`, `core/` (Boot, registries, all services), `ShellLayout`, `connected/`, `AppTitle`, `Modal` and `DataGrid` props, `src/index.css`, the built `dist/style.css`, the build config and the existing tests. I also checked InboxQL's installed `node_modules` for the resolved nexus-shell version and the nested zustand copy. All findings come from reading code. No proposal has been prototyped yet.
