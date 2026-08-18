import { useState } from 'react';
import {
  ActivityBar,
  PropertyPanel,
  SettingsPanel,
  SidebarPane,
  TerminalPane,
  TreeWidget,
  type ITreeNode,
} from 'nexus-shell';
import { Files, Search, Sliders, Tags } from 'lucide-react';

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
  { id: 'readme', label: 'README.md', kind: 'file' },
];

const toggleNode = (items: ITreeNode[], id: string): ITreeNode[] =>
  items.map((node) =>
    node.id === id
      ? { ...node, isOpen: !node.isOpen }
      : { ...node, children: node.children && toggleNode(node.children, id) },
  );

// #region basic
export const Basic = () => {
  const [nodes, setNodes] = useState<ITreeNode[]>(FILES);

  // SidebarPane is a container: it owns the header, the close button and the
  // scroll behaviour, and nothing about what goes inside.
  return (
    <SidebarPane title="Explorer" onClose={() => alert('Closed')}>
      <TreeWidget data={nodes} onToggle={(node) => setNodes(toggleNode(nodes, node.id))} />
    </SidebarPane>
  );
};
// #endregion

// #region settings
export const WithSettings = () => {
  const [theme, setTheme] = useState('dark');

  return (
    <SidebarPane title="Settings" onClose={() => {}}>
      <SettingsPanel theme={theme} onThemeChange={setTheme} />
    </SidebarPane>
  );
};
// #endregion

// #region notClosable
export const NotClosable = () => (
  // Omitting `onClose` hides the close button, for a pane that is always open.
  <SidebarPane title="Outline" width="260px">
    <p className="p-4 text-sm text-muted-foreground">No close button on this one.</p>
  </SidebarPane>
);
// #endregion

// #region bothEdges
export const BothEdges = () => {
  const [left, setLeft] = useState<string | null>('files');
  const [right, setRight] = useState<string | null>('properties');

  const toggle = (current: string | null, set: (v: string | null) => void) => (id: string) =>
    set(current === id ? null : id);

  return (
    <div className="flex h-full bg-background">
      <ActivityBar
        items={[
          { id: 'files', label: 'Explorer', icon: Files },
          { id: 'search', label: 'Search', icon: Search },
        ]}
        activeId={left}
        onSelect={toggle(left, setLeft)}
      />

      {left && (
        <SidebarPane
          title={left === 'files' ? 'Explorer' : 'Search'}
          onClose={() => setLeft(null)}
        >
          {left === 'files' ? (
            <TreeWidget data={FILES} />
          ) : (
            <p className="p-4 text-xs text-muted-foreground">Search results…</p>
          )}
        </SidebarPane>
      )}

      <div className="grid flex-1 place-items-center text-xs text-muted-foreground">
        workspace
      </div>

      {/* The same component. Only `side` differs. */}
      {right && (
        <SidebarPane
          title={right === 'properties' ? 'Properties' : 'Tags'}
          side="right"
          width="280px"
          onClose={() => setRight(null)}
        >
          {right === 'properties' ? (
            <PropertyPanel
              subjects={[{ id: 'app', name: 'App.tsx', lines: 184, tracked: true }]}
              fields={[
                { key: 'name', label: 'Name' },
                { key: 'lines', label: 'Lines', type: 'number' },
                { key: 'tracked', label: 'Tracked', type: 'checkbox' },
              ]}
            />
          ) : (
            <p className="p-4 text-xs text-muted-foreground">No tags.</p>
          )}
        </SidebarPane>
      )}

      <ActivityBar
        side="right"
        items={[
          { id: 'properties', label: 'Properties', icon: Sliders },
          { id: 'tags', label: 'Tags', icon: Tags },
        ]}
        bottomItems={[]}
        activeId={right}
        onSelect={toggle(right, setRight)}
        aria-label="Inspector Bar"
      />
    </div>
  );
};
// #endregion

// #region allEdges
export const AllEdges = () => (
  // One component, three edges. Each keeps its own open panel, so nothing has
  // to close for something else to open.
  <div className="flex h-full bg-background">
    <SidebarPane title="Explorer" width="220px" onClose={() => {}}>
      <TreeWidget data={FILES} />
    </SidebarPane>

    <div className="flex min-w-0 flex-1 flex-col">
      <div className="grid flex-1 place-items-center text-xs text-muted-foreground">
        workspace
      </div>
      {/* The drawer lives inside the workspace column, so it spans the docking
          area only — not the full window under the side panes. */}
      <SidebarPane title="Terminal" side="bottom" height="150px" onClose={() => {}}>
        <TerminalPane history={['$ npm test', '363 passed']} />
      </SidebarPane>
    </div>

    <SidebarPane title="Properties" side="right" width="260px" onClose={() => {}}>
      <PropertyPanel
        subjects={[{ id: 'app', name: 'App.tsx', lines: 184, tracked: true }]}
        fields={[
          { key: 'name', label: 'Name' },
          { key: 'lines', label: 'Lines', type: 'number' },
          { key: 'tracked', label: 'Tracked', type: 'checkbox' },
        ]}
      />
    </SidebarPane>
  </div>
);
// #endregion
