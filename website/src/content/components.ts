/**
 * The component gallery, as data.
 *
 * Each entry names a demo file, and each demo names an exported component plus
 * the `#region` marker that wraps its source. `ComponentPage` renders all of
 * them, so adding a component to the site is one entry here plus a demo file —
 * there is no per-component page to keep in sync.
 */

export interface DemoEntry {
  /** Exported component name in the demo file. */
  export: string;
  /** `#region` marker wrapping this demo's source. Defaults to the export name. */
  region?: string;
  title: string;
  description: string;
  /** Drop the preview's padding — for bars, rails and docked panes. */
  flush?: boolean;
  /** Fixed preview height, as a CSS length. */
  height?: string;
}

export interface ComponentEntry {
  /** URL segment, e.g. `/components/status-bar`. */
  slug: string;
  /** Component name, matching the generated API entry. */
  name: string;
  /** One line shown in the sidebar and on the index card. */
  tagline: string;
  category: string;
  /** File under `src/demos/`, without the extension. */
  demoFile: string;
  demos: DemoEntry[];
  /** Extra prose rendered above the demos. Markdown-ish: `code` spans only. */
  notes?: string[];
}

export const CATEGORIES = [
  'Shell',
  'Graph',
  'Properties',
  'Chrome',
  'Data',
  'Overlays',
  'Search',
  'Panels',
  'Identity',
] as const;

export const COMPONENTS: ComponentEntry[] = [
  /* ------------------------------------------------------------------ Shell */
  {
    slug: 'shell-layout',
    name: 'ShellLayout',
    tagline: 'The complete application frame — start here',
    category: 'Shell',
    demoFile: 'ShellLayout',
    notes: [
      '**This is where an application starts.** Call `initializeShell` once to register your commands, menus and panels, render this component, and add features by registering them rather than by restructuring the layout.',
      'Tab contents resolve through the `componentRegistry`, so a new view is a registration and a menu entry — the shell never has to import it. That is what lets plugins and distant code contribute to an app they know nothing about.',
      'Configuration can arrive as props or through `initializeShell`; both write to the same stores. Props suit values that change with your state, `initializeShell` suits the fixed set, since it runs once and works outside React.',
    ],
    demos: [
      {
        export: 'Full',
        region: 'full',
        title: 'A configured workbench',
        description:
          'Menu bar, activity bar, sidebar, docking area, terminal, chat pane and status bar. Drag the tabs to split the workspace.',
        flush: true,
        height: '560px',
      },
    ],
  },

  /* ------------------------------------------------------------------ Graph */
  {
    slug: 'graph-canvas',
    name: 'GraphCanvas',
    tagline: 'The infinite field a graph is drawn on',
    category: 'Graph',
    demoFile: 'Graph',
    notes: [
      'The canvas owns exactly one thing: the mapping between screen pixels and graph space. It knows nothing about nodes, edges, or what any of it means — children render inside a transformed layer, so anything positioned in graph coordinates lands in the right place.',
      'Drag empty space to pan, wheel or pinch to zoom. Zoom is always anchored to the cursor, because anything else feels wrong to use. Hold space to pan from anywhere, including over a node.',
      'Viewport state is internal by default — you should not have to own pan and zoom just to draw a graph. Pass `viewport` to take control.',
    ],
    demos: [
      {
        export: 'CanvasOnly',
        region: 'canvas',
        title: 'Pan and zoom',
        description: 'Drag to pan, wheel or pinch to zoom. The two cards are plain absolutely-positioned divs in graph coordinates.',
        flush: true,
        height: '400px',
      },
    ],
  },
  {
    slug: 'graph-node',
    name: 'GraphNode',
    tagline: 'A positioned, focusable node with edge ports',
    category: 'Graph',
    demoFile: 'Graph',
    notes: [
      'Provides placement, dragging, selection and focus affordances, and the four edge ports. What the node *contains* is entirely yours — pass any children.',
      'Fully controlled: dragging reports positions through `onMove` but never moves the node itself, so snapping, constraints and undo stay in your hands.',
      '`focused` and `selected` are deliberately separate. Focus is where the next keystroke lands; selection is what an action applies to. A keyboard-driven editor needs both visible at once.',
    ],
    demos: [
      {
        export: 'NodesAndEdges',
        region: 'nodesAndEdges',
        title: 'Nodes, edges and dragging',
        description: 'Drag a node — the edges re-route themselves. Which sides they attach to comes from relative position, so a node needs no handle configuration to be connectable.',
        flush: true,
        height: '420px',
      },
    ],
  },
  {
    slug: 'graph-edge',
    name: 'GraphEdge',
    tagline: 'A directed edge with pluggable routing',
    category: 'Graph',
    demoFile: 'Graph',
    notes: [
      'Rendered as an SVG path inside `GraphEdgeLayer`, which provides the surface and the shared arrowhead. Three routings ship: `bezier` for dense graphs, `smoothstep` for flowcharts, `straight` for the literal case.',
    ],
    demos: [
      {
        export: 'EdgeRouting',
        region: 'routing',
        title: 'Routing strategies',
        description: 'Switch routing, then drag either node to see how attachment sides are chosen.',
        flush: true,
        height: '400px',
      },
    ],
  },
  {
    slug: 'graph-keyboard',
    name: 'useGraphKeyboard',
    tagline: 'Keyboard-driven navigation and editing',
    category: 'Graph',
    demoFile: 'Graph',
    notes: [
      '**A graph editor that needs a mouse is only half an editor.** This hook owns the focus, editing and connection cursors and reports what should happen — it renders nothing and mutates nothing, so it works with `GraphNode` or with your own node rendering.',
      'Arrow traversal is spatial rather than by insertion order: it picks the nearest node in the direction travelled, penalising lateral offset. That is what makes a hand-arranged diagram navigable without a pointer.',
      'Arrows move focus · Shift+Arrows nudge · Tab creates a connected node · Enter edits · `c` then Enter connects · Delete removes · Escape backs out one level.',
    ],
    demos: [
      {
        export: 'KeyboardEditor',
        region: 'keyboard',
        title: 'Build a graph without touching the mouse',
        description:
          'Click the canvas once to focus it, then use only the keyboard. Press an arrow to take focus, Tab to create a connected node, type a name, Enter to commit.',
        flush: true,
        height: '460px',
      },
    ],
  },
  {
    slug: 'graph-layout',
    name: 'useGraphLayout',
    tagline: 'Auto layout engines, and the escape back to hand placement',
    category: 'Graph',
    demoFile: 'Graph',
    notes: [
      'A layout is a pure `(nodes, edges) => nodes` function. Three ship — `vertical`, `horizontal` and `grid` — and any function of that shape can be registered alongside or instead.',
      'There are two kinds of mode. Under an **auto layout** positions come from the engine, and your stored positions are read but never written, so switching back to `freeform` restores the arrangement you had. Under **`freeform`** positions are exactly yours.',
      '**Dragging a node under an auto layout escapes to freeform.** That is what makes auto layout usable in an editor rather than merely a viewer: you can always grab a node, and the graph stops rearranging itself the moment you do. Pass `escapeOnDrag: false` for a derived visualisation where a stray drag should be ignored.',
      '`bake()` returns the computed positions so you can write them back — useful for arranging automatically once, then continuing by hand from there.',
    ],
    demos: [
      {
        export: 'AutoLayout',
        region: 'layout',
        title: 'Switching layouts, and dragging out of one',
        description:
          'Switch between the three engines, then drag any node — the mode drops to freeform and the node stays put. Bake writes the computed positions back so hand editing continues from the laid-out arrangement.',
        flush: true,
        height: '520px',
      },
    ],
  },
  {
    slug: 'graph-minimap',
    name: 'GraphMiniMap',
    tagline: 'A scaled overview with a viewport indicator',
    category: 'Graph',
    demoFile: 'Graph',
    notes: [
      'Click anywhere to jump there, drag to pan continuously, or focus it and use the arrow keys. Zoom is never changed — a minimap answers "where am I", and changing scale on a click makes that answer harder to trust.',
      'The plotted extent is the union of the graph bounds and the current viewport, so the indicator stays visible even when you have panned far away from every node. Without that, panning into empty space makes the minimap look broken.',
      'It needs `canvasSize` to know how much of the graph is on screen — take it from `GraphCanvas`’s `onSizeChange`.',
    ],
    demos: [
      {
        export: 'MiniMap',
        region: 'minimap',
        title: 'Navigating a large graph',
        description:
          'Click or drag inside the minimap to move the canvas, or pan the canvas and watch the indicator follow. Nodes are coloured by the app’s own `kind`; clicking one highlights it in the overview.',
        flush: true,
        height: '480px',
      },
    ],
  },
  {
    slug: 'node-palette',
    name: 'NodePalette',
    tagline: 'Drag-to-create, and keyboard-to-create',
    category: 'Graph',
    demoFile: 'Graph',
    notes: [
      'Carries only the item’s `kind` on the drag; what a node of that kind actually is gets decided by your drop handler. Pair it with `readPaletteDrag` on the canvas.',
      'Every item is a real button, so the palette works without a pointer — a drag-only palette is unreachable for keyboard users.',
      '**Orientation** is `horizontal`, `vertical` or `auto`. Auto measures the space its container gives it and picks a row if the items fit the width, otherwise a column if they fit the height, otherwise a wrapping row. A container that shrink-wraps the palette says nothing about available room, so auto measures the nearest ancestor with a size of its own — which is also what stops a vertical palette narrowing its own container and never discovering it has room to go back.',
    ],
    demos: [
      {
        export: 'DragToCreate',
        region: 'palette',
        title: 'Drag a type onto the canvas',
        description: 'Drag an entry onto the field, or click one to place it. The node lands at the correct graph-space position whatever the pan and zoom.',
        flush: true,
        height: '440px',
      },
      {
        export: 'PaletteOrientations',
        region: 'orientation',
        title: 'Fitting the space available',
        description:
          'The same palette in a narrow rail and a wide strip. Auto reports the axis it settled on, so surrounding layout can follow. The third is explicitly vertical with icons only, for the narrowest rails.',
        flush: true,
        height: '360px',
      },
    ],
  },

  /* ------------------------------------------------------------- Properties */
  {
    slug: 'property-panel',
    name: 'PropertyPanel',
    tagline: 'An inspector for whatever is selected',
    category: 'Properties',
    demoFile: 'Properties',
    notes: [
      'Give it the selection and a list of field descriptors. It reads each property across every subject, renders the matching field, and hands back new copies on edit — it holds no state and mutates nothing.',
      '**Three selection states are handled for you: none, one, and several.** The last is the one hand-rolled inspectors usually skip. Where subjects agree the field edits all of them at once; where they disagree it shows *Mixed* rather than one subject’s value, because showing one as if it were everyone’s is how a multi-selection edit silently flattens data.',
      'Field types come from a registry, exactly like `TreeWidget.actions` and `useGraphLayout.layouts`. Spread `BUILT_IN_FIELD_TYPES` to add your own, or replace an entry to change how a type renders everywhere.',
      'A field’s `when` hides it for the current selection — a property that only applies to one node kind — and `validate` returns a message shown under the control.',
      '`key` is a dotted path, so `data.label` reaches into a node’s payload without an accessor. Pass `get` and `set` for anything a path cannot express.',
    ],
    demos: [
      {
        export: 'GraphInspector',
        region: 'inspector',
        title: 'Node properties, beside the graph',
        description:
          'Click a node to inspect it, shift-click to select several. The panel is the same component in both cases — nothing about it is graph-specific.',
        flush: true,
        height: '520px',
      },
      {
        export: 'MultiSelect',
        region: 'panel',
        title: 'Editing several subjects at once',
        description:
          'Tick more than one. Colour and Due agree, so they edit together; Label, Notes and Tags disagree and say so. Resolved disappears entirely once the selection is not all questions.',
        flush: true,
        height: '520px',
      },
      {
        export: 'CustomFieldType',
        region: 'custom',
        title: 'Registering a field type',
        description:
          'A rating control the library knows nothing about, wearing the same label, description and Mixed treatment as the built-ins.',
        height: '420px',
      },
    ],
  },
  {
    slug: 'property-fields',
    name: 'TextField',
    tagline: 'The composable field primitives',
    category: 'Properties',
    demoFile: 'Properties',
    notes: [
      'Nine fields ship: `TextField`, `TextAreaField`, `SelectField`, `CheckboxField`, `NumberField`, `ColorField`, `DateField`, `TagField` and `StaticField`. Each is an ordinary controlled component — pass `value`, get `onChange` — so they work with or without `PropertyPanel`.',
      'Every one accepts `mixed`, for a selection that disagrees. A mixed field shows a placeholder rather than a value; a mixed checkbox renders indeterminate, since neither on nor off is honest.',
      'Small decisions worth knowing: `NumberField` reports nothing for an emptied box rather than coercing to zero, `DateField` carries an ISO string rather than a `Date` so it round-trips through JSON, and `TagField` rejects blanks and duplicates silently — neither is a mistake worth interrupting for.',
      '`FieldShell` is exported too. It is the label, description, error and *Mixed* frame the built-ins use, so a bespoke control lines up with them without copying their markup.',
    ],
    demos: [
      {
        export: 'Fields',
        region: 'fields',
        title: 'Every field',
        description: 'All nine, wired to local state. Each works on its own.',
        height: '620px',
      },
    ],
  },

  /* ----------------------------------------------------------------- Chrome */
  {
    slug: 'menu-bar',
    name: 'MenuBar',
    tagline: 'Application menus with submenus and content slots',
    category: 'Chrome',
    demoFile: 'MenuBar',
    notes: [
      'Menus come in as data and selections go out through `onSelect`. The bar reads no registry — see `ConnectedMenuBar` for the variant wired to `menuRegistry`.',
    ],
    demos: [
      {
        export: 'Basic',
        region: 'basic',
        title: 'Menus and submenus',
        description: 'Hover a menu to open it. Items with a `submenu` are not themselves selectable.',
        flush: true,
      },
      {
        export: 'WithSlots',
        region: 'slots',
        title: 'Branding, search and actions',
        description:
          'Three slots: `title` at the left, `center` sized for a search field, and `right` for actions. Providing `title` switches the bar to its taller variant.',
        flush: true,
        height: '220px',
      },
    ],
  },
  {
    slug: 'activity-bar',
    name: 'ActivityBar',
    tagline: 'The vertical icon rail for switching panels',
    category: 'Chrome',
    demoFile: 'ActivityBar',
    demos: [
      {
        export: 'Basic',
        region: 'basic',
        title: 'Selecting a panel',
        description:
          'Controlled — it holds no selection state, so clicking the active item to deselect is your decision, not the component’s.',
        flush: true,
        height: '320px',
      },
      {
        export: 'WithSidebar',
        region: 'withSidebar',
        title: 'Paired with a sidebar',
        description: 'The usual arrangement: the rail picks which pane the sidebar shows.',
        flush: true,
        height: '360px',
      },
      {
        export: 'BottomItems',
        region: 'bottomItems',
        title: 'Custom bottom group',
        description: '`bottomItems` replaces the default Settings item. Pass `[]` to remove the group.',
        flush: true,
        height: '320px',
      },
    ],
  },
  {
    slug: 'sidebar-pane',
    name: 'SidebarPane',
    tagline: 'Titled, closable container for sidebar content',
    category: 'Chrome',
    demoFile: 'SidebarPane',
    demos: [
      {
        export: 'Basic',
        region: 'basic',
        title: 'Any content',
        description: 'A pure container — it owns the header, close button and scrolling, and nothing about what goes inside.',
        flush: true,
        height: '340px',
      },
      {
        export: 'WithSettings',
        region: 'settings',
        title: 'The settings panel',
        description: '`SettingsPanel` is a separate component so the pane itself stays generic.',
        flush: true,
        height: '300px',
      },
      {
        export: 'NotClosable',
        region: 'notClosable',
        title: 'Without a close button',
        description: 'Omitting `onClose` hides the button entirely.',
        flush: true,
        height: '220px',
      },
    ],
  },
  {
    slug: 'status-bar',
    name: 'StatusBar',
    tagline: 'Footer with left, center and right item groups',
    category: 'Chrome',
    demoFile: 'StatusBar',
    demos: [
      {
        export: 'Basic',
        region: 'basic',
        title: 'Three alignment groups',
        description: 'Items are grouped by `alignment` and sorted by descending `priority` within each group.',
        flush: true,
      },
      {
        export: 'Interactive',
        region: 'interactive',
        title: 'Interactive items',
        description:
          'An item with an `onClick` becomes a keyboard-focusable button. Without one it renders as a static label.',
        flush: true,
      },
      {
        export: 'Styled',
        region: 'styled',
        title: 'Per-item accents',
        description: 'The `className` on an item is merged onto it, so status colours are yours to set.',
        flush: true,
      },
      {
        export: 'Priority',
        region: 'priority',
        title: 'Ordering by priority',
        description: 'Declaration order does not matter; higher `priority` sorts earlier.',
        flush: true,
      },
    ],
  },
  {
    slug: 'app-title',
    name: 'AppTitle',
    tagline: 'Branding lockup for the menu bar',
    category: 'Chrome',
    demoFile: 'Misc',
    demos: [
      {
        export: 'AppTitleBasic',
        region: 'appTitle',
        title: 'Variations',
        description:
          'Purely presentational. The library supplies no default copy — pass whatever branding your app needs.',
      },
    ],
  },

  /* ------------------------------------------------------------------- Data */
  {
    slug: 'tree-widget',
    name: 'TreeWidget',
    tagline: 'Virtualised tree for any hierarchy',
    category: 'Data',
    demoFile: 'TreeWidget',
    notes: [
      '**This is not a file explorer.** The component knows about branches and leaves and nothing else — an org chart, a scene graph, a category picker and an argument map are all the same shape here.',
      '`isBranch` is the only structural concept: branches expand and accept drops, leaves do neither. `kind` is your own vocabulary, which the library never interprets — it exists so context-menu actions can target your node types through `showFor`. Icons are per-node, so nothing file-shaped ships in the component.',
      'Expansion lives on your nodes as `isOpen` and changes are reported through `onToggle`, so the tree never holds a second copy of your data.',
    ],
    demos: [
      {
        export: 'OrgChart',
        region: 'orgChart',
        title: 'An org chart',
        description:
          'Three levels, three node kinds, and a context menu that differs by kind. Right-click a department, then a person.',
        flush: true,
        height: '360px',
      },
      {
        export: 'ArgumentMap',
        region: 'argumentMap',
        title: 'An argument map',
        description:
          'Questions, ideas, pros and cons. Nothing here is a file, and the component does not care.',
        flush: true,
        height: '340px',
      },
      {
        export: 'FileExplorer',
        region: 'fileExplorer',
        title: 'A file explorer',
        description:
          'The familiar case, built the same way as the others — the folder and file icons come from the app, not the library.',
        flush: true,
        height: '360px',
      },
      {
        export: 'DragToMove',
        region: 'dragToMove',
        title: 'Drag to move',
        description: 'Only branches accept drops. Reparenting is yours to perform.',
        flush: true,
        height: '340px',
      },
      {
        export: 'LargeTree',
        region: 'large',
        title: '5,000 nodes',
        description: 'Rows are virtualised via react-virtuoso, so large trees stay responsive.',
        flush: true,
        height: '340px',
      },
    ],
  },
  {
    slug: 'data-grid',
    name: 'DataGrid',
    tagline: 'Sortable, filterable table with virtualisation',
    category: 'Data',
    demoFile: 'DataGrid',
    demos: [
      {
        export: 'Basic',
        region: 'basic',
        title: 'Sort, filter and select',
        description:
          'Click a sortable header to sort; type in the filter box to match across all values. Both run internally against the `data` you pass.',
        flush: true,
        height: '420px',
      },
      {
        export: 'ServerSide',
        region: 'noFilter',
        title: 'Server-side filtering',
        description: 'Filtering upstream? Turn off the built-in box so the page does not show two.',
        flush: true,
        height: '260px',
      },
      {
        export: 'Loading',
        region: 'loading',
        title: 'Loading and empty states',
        description: 'A spinner replaces the rows while `loading`; `placeholder` covers the empty case.',
        flush: true,
        height: '240px',
      },
    ],
  },

  /* --------------------------------------------------------------- Overlays */
  {
    slug: 'modal',
    name: 'Modal',
    tagline: 'Alert, confirm and prompt dialogs',
    category: 'Overlays',
    demoFile: 'Modal',
    notes: [
      'Escape, backdrop click and the close button all route to `onCancel`; Enter routes to `onConfirm`.',
      'For a promise-based API you can `await` from anywhere — including outside React — mount `<ConnectedModal />` once and call `useModalStore.getState().openConfirm(…)`.',
    ],
    demos: [
      {
        export: 'Prompt',
        region: 'prompt',
        title: 'Prompt',
        description: 'Adds a text input, autofocused and selected. `onConfirm` receives its value.',
      },
      {
        export: 'Confirm',
        region: 'confirm',
        title: 'Confirm',
        description: 'Two buttons, with overridable labels for when "Confirm" is too vague.',
      },
      {
        export: 'Alert',
        region: 'alert',
        title: 'Alert',
        description: 'A single button. Newlines in `message` are preserved.',
      },
    ],
  },
  {
    slug: 'command-palette',
    name: 'CommandPalette',
    tagline: 'Filterable, keyboard-navigable command list',
    category: 'Overlays',
    demoFile: 'CommandPalette',
    notes: [
      'Arrow keys move the highlight, Enter selects, Escape closes. The component binds no global shortcut — `ConnectedCommandPalette` adds `Cmd/Ctrl+Shift+P` and reads the command registry.',
    ],
    demos: [
      {
        export: 'Inline',
        region: 'inline',
        title: 'Inline',
        description: 'Rendered in place rather than as a fullscreen overlay, so it can be documented here.',
      },
      {
        export: 'Overlay',
        region: 'overlay',
        title: 'As an overlay',
        description: 'How it appears in a real app: dimmed backdrop, dismissed with Escape.',
      },
      {
        export: 'CustomFilter',
        region: 'customFilter',
        title: 'Custom matching',
        description: 'Replace the default substring match with fuzzy, scored, or remote matching.',
      },
    ],
  },
  {
    slug: 'context-menu',
    name: 'ContextMenu',
    tagline: 'Floating menu at viewport coordinates',
    category: 'Overlays',
    demoFile: 'Misc',
    demos: [
      {
        export: 'ContextMenuBasic',
        region: 'contextMenu',
        title: 'Right-click menu',
        description:
          'Closes on outside click and on Escape. It does not decide when to appear — you capture the coordinates and mount it conditionally.',
      },
    ],
  },

  /* ----------------------------------------------------------------- Search */
  {
    slug: 'quick-search',
    name: 'QuickSearch',
    tagline: 'Compact search field with grouped results',
    category: 'Search',
    demoFile: 'QuickSearch',
    notes: [
      'It does no filtering. Results are pushed in via `results`, which is what lets the same component back a local array, a registry lookup, or a remote index.',
    ],
    demos: [
      {
        export: 'Basic',
        region: 'basic',
        title: 'Grouped results',
        description: 'Arrow keys move the highlight across group boundaries; Enter selects.',
        height: '380px',
      },
      {
        export: 'FilteredCategories',
        region: 'categories',
        title: 'Category order and whitelist',
        description: '`categories` sets the group order and drops anything not listed.',
        height: '320px',
      },
    ],
  },
  {
    slug: 'search-widget',
    name: 'SearchWidget',
    tagline: 'Full-height search panel for the sidebar',
    category: 'Search',
    demoFile: 'SearchWidget',
    demos: [
      {
        export: 'Basic',
        region: 'basic',
        title: 'Async search',
        description:
          '`onSearch` is debounced by 300ms. The widget never filters `results` itself, so remote search needs no special handling.',
        flush: true,
        height: '420px',
      },
    ],
  },

  /* ----------------------------------------------------------------- Panels */
  {
    slug: 'chat-pane',
    name: 'ChatPane',
    tagline: 'Docked transcript with slash-command autocomplete',
    category: 'Panels',
    demoFile: 'ChatPane',
    demos: [
      {
        export: 'Basic',
        region: 'basic',
        title: 'Sending messages',
        description: 'Type a message and press Enter. Type `/` to trigger the command list.',
        flush: true,
        height: '440px',
      },
      {
        export: 'NamedAuthors',
        region: 'authors',
        title: 'Multi-agent transcripts',
        description: '`author` overrides the label above a bubble.',
        flush: true,
        height: '360px',
      },
      {
        export: 'EmptyState',
        region: 'empty',
        title: 'Custom empty state',
        description: 'Replace the default placeholder with your own node.',
        flush: true,
        height: '360px',
      },
    ],
  },
  {
    slug: 'terminal-pane',
    name: 'TerminalPane',
    tagline: 'Bottom-docked terminal log and input',
    category: 'Panels',
    demoFile: 'TerminalPane',
    notes: [
      'The component does not echo commands or interpret them. `clear`, `help` and anything app-specific stay yours — which is what makes it equally usable for a shell, a REPL, or a log viewer.',
    ],
    demos: [
      {
        export: 'Basic',
        region: 'basic',
        title: 'A working shell',
        description: 'This demo implements `help`, `echo` and `clear` itself. Try them.',
        flush: true,
        height: '300px',
      },
      {
        export: 'CustomPrompt',
        region: 'customPrompt',
        title: 'A different prompt',
        description: '`title` and `prompt` are overridable, so it need not look like bash.',
        flush: true,
        height: '260px',
      },
    ],
  },

  /* --------------------------------------------------------------- Identity */
  {
    slug: 'user-profile',
    name: 'UserProfile',
    tagline: 'Avatar and identity widget with a dropdown',
    category: 'Identity',
    demoFile: 'Misc',
    demos: [
      {
        export: 'UserProfileBasic',
        region: 'userProfile',
        title: 'With a menu',
        description:
          'Click to open. The component prescribes no menu items — "Sign Out" and "Account Settings" mean different things in every app.',
        height: '300px',
      },
      {
        export: 'UserProfileCompact',
        region: 'userProfileCompact',
        title: 'Avatar only',
        description: '`showName={false}` for a tight menu bar.',
        height: '260px',
      },
    ],
  },
  {
    slug: 'settings-panel',
    name: 'SettingsPanel',
    tagline: 'Theme picker body for the settings sidebar',
    category: 'Identity',
    demoFile: 'Misc',
    demos: [
      {
        export: 'SettingsPanelBasic',
        region: 'settingsPanel',
        title: 'Default themes',
        description: 'Every theme bundled in the library stylesheet, listed with its full label.',
      },
      {
        export: 'SettingsPanelCustom',
        region: 'settingsPanelCustom',
        title: 'Your own themes',
        description: 'Supply `themes` when your app ships more than the bundled three.',
      },
    ],
  },
  {
    slug: 'theme-switcher',
    name: 'ThemeSwitcher',
    tagline: 'Compact segmented theme control',
    category: 'Identity',
    demoFile: 'Misc',
    demos: [
      {
        export: 'ThemeSwitcherBasic',
        region: 'themeSwitcher',
        title: 'Controlled',
        description:
          'It renders `value` and reports changes, applying nothing to the document. `ConnectedThemeSwitcher` binds it to the theme store, which also sets the class on `<html>`.',
      },
      {
        export: 'ThemeSwitcherCustom',
        region: 'themeSwitcherCustom',
        title: 'Custom options',
        description: '`options` replaces the default set entirely.',
      },
    ],
  },
];

export const componentBySlug = (slug: string): ComponentEntry | undefined =>
  COMPONENTS.find((c) => c.slug === slug);

export const componentsByCategory = () =>
  CATEGORIES.map((category) => ({
    category,
    items: COMPONENTS.filter((c) => c.category === category),
  })).filter((group) => group.items.length > 0);
