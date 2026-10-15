# Implementation plan — InboxQL integration review

Source: [`inboxql-integration-analysis.md`](./inboxql-integration-analysis.md). Ships as **0.3.0** (contains breaking changes, see each phase). One commit per phase; every phase leaves `npm test`, `npm run typecheck` and `npm run build` green.

| Phase | Proposals | Scope |
|---|---|---|
| 1. Core correctness & hygiene | P0-1 … P0-6 | `addTab` open-or-focus with `reuseKey`, remove demo-app code from `LayoutService`, working default layout, `ShellLayout` mounts modal/palette/keyboard, shared guarded storage helper, neutral profile defaults |
| 2. Workspace API | P1-1, P1-2, P1-3 | `workspace` facade + `useWorkspaceSnapshot`, `useTab()` with activation, `componentRegistry.alias`, versioned persisted layouts with `migrate`, unknown-component policy |
| 3. Registries & keyboard | P1-4, P1-5 | Command replace/unregister/disposer, `useCommand`, `menuRegistry.contribute`, registry `subscribe`, default View menu merged; keyboard skips editable targets, `Mod` alias, `when`, palette command |
| 4. Styling & theming | P1-6 … P1-9 | `zustand` as peer, layered `style.css` with FlexLayout CSS bundled and no JS CSS import, `style.no-reset.css`, `--radius-pill`, `AppTitle` casing, theme `scheme`, `registerTheme`, `useThemeTokens` |
| 5. Chat, widgets, testing | P2-1 … P2-4 | `chatPanel({ onSend })`, streaming message updates, content `Modal` + `openCustom`, `DataGrid` multi-select / keyboard nav / controlled sort / `onEndReached` / row props, `nexus-shell/testing` |
| 6. Release | — | README + CHANGELOG, version 0.3.0, build, push, publish |

P2-5 (graph primitives vs `reactflow`) is an evaluation, not code, and is left out of this release.
