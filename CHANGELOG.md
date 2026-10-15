# Changelog

## 0.3.0

Driven by a review of how [InboxQL](docs/inboxql-integration-analysis.md) — the
largest app built on the shell — uses it, and what it had to build around it.
The plan is in [docs/implementation-plan.md](docs/implementation-plan.md).

### Breaking changes and how to migrate

| Change | What to do |
| :-- | :-- |
| `addTab` / `workspace.open` focus an existing tab with the same component instead of adding a duplicate. | Nothing, if you wanted that (most apps hand-rolled it). For multi-instance tabs pass `{ reuseKey: null }`; for one tab per document, `{ reuseKey: \`file:${path}\` }`. The old `mapId` / `projectId` config special cases are gone — use `reuseKey`. |
| The default layout is one empty tabset. It no longer opens a `welcome` tab. | Pass `initialLayoutJson` to `ShellLayout` for what a first run should show. |
| `initialLayoutJson` no longer overwrites a layout restored from storage. | Nothing — this was the documented behaviour. It is now also what `workspace.reset()` returns to. |
| Layouts are saved as `{ nexusLayoutVersion, layout }`. Bare layouts saved by 0.2 are read as version 0. | Nothing. Downgrading to 0.2 will not read layouts saved by 0.3. |
| The dialogue-mapper migration that deleted `dialogue-library` / `argument-inspector` tabs on every load is gone, as are the `dialogueMappingLayoutJson` / `dialogueMapperMenus` exports of `LayoutService`. | Nothing, unless you imported those from the internal module path. |
| `ShellLayout` mounts the keyboard listener, modal host and command palette itself. | Remove your own `useKeyboardShortcuts()`, `<ConnectedModal />` and `<ConnectedCommandPalette />` — or keep them; duplicates are ignored. Opt out with `keyboardShortcuts`, `modal` or `commandPalette` set to `false`. |
| Re-registering a command id replaces it (it used to be ignored with a warning). `registerCommand` returns a disposer. | If you relied on first-registration-wins, check for duplicates. Prefer `useCommand` in components. |
| Bare-key and Shift+key shortcuts no longer fire while typing in a field. | Set `allowInInputs: true` on commands that should. Chords with Ctrl / Alt / Meta are unaffected. |
| `initializeShell({ menus })` merges into the default View menu instead of replacing it. | To own every menu, pass `defaultMenus: false`. |
| `style.css` is entirely inside `nexus.*` cascade layers, and includes FlexLayout's stylesheet. The JS no longer imports `flexlayout-react/style/light.css`. | Unlayered app CSS now wins over the shell's, including bare element selectors such as `button { … }` — scope those if they were not meant for the shell. Remove workarounds for unlayered shell CSS. Test runners no longer need to inline `nexus-shell` to cope with its CSS import. |
| Tailwind preflight is disabled in the shell's own Tailwind config and imported explicitly into `nexus.reset`. | Nothing. For no reset at all, import `nexus-shell/style.no-reset.css`. |
| `zustand` is a peer dependency (`^4.5 \|\| ^5`). | `npm install zustand` if you do not already have it. |
| The default user profile is anonymous (`Guest`). | Set the profile from your auth state. |
| `ChatSendHandler` receives `(text, chat)`; with no handler at all, the chat pane now says nothing is connected. | Nothing for single-argument handlers. Wire chat with `chatPanel({ onSend })` or `initializeShell({ chat: { onSend } })`. |
| `DataGrid`'s root has `role="grid"` (was `region`); the inner table is presentational. | Update tests that queried `getByRole('region', { name: 'Data Grid' })`. |

### Workspace

- `workspace` — open (open-or-focus, `reuseKey`, `location: 'right' | 'bottom' | { tabsetId }`), focus, close (honours the dirty prompt), rename, update, find, get, isOpen, active, snapshot, reset, normalizeAliases, dropUnknown, onDidChange, onDidActivate.
- `useTab({ onActivate })` — a tab's config, title, selected / active / dirty state, and setters. `useWorkspaceSnapshot()`.
- `componentRegistry.alias(old, new, { title })`, `resolve`, `has`, `unregister`. Saved tabs under an alias are rewritten on mount.
- `initializeShell({ layout: { version, migrate, onUnknownComponent } })`, also `configureLayout`.
- `STORAGE_KEYS` lists every `localStorage` key the shell writes.

### Commands, menus, keyboard

- `useCommand(cmd)` registers for a component's lifetime with fresh closures; `useCommands()`.
- `commandRegistry.unregisterCommand`, `hasCommand`, `subscribe`; `ICommand.when`, `ICommand.allowInInputs`.
- `menuRegistry.contribute(menu, items, { position })` with a disposer; `subscribe`; `mergeMenus`. The menu bar and palette update live.
- `Mod` in keybindings (Cmd on macOS, Ctrl elsewhere); bindings render as `⌘⇧P` / `Ctrl+Shift+P`. `formatKeybinding`, `parseKeybinding`, `matchesKeybinding`, `isMac`.
- The palette opens through the `shell.commandPalette` command (`Mod+Shift+P`); `useCommandPaletteStore`.

### Styles and theming

- Layered `style.css`; `style.no-reset.css`.
- Every radius follows `--radius`; `rounded-full` follows the new `--radius-pill`.
- Themes declare `scheme: 'light' | 'dark'`; `useThemeStore` exposes `themes` and `scheme` and sets `color-scheme`.
- `registerTheme`, `useThemeTokens`, `getThemeTokens`.
- `AppTitle` `casing` and `mono` props.

### Widgets

- Chat: `chatPanel({ onSend, placeholder })`; `chat.reply` / `chat.stream()` (append, done, fail); `pending` and `error` messages; `addMessage` returns the id; `updateMessage`, `appendToMessage`.
- Modal: `children`, `footer`, `size`, `closeOnBackdrop`; focus trap and restore; `useModalStore.openCustom(render, options)`.
- DataGrid: single / multiple selection (controlled or not), `onFocusRow` vs `onActivate`, Home / End / PageUp / PageDown, controlled `sort` with `manualSort`, `onEndReached`, `rowClassName`, `rowProps`, expandable rows.

### Testing

- `resetShell()` and `createTestWorkspace()`, also from `nexus-shell/testing`.

### Fixes

- `ThemeService` and `UserProfileService` no longer throw on import without a DOM or with storage blocked.
- The dirty-tab confirmation no longer waits forever when the app had not mounted a modal host.
- Tailwind variant rules (`hover:` …) are no longer emitted outside any layer.
