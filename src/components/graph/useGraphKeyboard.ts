import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  findNeighbour,
  placeRelativeTo,
  type Direction,
  type IGraphEdge,
  type IGraphNode,
  type IPoint,
} from '../../lib/graph';

/** The default keyboard map. Every binding is overridable. */
export const DEFAULT_GRAPH_KEYS = {
  /** Move focus to the nearest node in a direction. */
  moveFocus: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'],
  /** Create a connected node in a direction. */
  createConnected: 'Tab',
  /** Edit the focused node. */
  edit: 'Enter',
  /** Leave edit mode, cancel a pending connection, or clear focus. */
  cancel: 'Escape',
  /** Delete the focused node. */
  delete: ['Delete', 'Backspace'],
  /** Begin connecting from the focused node. */
  connect: 'c',
  /** Nudge the focused node. Held with the arrow keys. */
  nudgeModifier: 'shiftKey',
} as const;

export interface GraphKeyboardActions {
  /**
   * Create a node at a position, returning its id so focus can follow it. The
   * library never invents node content — you decide what a new node is.
   */
  onCreateNode?: (position: IPoint, context: { from?: string; direction?: Direction }) => string | undefined;
  /** Connect two nodes. */
  onConnect?: (sourceId: string, targetId: string) => void;
  /** Delete a node and its edges. */
  onDeleteNode?: (id: string) => void;
  /** Move a node, used by nudging. */
  onMoveNode?: (id: string, position: IPoint) => void;
  /** Enter edit mode for a node. */
  onEditNode?: (id: string) => void;
}

export interface UseGraphKeyboardOptions extends GraphKeyboardActions {
  /** The current nodes. Traversal and placement are computed from these. */
  nodes: IGraphNode[];
  /** The current edges. Used to reason about existing connections. */
  edges: IGraphEdge[];
  /** Take control of which node has keyboard focus. */
  focusedId?: string | null;
  /** Starting focus when uncontrolled. */
  defaultFocusedId?: string | null;
  /** Called whenever focus moves. */
  onFocusChange?: (id: string | null) => void;
  /**
   * Element the listener attaches to. Bindings only fire while focus is inside
   * it, so several graphs can coexist on one page.
   */
  targetRef: React.RefObject<HTMLElement | null>;
  /** How far a nudge moves a node, in graph units. Defaults to `16`. */
  nudgeDistance?: number;
  /** Turn the whole thing off. */
  disabled?: boolean;
}

export interface UseGraphKeyboardResult {
  /** The node the next keystroke applies to. */
  focusedId: string | null;
  setFocusedId: (id: string | null) => void;
  /** Node currently being edited, if any. */
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  /** Source of a connection awaiting a target, if any. */
  connectingFrom: string | null;
  setConnectingFrom: (id: string | null) => void;
  /** Move focus as an arrow key would. Exposed for toolbar buttons. */
  moveFocus: (direction: Direction) => void;
  /** Create a connected node as Tab would. */
  createConnected: (direction?: Direction) => void;
}

const ARROW_DIRECTION: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

/**
 * Keyboard-driven graph navigation and editing.
 *
 * Headless: it owns the focus, editing and connection cursors and reports what
 * should happen, but renders nothing and mutates nothing. That means it works
 * with `GraphNode` or with your own node rendering, and every mutation stays
 * subject to your validation and undo.
 *
 * The default map, all overridable:
 *
 * | Key | Action |
 * | :-- | :-- |
 * | Arrows | Move focus to the nearest node in that direction |
 * | Shift + Arrows | Nudge the focused node |
 * | Tab / Shift+Tab | Create a node connected to the focused one |
 * | Enter | Edit the focused node |
 * | `c` then a node | Connect from the focused node |
 * | Delete / Backspace | Delete the focused node |
 * | Escape | Leave edit mode, cancel a connection, or clear focus |
 *
 * Arrow traversal is spatial rather than by insertion order — it picks the
 * nearest node in the direction travelled, penalising lateral offset, which is
 * what makes a hand-arranged diagram navigable without a mouse.
 *
 * @example
 * ```tsx
 * const canvasRef = useRef<HTMLDivElement>(null);
 *
 * const keyboard = useGraphKeyboard({
 *   nodes, edges, targetRef: canvasRef,
 *   onCreateNode: (position) => {
 *     const id = nextId('node', nodes);
 *     setNodes([...nodes, { id, position, data: { label: 'New' } }]);
 *     return id;
 *   },
 *   onConnect: (source, target) =>
 *     setEdges([...edges, { id: nextId('edge', edges), source, target }]),
 *   onDeleteNode: (id) => { … },
 * });
 * ```
 */
export const useGraphKeyboard = ({
  nodes,
  edges,
  focusedId: controlledFocusedId,
  defaultFocusedId = null,
  onFocusChange,
  targetRef,
  nudgeDistance = 16,
  disabled = false,
  onCreateNode,
  onConnect,
  onDeleteNode,
  onMoveNode,
  onEditNode,
}: UseGraphKeyboardOptions): UseGraphKeyboardResult => {
  const [internalFocusedId, setInternalFocusedId] = useState<string | null>(
    defaultFocusedId,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const focusedId = controlledFocusedId !== undefined ? controlledFocusedId : internalFocusedId;

  const setFocusedId = useCallback(
    (id: string | null) => {
      if (controlledFocusedId === undefined) setInternalFocusedId(id);
      onFocusChange?.(id);
    },
    [controlledFocusedId, onFocusChange],
  );

  // The handler is registered once; a ref keeps it reading current state
  // without re-subscribing on every node change.
  const state = useRef({
    nodes,
    edges,
    focusedId,
    editingId,
    connectingFrom,
  });
  state.current = { nodes, edges, focusedId, editingId, connectingFrom };

  const moveFocus = useCallback(
    (direction: Direction) => {
      const { nodes: current, focusedId: from } = state.current;
      if (current.length === 0) return;

      // With nothing focused, an arrow key adopts the first node rather than
      // doing nothing — otherwise the keyboard is unreachable without a click.
      if (!from) {
        setFocusedId(current[0].id);
        return;
      }

      const next = findNeighbour(current, from, direction);
      if (next) setFocusedId(next.id);
    },
    [setFocusedId],
  );

  const createConnected = useCallback(
    (direction: Direction = 'right') => {
      const { nodes: current, focusedId: from } = state.current;
      if (!onCreateNode) return;

      const position = from
        ? placeRelativeTo(current, from, direction)
        : { x: 0, y: 0 };

      const created = onCreateNode(position, { from: from ?? undefined, direction });
      if (!created) return;

      if (from) onConnect?.(from, created);
      setFocusedId(created);
      // Creating a node from the keyboard almost always means you want to name
      // it, so go straight into edit mode.
      setEditingId(created);
    },
    [onCreateNode, onConnect, setFocusedId],
  );

  useEffect(() => {
    if (disabled) return;
    const element = targetRef.current;
    if (!element) return;

    const handler = (event: KeyboardEvent) => {
      const { focusedId: focused, editingId: editing, connectingFrom: connecting } =
        state.current;

      // While editing, the node's own field owns the keyboard. Escape is the
      // only binding that still applies.
      if (editing) {
        if (event.key === 'Escape') {
          event.preventDefault();
          setEditingId(null);
        }
        return;
      }

      // Don't steal keys from a field that happens to sit on the canvas.
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;

      const direction = ARROW_DIRECTION[event.key];

      if (direction) {
        event.preventDefault();
        const node = state.current.nodes.find((n) => n.id === focused);

        if (event.shiftKey && node && onMoveNode) {
          const delta = {
            up: { x: 0, y: -nudgeDistance },
            down: { x: 0, y: nudgeDistance },
            left: { x: -nudgeDistance, y: 0 },
            right: { x: nudgeDistance, y: 0 },
          }[direction];
          onMoveNode(node.id, {
            x: node.position.x + delta.x,
            y: node.position.y + delta.y,
          });
          return;
        }

        moveFocus(direction);
        return;
      }

      switch (event.key) {
        case 'Tab': {
          if (!onCreateNode) return;
          event.preventDefault();
          createConnected(event.shiftKey ? 'left' : 'right');
          return;
        }

        case 'Enter': {
          if (!focused) return;
          event.preventDefault();

          // Enter completes a pending connection when one is in flight.
          if (connecting && connecting !== focused) {
            onConnect?.(connecting, focused);
            setConnectingFrom(null);
            return;
          }

          onEditNode?.(focused);
          setEditingId(focused);
          return;
        }

        case 'Escape': {
          event.preventDefault();
          if (connecting) setConnectingFrom(null);
          else setFocusedId(null);
          return;
        }

        case 'Delete':
        case 'Backspace': {
          if (!focused || !onDeleteNode) return;
          event.preventDefault();

          // Move focus somewhere sensible before the node disappears.
          const remaining = state.current.nodes.filter((n) => n.id !== focused);
          const neighbour =
            findNeighbour(state.current.nodes, focused, 'left') ??
            findNeighbour(state.current.nodes, focused, 'right') ??
            remaining[0] ??
            null;

          onDeleteNode(focused);
          setFocusedId(neighbour?.id ?? null);
          return;
        }

        case 'c':
        case 'C': {
          if (!focused || !onConnect || event.metaKey || event.ctrlKey) return;
          event.preventDefault();
          setConnectingFrom(connecting === focused ? null : focused);
          return;
        }
      }
    };

    element.addEventListener('keydown', handler);
    return () => element.removeEventListener('keydown', handler);
  }, [
    disabled,
    targetRef,
    moveFocus,
    createConnected,
    nudgeDistance,
    onConnect,
    onCreateNode,
    onDeleteNode,
    onEditNode,
    onMoveNode,
    setFocusedId,
  ]);

  // Focus must not survive the node it points at.
  useEffect(() => {
    if (focusedId && !nodes.some((n) => n.id === focusedId)) setFocusedId(null);
    if (editingId && !nodes.some((n) => n.id === editingId)) setEditingId(null);
    if (connectingFrom && !nodes.some((n) => n.id === connectingFrom)) {
      setConnectingFrom(null);
    }
  }, [nodes, focusedId, editingId, connectingFrom, setFocusedId]);

  return useMemo(
    () => ({
      focusedId,
      setFocusedId,
      editingId,
      setEditingId,
      connectingFrom,
      setConnectingFrom,
      moveFocus,
      createConnected,
    }),
    [focusedId, setFocusedId, editingId, connectingFrom, moveFocus, createConnected],
  );
};
