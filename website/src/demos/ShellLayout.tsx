import { useState } from 'react';
import { Model } from 'flexlayout-react';
import { Bug, Files, GitBranch, Search } from 'lucide-react';
import {
  AppTitle,
  ShellLayout,
  ThemeSwitcher,
  TreeWidget,
  commandRegistry,
  componentRegistry,
  type ITreeNode,
} from 'nexus-shell';

/* -------------------------------------------------------------------------- */
/* Setup — registries                                                         */
/* -------------------------------------------------------------------------- */

const Editor = () => (
  <div className="h-full p-6 font-mono text-xs overflow-auto bg-background text-foreground">
    <div className="text-muted-foreground mb-3">// App.tsx</div>
    <pre className="text-foreground/90">{`export const App = () => (
  <ShellLayout title={<Logo />} />
);`}</pre>
  </div>
);

const Welcome = () => (
  <div className="h-full grid place-items-center text-center px-8 bg-background text-foreground">
    <div>
      <h2 className="text-lg font-semibold">Nexus Shell</h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm">
        Drag the tabs to split this workspace. Everything around the edges is a
        prop-driven component you can also use on its own.
      </p>
    </div>
  </div>
);

componentRegistry.register('editor', Editor);
componentRegistry.register('welcome', Welcome);

['file.new', 'file.save', 'view.terminal'].forEach((id) =>
  commandRegistry.registerCommand({ id, label: id, execute: () => console.log(id) }),
);

const FILES: ITreeNode[] = [
  {
    id: 'src',
    label: 'src',
    isBranch: true,
    kind: 'folder',
    isOpen: true,
    children: [
      { id: 'app', label: 'App.tsx', kind: 'file' },
      { id: 'main', label: 'main.tsx', kind: 'file' },
    ],
  },
  { id: 'pkg', label: 'package.json', kind: 'file' },
];

const toggleNode = (items: ITreeNode[], id: string): ITreeNode[] =>
  items.map((node) =>
    node.id === id
      ? { ...node, isOpen: !node.isOpen }
      : { ...node, children: node.children && toggleNode(node.children, id) },
  );

const FileExplorer = () => {
  const [nodes, setNodes] = useState<ITreeNode[]>(FILES);
  return <TreeWidget data={nodes} onToggle={(node) => setNodes(toggleNode(nodes, node.id))} />;
};

const model = () =>
  Model.fromJson({
    global: { tabEnableClose: true, tabSetEnableMaximize: true },
    borders: [],
    layout: {
      type: 'row',
      weight: 100,
      children: [
        {
          type: 'tabset',
          weight: 100,
          children: [
            { type: 'tab', name: 'Welcome', component: 'welcome' },
            { type: 'tab', name: 'App.tsx', component: 'editor' },
          ],
        },
      ],
    },
  });

/* -------------------------------------------------------------------------- */
/* Demo                                                                       */
/* -------------------------------------------------------------------------- */

// #region full
export const Full = () => {
  const [theme, setTheme] = useState('dark');

  return (
    <ShellLayout
      title={<AppTitle title="Acme Studio" subtitle="Workbench" icon={<Files size={16} />} />}
      rightMenuBarContent={<ThemeSwitcher value={theme} onChange={setTheme} />}
      // Panels become icons in the activity bar and render in the sidebar.
      panels={[
        { id: 'files', label: 'Explorer', icon: Files, component: FileExplorer },
        { id: 'search', label: 'Search', icon: Search, component: () => <div className="p-4 text-sm text-muted-foreground">Search panel.</div> },
        { id: 'scm', label: 'Source Control', icon: GitBranch, component: () => <div className="p-4 text-sm text-muted-foreground">No changes.</div> },
        { id: 'debug', label: 'Run and Debug', icon: Bug, component: () => <div className="p-4 text-sm text-muted-foreground">No configurations.</div> },
      ]}
      // Menu items dispatch by `commandId` rather than holding a function,
      // which is what lets plugins contribute entries.
      menuConfig={{
        File: [
          { id: 'new', label: 'New File', commandId: 'file.new' },
          { id: 'save', label: 'Save', commandId: 'file.save' },
        ],
        View: [{ id: 'terminal', label: 'Toggle Terminal', commandId: 'view.terminal' }],
      }}
      statusBarConfig={[
        { id: 'branch', label: 'main', icon: GitBranch, alignment: 'left' },
        { id: 'pos', label: 'Ln 1, Col 1', alignment: 'right' },
        { id: 'enc', label: 'UTF-8', alignment: 'right' },
      ]}
      layoutModel={model()}
    />
  );
};
// #endregion
