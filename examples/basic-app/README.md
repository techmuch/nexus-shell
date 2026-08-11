# Basic App

The smallest complete Nexus Shell application, and the shape every app on this
library starts from:

1. Register your views with `componentRegistry`.
2. Call `initializeShell` once with your panels, commands, menus and status bar.
3. Render `ShellLayout`.

Everything after that is another registration. The layout in `src/App.tsx` never
grows — features attach to it by id.

## Run it

```bash
npm run dev
```

The Vite config aliases `nexus-shell` to `../../src`, so this runs against the
library source with no build step. A real consumer would drop that alias and let
node resolution find the installed package.

## What it demonstrates

| | |
| :-- | :-- |
| **Views by id** | `componentRegistry.register('editor', Editor)`, opened with `useLayoutStore().addTab` |
| **Boot configuration** | `initializeShell({ panels, commands, menus, statusBar })` |
| **A sidebar panel** | `FileExplorer` becomes an activity bar icon and a sidebar pane |
| **Commands and hotkeys** | `file.new` on `Ctrl+N`; every command appears in the palette on `Cmd/Ctrl+Shift+P` |
| **Menus by command id** | File menu entries dispatch through `commandId`, never a function reference |
| **Dialogs from anywhere** | `useModalStore.getState().openAlert(…)`, including outside React |
| **Late registration** | A command and status bar item added in `useEffect`, behaving identically to the ones in `initializeShell` |
| **Theming** | `class="theme-dark"` on `<html>` in `index.html` |

## Built in

`initializeShell` also registers toggle-terminal, toggle-chat, toggle-sidebar
and the three theme commands, plus a default **View** menu. Pass
`defaultCommands: false` to own every id yourself.

## Verification

This example is typechecked by the repository's `tsconfig.examples.json` and
runs in CI on every push, so it cannot drift from the library API.
