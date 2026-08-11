import React, { useEffect, useMemo, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import {
  ChevronDown,
  ChevronRight,
  Edit,
  File,
  Folder,
  FolderPlus,
  Plus,
  Trash2,
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { ContextMenu, type IContextMenuItem } from './ContextMenu';

/** A node in the {@link TreeWidget} hierarchy. */
export interface ITreeNode {
  /** Stable identifier, unique across the whole tree. */
  id: string;
  /** Text shown for the node. */
  label: string;
  /** `folder` nodes expand on click; `file` nodes do not. */
  type: 'file' | 'folder';
  /** Child nodes. Only rendered while `isOpen` is `true`. */
  children?: ITreeNode[];
  /** Whether a folder is expanded. Controlled by you — see `onToggle`. */
  isOpen?: boolean;
}

/**
 * Where a context-menu action applies.
 *
 * `nodeId` is `null` when the menu was opened on empty background, which is how
 * you distinguish "new file here" from "new file at the root".
 */
export interface ITreeContext {
  /** The right-clicked node's id, or `null` for the background. */
  nodeId: string | null;
  /** The right-clicked node, or `null` for the background. */
  node: ITreeNode | null;
}

/** A custom entry in the tree's right-click menu. */
export interface ITreeAction {
  /** Stable identifier. Used as the React key. */
  id: string;
  /** Label shown in the menu. */
  label: string;
  /** Optional icon element, rendered before the label. */
  icon?: React.ReactNode;
  /** Runs with the right-clicked target. */
  onSelect: (context: ITreeContext) => void;
  /** Draw a separator above this entry. */
  divider?: boolean;
  /**
   * Restrict where the entry appears. Defaults to everywhere. Use this for
   * actions that only make sense on a folder, or only on the background.
   */
  showFor?: ('file' | 'folder' | 'background')[];
}

export interface TreeWidgetProps {
  /** Root nodes. Expansion state lives on the nodes themselves via `isOpen`. */
  data: ITreeNode[];
  /**
   * Called when a folder is clicked. Flip that node's `isOpen` in your own
   * state — the tree renders expansion but does not own it.
   */
  onToggle?: (node: ITreeNode) => void;
  /** Called when a node is double-clicked. Typically opens the item. */
  onActivate?: (node: ITreeNode) => void;
  /** Called after a node is dragged onto a folder. */
  onMoveNode?: (draggedId: string, targetFolderId: string) => void;
  /**
   * Entries for the right-click menu. Defaults to New File, New Folder, Rename
   * and Delete, which map to the `onNew*` / `onRename` / `onDelete` props.
   *
   * Pass your own array to replace that set entirely — this is the extension
   * point for app-specific commands, so the tree itself stays generic.
   */
  actions?: ITreeAction[];
  /** Handler for the built-in "New File" action. */
  onNewFile?: (parentId: string | null) => void;
  /** Handler for the built-in "New Folder" action. */
  onNewFolder?: (parentId: string | null) => void;
  /** Handler for the built-in "Rename" action. */
  onRename?: (nodeId: string) => void;
  /** Handler for the built-in "Delete" action. */
  onDelete?: (nodeId: string) => void;
  /** Indentation added per depth level, in px. Defaults to `12`. */
  indent?: number;
  /**
   * Virtualise rows with `react-virtuoso`. Leave on for large trees; turn it
   * off when every row must be present in the DOM — printing, full-text browser
   * search, or a test environment that can't measure layout. Defaults to `true`.
   */
  virtualized?: boolean;
  /** Extra classes merged onto the root element. */
  className?: string;
}

interface FlatNode extends ITreeNode {
  level: number;
}

const flatten = (items: ITreeNode[], level = 0): FlatNode[] =>
  items.reduce<FlatNode[]>((acc, item) => {
    acc.push({ ...item, level });
    if (item.isOpen && item.children) {
      acc.push(...flatten(item.children, level + 1));
    }
    return acc;
  }, []);

/**
 * A virtualised file-explorer tree with drag-to-move and a right-click menu.
 *
 * Rows are virtualised via `react-virtuoso`, so very large trees stay
 * responsive. The component is controlled: expansion lives on your nodes as
 * `isOpen` and changes are reported through `onToggle`, so the tree never holds
 * a second copy of your data.
 *
 * The context menu is data-driven. The defaults cover the usual file
 * operations; pass `actions` to replace them with your own commands rather than
 * adding one-off props.
 *
 * @example
 * ```tsx
 * <TreeWidget
 *   data={nodes}
 *   onToggle={(n) => setNodes(toggle(nodes, n.id))}
 *   onActivate={(n) => open(n.id)}
 *   actions={[
 *     { id: 'new-map', label: 'New Map', icon: <Map size={14} />,
 *       showFor: ['folder', 'background'], onSelect: (ctx) => createMap(ctx.nodeId) },
 *   ]}
 * />
 * ```
 */
export const TreeWidget = ({
  data,
  onToggle,
  onActivate,
  onMoveNode,
  actions,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
  indent = 12,
  virtualized = true,
  className,
}: TreeWidgetProps) => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    context: ITreeContext;
    scope: 'file' | 'folder' | 'background';
  } | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const nodes = useMemo(() => flatten(data), [data]);

  useEffect(() => {
    setDragOverId(null);
  }, [data]);

  const defaultActions: ITreeAction[] = [
    {
      id: 'new-file',
      label: 'New File',
      icon: <Plus size={14} />,
      onSelect: ({ nodeId }) => onNewFile?.(nodeId),
    },
    {
      id: 'new-folder',
      label: 'New Folder',
      icon: <FolderPlus size={14} />,
      onSelect: ({ nodeId }) => onNewFolder?.(nodeId),
    },
    {
      id: 'rename',
      label: 'Rename',
      icon: <Edit size={14} />,
      divider: true,
      showFor: ['file', 'folder'],
      onSelect: ({ nodeId }) => nodeId && onRename?.(nodeId),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 size={14} className="text-destructive" />,
      showFor: ['file', 'folder'],
      onSelect: ({ nodeId }) => nodeId && onDelete?.(nodeId),
    },
  ];

  const menuItems: IContextMenuItem[] = (actions ?? defaultActions)
    .filter(
      (action) => !action.showFor || (contextMenu && action.showFor.includes(contextMenu.scope)),
    )
    .map((action) => ({
      label: action.label,
      icon: action.icon,
      divider: action.divider,
      onClick: () => contextMenu && action.onSelect(contextMenu.context),
    }));

  const openMenu = (
    e: React.MouseEvent,
    node: ITreeNode | null,
    scope: 'file' | 'folder' | 'background',
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      scope,
      context: { nodeId: node?.id ?? null, node },
    });
  };

  const renderRow = (index: number) => {
    const node = nodes[index];
    const isFolder = node.type === 'folder';

    return (
            <div
              key={node.id}
              role="treeitem"
              aria-expanded={isFolder ? !!node.isOpen : undefined}
              aria-level={node.level + 1}
              tabIndex={0}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', node.id);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                if (!isFolder) return;
                e.preventDefault();
                setDragOverId(node.id);
              }}
              onDragLeave={() => setDragOverId(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverId(null);
                const draggedId = e.dataTransfer.getData('text/plain');
                if (draggedId && draggedId !== node.id && isFolder) {
                  onMoveNode?.(draggedId, node.id);
                }
              }}
              onClick={() => isFolder && onToggle?.(node)}
              onDoubleClick={() => onActivate?.(node)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                e.preventDefault();
                if (isFolder) onToggle?.(node);
                else onActivate?.(node);
              }}
              onContextMenu={(e) => openMenu(e, node, node.type)}
              style={{ paddingLeft: `${node.level * indent + 8}px` }}
              className={cn(
                'flex items-center py-1 px-2 cursor-pointer hover:bg-accent hover:text-accent-foreground select-none text-xs',
                'transition-colors duration-150 relative focus:outline-none focus:ring-1 focus:ring-ring',
                dragOverId === node.id && 'bg-primary/20 ring-1 ring-primary/50 rounded-sm',
              )}
            >
              <div className="w-4 h-4 mr-1 flex items-center justify-center">
                {isFolder &&
                  (node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
              </div>
              <div className="mr-2">
                {isFolder ? (
                  <Folder size={14} className="text-blue-400 fill-blue-400/20" />
                ) : (
                  <File size={14} className="text-muted-foreground" />
                )}
              </div>
              <span className="truncate">{node.label}</span>
            </div>
    );
  };

  return (
    <div
      role="tree"
      className={cn('h-full w-full bg-muted/30', className)}
      onContextMenu={(e) => openMenu(e, null, 'background')}
    >
      {virtualized ? (
        <Virtuoso
          style={{ height: '100%' }}
          totalCount={nodes.length}
          itemContent={renderRow}
        />
      ) : (
        <div className="h-full overflow-auto">
          {nodes.map((_, index) => renderRow(index))}
        </div>
      )}

      {contextMenu && menuItems.length > 0 && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={menuItems}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
