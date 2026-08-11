import { useEffect, useState } from 'react';
import { Boxes, Files, GitBranch, Search } from 'lucide-react';
import {
  AppTitle,
  ConnectedModal,
  ShellLayout,
  TreeWidget,
  commandRegistry,
  componentRegistry,
  initializeShell,
  useLayoutStore,
  useModalStore,
  useStatusBarStore,
  type ITreeNode,
} from 'nexus-shell';

/**
 * The smallest complete Nexus Shell application.
 *
 * This is the shape every app on this library starts from: register the views
 * and commands you have, call `initializeShell` once, render `ShellLayout`.
 * Everything after that is another registration — the layout below never grows.
 */

/* -------------------------------------------------------------------------- */
/* 1. Views                                                                   */
/*                                                                            */
/* Registered by id, so the shell resolves them at render time and never has  */
/* to import them. This is what lets a plugin add a tab.                      */
/* -------------------------------------------------------------------------- */

const Welcome = () => (
  <div className="h-full grid place-items-center p-8 text-center">
    <div className="max-w-md">
      <h1 className="text-xl font-semibold text-foreground">Welcome to Nexus Shell</h1>
      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
        Drag this tab to split the workspace. Press{' '}
        <kbd className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded border border-border">
          ⌘⇧P
        </kbd>{' '}
        for the command palette, or{' '}
        <kbd className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded border border-border">
          ⌃`
        </kbd>{' '}
        for the terminal.
      </p>
    </div>
  </div>
);

const Editor = ({ file = 'untitled' }: { file?: string }) => (
  <div className="h-full p-6 font-mono text-xs overflow-auto">
    <p className="text-muted-foreground mb-3">// {file}</p>
    <pre className="text-foreground/90">{`export const hello = () => 'world';`}</pre>
  </div>
);

componentRegistry.register('welcome', Welcome);
componentRegistry.register('editor', Editor);

/* -------------------------------------------------------------------------- */
/* 2. A sidebar panel                                                         */
/* -------------------------------------------------------------------------- */

const FILES: ITreeNode[] = [
  {
    id: 'src',
    label: 'src',
    type: 'folder',
    isOpen: true,
    children: [
      { id: 'app', label: 'App.tsx', type: 'file' },
      { id: 'main', label: 'main.tsx', type: 'file' },
    ],
  },
  { id: 'pkg', label: 'package.json', type: 'file' },
];

/** Expansion lives on the nodes, so the toggle is the caller's. */
const toggleNode = (items: ITreeNode[], id: string): ITreeNode[] =>
  items.map((node) =>
    node.id === id
      ? { ...node, isOpen: !node.isOpen }
      : { ...node, children: node.children && toggleNode(node.children, id) },
  );

const FileExplorer = () => {
  const [nodes, setNodes] = useState<ITreeNode[]>(FILES);

  return (
    <TreeWidget
      data={nodes}
      onToggle={(node) => setNodes((current) => toggleNode(current, node.id))}
      // Opening a file is just another tab.
      onActivate={(node) =>
        node.type === 'file' &&
        useLayoutStore.getState().addTab('editor', node.label, { file: node.label })
      }
    />
  );
};

/* -------------------------------------------------------------------------- */
/* 3. Boot                                                                    */
/* -------------------------------------------------------------------------- */

initializeShell({
  panels: [
    { id: 'files', label: 'Explorer', icon: Files, component: FileExplorer },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      component: () => (
        <p className="p-4 text-sm text-muted-foreground">Nothing to search yet.</p>
      ),
    },
  ],

  commands: [
    {
      id: 'file.new',
      label: 'File: New File',
      keybinding: 'Control+n',
      execute: () => useLayoutStore.getState().addTab('editor', 'untitled'),
    },
    {
      id: 'app.ping',
      label: 'App: Ping',
      // Dialogs work from anywhere, including outside React.
      execute: () => useModalStore.getState().openAlert('Pong!', 'Ping'),
    },
  ],

  // Menu items dispatch by command id rather than holding a function, which is
  // what lets a plugin contribute one.
  menus: {
    File: [
      { id: 'file.new', label: 'New File', commandId: 'file.new' },
      { id: 'app.ping', label: 'Ping', commandId: 'app.ping' },
    ],
  },

  statusBar: [
    { id: 'branch', label: 'main', icon: GitBranch, alignment: 'left' },
    { id: 'position', label: 'Ln 1, Col 1', alignment: 'right' },
  ],
});

/* -------------------------------------------------------------------------- */
/* 4. Render                                                                  */
/* -------------------------------------------------------------------------- */

export default function App() {
  useEffect(() => {
    // Open something so the workspace isn't empty on first load.
    useLayoutStore.getState().addTab('welcome', 'Welcome');

    // Later registrations behave identically to those in initializeShell.
    commandRegistry.registerCommand({
      id: 'app.greet',
      label: 'App: Greet',
      execute: () => useModalStore.getState().openAlert('Hello from a late registration.'),
    });

    useStatusBarStore.getState().addWidget({
      id: 'greet',
      label: 'Greet',
      alignment: 'right',
      commandId: 'app.greet',
    });
  }, []);

  return (
    <>
      <ShellLayout
        title={<AppTitle title="Basic App" subtitle="Nexus Shell example" icon={<Boxes size={16} />} />}
      />
      {/* Mount once so useModalStore's promise-based dialogs have somewhere to render. */}
      <ConnectedModal />
    </>
  );
}
