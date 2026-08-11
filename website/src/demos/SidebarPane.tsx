import { useState } from 'react';
import { SettingsPanel, SidebarPane, TreeWidget, type ITreeNode } from 'nexus-shell';

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
  { id: 'readme', label: 'README.md', type: 'file' },
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
