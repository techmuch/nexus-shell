import React, { useEffect, useMemo, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';
import { ContextMenu, type IContextMenuItem } from './ContextMenu';

/**
 * A node in the {@link TreeWidget} hierarchy.
 *
 * The model is deliberately domain-neutral: the component knows about branches
 * and leaves, and nothing else. A file explorer, an org chart, a scene graph and
 * a category picker are all the same shape here — what differs is your `kind`
 * and your `icon`.
 */
export interface ITreeNode {
  /** Stable identifier, unique across the whole tree. */
  id: string;
  /** Text shown for the node. */
  label: string;
  /**
   * Whether this node can contain children — a folder, a department, a group.
   * Branches expand on click and accept drops; leaves do neither.
   *
   * Defaults to `false`. Set it explicitly for a branch whose children haven't
   * been loaded yet, so it still renders as expandable.
   */
  isBranch?: boolean;
  /**
   * Your own classification for this node, e.g. `"folder"`, `"department"`,
   * `"question"`. The component never interprets it — it exists so context-menu
   * actions can target node types through {@link ITreeAction.showFor}.
   */
  kind?: string;
  /** Child nodes. Only rendered while `isOpen` is `true`. */
  children?: ITreeNode[];
  /** Whether a branch is expanded. Controlled by you — see `onToggle`. */
  isOpen?: boolean;
  /**
   * Icon rendered before the label. Any node works — a `lucide-react` icon, an
   * avatar, a coloured dot. Omit it for a label-only row.
   */
  icon?: React.ReactNode;
  /** Extra classes merged onto this row. */
  className?: string;
}

/** Where a context-menu action applies. */
export interface ITreeContext {
  /** The right-clicked node's id, or `null` for the background. */
  nodeId: string | null;
  /** The right-clicked node, or `null` for the background. */
  node: ITreeNode | null;
}

/**
 * Where a context-menu entry is offered.
 *
 * `'branch'` and `'leaf'` match structurally; `'background'` is a right-click on
 * empty space. Any other string is matched against the node's `kind`, so you can
 * scope an action to your own node types.
 */
export type TreeActionScope = 'branch' | 'leaf' | 'background' | (string & {});

/** An entry in the tree's right-click menu. */
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
   * Restrict where the entry appears. Defaults to everywhere.
   *
   * @example
   * ```ts
   * showFor: ['branch', 'background']   // structural
   * showFor: ['department']             // matches node.kind
   * ```
   */
  showFor?: TreeActionScope[];
}

export interface TreeWidgetProps {
  /** Root nodes. Expansion state lives on the nodes themselves via `isOpen`. */
  data: ITreeNode[];
  /**
   * Called when a branch is clicked. Flip that node's `isOpen` in your own
   * state — the tree renders expansion but does not own it.
   */
  onToggle?: (node: ITreeNode) => void;
  /** Called when a node is double-clicked or Enter is pressed on a leaf. */
  onActivate?: (node: ITreeNode) => void;
  /**
   * Called after a node is dragged onto a branch. Only branches accept drops.
   * Reparenting is yours to perform — the tree does not mutate `data`.
   */
  onMoveNode?: (draggedId: string, targetBranchId: string) => void;
  /**
   * Entries for the right-click menu. Empty by default: the component ships no
   * actions of its own, because "New File" means nothing to an org chart.
   *
   * With no entries, no menu appears.
   */
  actions?: ITreeAction[];
  /** Indentation added per depth level, in px. Defaults to `12`. */
  indent?: number;
  /**
   * Virtualise rows with `react-virtuoso`. Leave on for large trees; turn it
   * off when every row must be present in the DOM — printing, full-text browser
   * search, or a test environment that can't measure layout. Defaults to `true`.
   */
  virtualized?: boolean;
  /** Accessible label for the tree. Defaults to `"Tree"`. */
  'aria-label'?: string;
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

/** Structural and `kind`-based scopes a node satisfies. */
const scopesFor = (node: ITreeNode | null): TreeActionScope[] => {
  if (!node) return ['background'];
  const scopes: TreeActionScope[] = [node.isBranch ? 'branch' : 'leaf'];
  if (node.kind) scopes.push(node.kind);
  return scopes;
};

/**
 * A virtualised, domain-neutral tree with drag-to-move and a data-driven
 * right-click menu.
 *
 * It renders any hierarchy — files, an org chart, a scene graph, nested
 * categories, an argument map. The component's only structural concept is
 * `isBranch`: branches expand and accept drops, leaves do neither. Everything
 * else — what a node *is*, what icon it carries, what actions it offers — is
 * yours to supply.
 *
 * Rows are virtualised via `react-virtuoso`, so large trees stay responsive.
 *
 * Controlled: expansion lives on your nodes as `isOpen` and changes are
 * reported through `onToggle`, so the tree never holds a second copy of your
 * data.
 *
 * @example
 * ```tsx
 * // An org chart — no files in sight.
 * <TreeWidget
 *   data={[
 *     {
 *       id: 'eng',
 *       label: 'Engineering',
 *       isBranch: true,
 *       kind: 'department',
 *       isOpen: true,
 *       icon: <Building2 size={14} />,
 *       children: [
 *         { id: 'ada', label: 'Ada Lovelace', kind: 'person', icon: <User size={14} /> },
 *       ],
 *     },
 *   ]}
 *   onToggle={(node) => setNodes(toggle(nodes, node.id))}
 *   actions={[
 *     { id: 'hire', label: 'Add report', showFor: ['department'], onSelect: addReport },
 *   ]}
 * />
 * ```
 */
export const TreeWidget = ({
  data,
  onToggle,
  onActivate,
  onMoveNode,
  actions = [],
  indent = 12,
  virtualized = true,
  'aria-label': ariaLabel = 'Tree',
  className,
}: TreeWidgetProps) => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    context: ITreeContext;
    scopes: TreeActionScope[];
  } | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const nodes = useMemo(() => flatten(data), [data]);

  useEffect(() => {
    setDragOverId(null);
  }, [data]);

  const menuItems: IContextMenuItem[] = actions
    .filter(
      (action) =>
        !action.showFor ||
        (contextMenu && action.showFor.some((s) => contextMenu.scopes.includes(s))),
    )
    .map((action) => ({
      label: action.label,
      icon: action.icon,
      divider: action.divider,
      onClick: () => contextMenu && action.onSelect(contextMenu.context),
    }));

  const openMenu = (e: React.MouseEvent, node: ITreeNode | null) => {
    if (actions.length === 0) return;
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      scopes: scopesFor(node),
      context: { nodeId: node?.id ?? null, node },
    });
  };

  const renderRow = (index: number) => {
    const node = nodes[index];
    const isBranch = !!node.isBranch;

    return (
      <div
        key={node.id}
        role="treeitem"
        aria-expanded={isBranch ? !!node.isOpen : undefined}
        aria-level={node.level + 1}
        tabIndex={0}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', node.id);
          e.dataTransfer.effectAllowed = 'move';
        }}
        onDragOver={(e) => {
          if (!isBranch) return;
          e.preventDefault();
          setDragOverId(node.id);
        }}
        onDragLeave={() => setDragOverId(null)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOverId(null);
          const draggedId = e.dataTransfer.getData('text/plain');
          if (draggedId && draggedId !== node.id && isBranch) {
            onMoveNode?.(draggedId, node.id);
          }
        }}
        onClick={() => isBranch && onToggle?.(node)}
        onDoubleClick={() => onActivate?.(node)}
        onKeyDown={(e) => {
          if (e.key !== 'Enter') return;
          e.preventDefault();
          if (isBranch) onToggle?.(node);
          else onActivate?.(node);
        }}
        onContextMenu={(e) => openMenu(e, node)}
        style={{ paddingLeft: `${node.level * indent + 8}px` }}
        className={cn(
          'flex items-center py-1 px-2 cursor-pointer hover:bg-accent hover:text-accent-foreground select-none text-xs',
          'transition-colors duration-150 relative focus:outline-none focus:ring-1 focus:ring-ring',
          dragOverId === node.id && 'bg-primary/20 ring-1 ring-primary/50 rounded-sm',
          node.className,
        )}
      >
        <div className="w-4 h-4 mr-1 flex items-center justify-center shrink-0">
          {isBranch &&
            (node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
        </div>
        {node.icon && (
          <div className="mr-2 flex items-center shrink-0">{node.icon}</div>
        )}
        <span className="truncate">{node.label}</span>
      </div>
    );
  };

  return (
    <div
      role="tree"
      aria-label={ariaLabel}
      className={cn('h-full w-full bg-muted/30', className)}
      onContextMenu={(e) => openMenu(e, null)}
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
