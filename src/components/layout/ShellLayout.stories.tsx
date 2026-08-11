import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Model } from 'flexlayout-react';
import { Bug, Files, GitBranch, Search } from 'lucide-react';

import { ShellLayout } from './ShellLayout';
import { ThemeSwitcher } from '../widgets/ThemeSwitcher';
import { TreeWidget, type ITreeNode } from '../widgets/TreeWidget';
import { componentRegistry } from '../../core/registry/ComponentRegistry';
import { commandRegistry } from '../../core/registry/CommandRegistry';

// ---------------------------------------------------------------------------
// Fixtures
//
// ShellLayout resolves tab contents through the componentRegistry, so a story
// has to register the components its layout model refers to. Registration is
// idempotent here because the registry warns rather than throws on duplicates.
// ---------------------------------------------------------------------------

const Editor = ({ file = 'App.tsx' }: { file?: string }) => (
  <div className="h-full p-6 font-mono text-xs overflow-auto">
    <div className="text-muted-foreground mb-3">// {file}</div>
    <pre className="text-foreground/90">{`export const App = () => {
  return <ShellLayout title={<Logo />} />;
};`}</pre>
  </div>
);

const Welcome = () => (
  <div className="h-full flex flex-col items-center justify-center text-center gap-2">
    <h2 className="text-lg font-semibold">Nexus Shell</h2>
    <p className="text-sm text-muted-foreground max-w-sm">
      Drag tabs to split the workspace. Everything around the edges is a
      prop-driven component you can also use on its own.
    </p>
  </div>
);

componentRegistry.register('editor', Editor);
componentRegistry.register('welcome', Welcome);

['file.save', 'file.new', 'view.terminal'].forEach((id) =>
  commandRegistry.registerCommand({
    id,
    label: id,
    keybinding: undefined,
    execute: () => console.log(`executed ${id}`),
  }),
);

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

const FileExplorer = () => {
  const [nodes, setNodes] = useState(FILES);
  const toggle = (items: ITreeNode[], id: string): ITreeNode[] =>
    items.map((n) =>
      n.id === id
        ? { ...n, isOpen: !n.isOpen }
        : { ...n, children: n.children && toggle(n.children, id) },
    );
  return <TreeWidget data={nodes} onToggle={(n) => setNodes(toggle(nodes, n.id))} />;
};

const PANELS = [
  { id: 'files', label: 'Explorer', icon: Files, component: FileExplorer },
  { id: 'search', label: 'Search', icon: Search, component: () => <div className="p-4 text-sm text-muted-foreground">Search panel.</div> },
  { id: 'scm', label: 'Source Control', icon: GitBranch, component: () => <div className="p-4 text-sm text-muted-foreground">No changes.</div> },
  { id: 'debug', label: 'Run and Debug', icon: Bug, component: () => <div className="p-4 text-sm text-muted-foreground">No configurations.</div> },
];

const MENU_CONFIG = {
  File: [
    { id: 'new', label: 'New File', commandId: 'file.new' },
    { id: 'save', label: 'Save', commandId: 'file.save' },
  ],
  View: [{ id: 'terminal', label: 'Toggle Terminal', commandId: 'view.terminal' }],
};

const STATUS_BAR = [
  { id: 'branch', label: 'main', icon: GitBranch, alignment: 'left' as const },
  { id: 'pos', label: 'Ln 1, Col 1', alignment: 'right' as const },
  { id: 'enc', label: 'UTF-8', alignment: 'right' as const },
];

/** A fresh docking model, so stories don't inherit each other's layout state. */
const makeModel = (tabs: { name: string; component: string }[]) =>
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
          children: tabs.map((t) => ({ type: 'tab', ...t, enableClose: true })),
        },
      ],
    },
  });

const meta = {
  title: 'Layout/ShellLayout',
  component: ShellLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The complete application shell. This is the batteries-included composition: it registers whatever you pass into the shell stores on mount, then renders the `Connected*` component variants that read from those stores. Tab contents resolve through the `componentRegistry`, so plugins can contribute views without the shell importing them.\n\nIf you want the pieces without the wiring, import the individual components and compose them yourself — every one is prop-driven and works standalone.',
      },
    },
  },
  argTypes: {
    layoutModel: { control: false },
  },
} satisfies Meta<typeof ShellLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The full shell, fully configured. */
export const Default: Story = {
  args: {
    panels: PANELS,
    menuConfig: MENU_CONFIG,
    statusBarConfig: STATUS_BAR,
    layoutModel: makeModel([
      { name: 'Welcome', component: 'welcome' },
      { name: 'App.tsx', component: 'editor' },
    ]),
  },
};

/** With no configuration at all: the frame, and nothing registered into it. */
export const Bare: Story = {
  args: {
    layoutModel: makeModel([{ name: 'Welcome', component: 'welcome' }]),
  },
};

/** `title` switches the menu bar to its taller variant; `rightMenuBarContent` fills the right slot. */
export const Branded: Story = {
  args: {
    panels: PANELS,
    menuConfig: MENU_CONFIG,
    statusBarConfig: STATUS_BAR,
    layoutModel: makeModel([{ name: 'App.tsx', component: 'editor' }]),
  },
  render: function Render(args) {
    const [theme, setTheme] = useState('light');
    return (
      <ShellLayout
        {...args}
        title={
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary" />
            <span className="font-semibold text-sm">Acme Studio</span>
          </div>
        }
        rightMenuBarContent={<ThemeSwitcher value={theme} onChange={setTheme} />}
      />
    );
  },
};

/** A split workspace, showing the docking area with two tabsets. */
export const SplitWorkspace: Story = {
  args: {
    panels: PANELS,
    menuConfig: MENU_CONFIG,
    statusBarConfig: STATUS_BAR,
    layoutModel: Model.fromJson({
      global: { tabEnableClose: true },
      borders: [],
      layout: {
        type: 'row',
        weight: 100,
        children: [
          {
            type: 'tabset',
            weight: 50,
            children: [{ type: 'tab', name: 'App.tsx', component: 'editor' }],
          },
          {
            type: 'tabset',
            weight: 50,
            children: [{ type: 'tab', name: 'Welcome', component: 'welcome' }],
          },
        ],
      },
    }),
  },
};
