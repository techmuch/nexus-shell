import { TreeWidget, ITreeNode } from "./TreeWidget"

const sampleData: ITreeNode[] = [
  {
    id: 'src',
    label: 'src',
    type: 'folder',
    isOpen: true,
    children: [
      {
        id: 'core',
        label: 'core',
        type: 'folder',
        isOpen: true,
        children: [
          { id: 'boot', label: 'Boot.ts', type: 'file' },
          { id: 'registry', label: 'registry', type: 'folder' },
        ]
      },
      {
        id: 'components',
        label: 'components',
        type: 'folder',
        children: [
          { id: 'layout', label: 'layout', type: 'folder' },
          { id: 'widgets', label: 'widgets', type: 'folder' },
        ]
      },
      { id: 'app', label: 'App.tsx', type: 'file' },
      { id: 'main', label: 'main.tsx', type: 'file' },
    ]
  },
  { id: 'package', label: 'package.json', type: 'file' },
  { id: 'readme', label: 'README.md', type: 'file' },
]

export const FilesSidebar = () => {
  return (
    <TreeWidget 
      data={sampleData} 
      onNewFile={(id) => window.prompt('New File Name:')}
      onNewFolder={(id) => window.prompt('New Folder Name:')}
      onRename={(id) => window.prompt('New Name:')}
      onDelete={(id) => window.confirm('Delete this item?')}
    />
  );
}
