import React, { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

/** The MIME type palette entries put their kind on during a drag. */
export const GRAPH_NODE_MIME = 'application/x-nexus-graph-node';

/**
 * How the palette lays its items out.
 *
 * - `horizontal` — a row, wrapping if it must.
 * - `vertical` — a column.
 * - `auto` — whichever fits the space the palette is given. See
 *   {@link NodePalette} for the rule.
 */
export type PaletteOrientation = 'horizontal' | 'vertical' | 'auto';

/** The orientation actually rendered, once `auto` has been resolved. */
export type ResolvedOrientation = Exclude<PaletteOrientation, 'auto'>;

/** An entry in a {@link NodePalette}. */
export interface INodePaletteItem {
  /**
   * The `kind` given to the node this creates. Also the payload carried on the
   * drag, so the drop handler knows what was dragged.
   */
  kind: string;
  /** Label shown in the palette. */
  label: string;
  /** Optional icon or swatch rendered before the label. */
  icon?: ReactNode;
  /** One line explaining what the node is, shown as a tooltip. */
  description?: string;
}

export interface NodePaletteProps {
  /** The node types on offer. */
  items: INodePaletteItem[];
  /**
   * Called when an item is activated by click or Enter, for creating without a
   * drag. Keyboard users need this — a drag-only palette is unreachable.
   */
  onSelect?: (item: INodePaletteItem) => void;
  /** Called when a drag starts, if you want to show a drop hint. */
  onDragStart?: (item: INodePaletteItem) => void;
  /**
   * Layout axis. Defaults to `"auto"`, which measures the available space and
   * picks whichever axis fits.
   */
  orientation?: PaletteOrientation;
  /**
   * Called when `auto` settles on an axis, and whenever it changes. Useful for
   * adjusting surrounding layout to match.
   */
  onOrientationChange?: (orientation: ResolvedOrientation) => void;
  /**
   * Hide labels and show icons only. Useful for a narrow rail; items keep their
   * accessible name, so nothing is lost to a screen reader.
   */
  iconOnly?: boolean;
  /** Extra classes merged onto the root element. */
  className?: string;
  /** Accessible label for the group. Defaults to `"Node palette"`. */
  'aria-label'?: string;
}

/**
 * A palette of node types that can be dragged onto a {@link GraphCanvas}, or
 * activated with the keyboard.
 *
 * The palette carries only the item's `kind` on the drag; what a node of that
 * kind actually *is* is decided by your drop handler. Pair it with
 * {@link readPaletteDrag} on the canvas.
 *
 * Every item is a real button, so the palette is fully usable without a
 * pointer — `onSelect` fires on click or Enter.
 *
 * ## Orientation
 *
 * `auto` (the default) measures the space the palette's container gives it and
 * picks the axis that fits:
 *
 * 1. a row, if the items fit the available width;
 * 2. otherwise a column, if they fit the available height;
 * 3. otherwise a row that wraps.
 *
 * A container that shrink-wraps its content — an absolutely positioned overlay,
 * say — offers no information about available space, so the palette measures
 * the nearest ancestor that has a size of its own. That is what stops a
 * vertical palette from narrowing its own container and then being unable to
 * discover it has room to go horizontal again.
 *
 * Pass `horizontal` or `vertical` when you already know.
 *
 * @example
 * ```tsx
 * <GraphCanvas
 *   onDrop={(point, event) => {
 *     const kind = readPaletteDrag(event);
 *     if (kind) addNode({ kind, position: point });
 *   }}
 *   overlay={
 *     <NodePalette
 *       items={[{ kind: 'task', label: 'Task' }, { kind: 'gate', label: 'Gate' }]}
 *       onSelect={(item) => addNodeAtCentre(item.kind)}
 *     />
 *   }
 * />
 * ```
 */
export const NodePalette = ({
  items,
  onSelect,
  onDragStart,
  orientation = 'auto',
  onOrientationChange,
  iconOnly = false,
  className,
  'aria-label': ariaLabel = 'Node palette',
}: NodePaletteProps) => {
  const rootRef = useRef<HTMLDivElement>(null);

  // Only meaningful while `orientation` is `auto`; otherwise the prop wins.
  const [measured, setMeasured] = useState<ResolvedOrientation>('horizontal');
  const resolved: ResolvedOrientation = orientation === 'auto' ? measured : orientation;

  const reportRef = useRef(onOrientationChange);
  reportRef.current = onOrientationChange;

  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    const buttons = [...root.querySelectorAll<HTMLElement>('[data-palette-item]')];
    if (buttons.length === 0) return;

    const styles = window.getComputedStyle(root);
    const gap = parseFloat(styles.gap) || 0;
    const padding =
      (parseFloat(styles.paddingLeft) || 0) + (parseFloat(styles.paddingRight) || 0);

    // Item sizes barely differ between the two layouts, so measuring once in
    // whichever is current is enough to predict both.
    const naturalRow =
      buttons.reduce((total, b) => total + b.offsetWidth, 0) +
      gap * (buttons.length - 1) +
      padding;
    const naturalColumn =
      buttons.reduce((total, b) => total + b.offsetHeight, 0) +
      gap * (buttons.length - 1) +
      padding;

    const space = availableSpace(root);
    if (!space) return;

    // A little slack, so a palette sitting exactly at the boundary doesn't
    // flip back and forth on sub-pixel layout changes.
    const SLACK = 4;

    const next: ResolvedOrientation =
      naturalRow <= space.width + SLACK
        ? 'horizontal'
        : naturalColumn <= space.height + SLACK
          ? 'vertical'
          : 'horizontal';

    setMeasured((current) => {
      if (current === next) return current;
      reportRef.current?.(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (orientation !== 'auto') return;
    const root = rootRef.current;
    if (!root) return;

    measure();

    // Watch both the palette and the element it measures against: either
    // changing can flip the answer.
    const observer = new ResizeObserver(measure);
    observer.observe(root);

    const reference = measurementTarget(root);
    if (reference && reference !== root) observer.observe(reference);

    return () => observer.disconnect();
  }, [orientation, measure, items.length]);

  const vertical = resolved === 'vertical';

  return (
    <div
      ref={rootRef}
      role="toolbar"
      aria-label={ariaLabel}
      aria-orientation={resolved}
      data-orientation={resolved}
      className={cn(
        'flex gap-1.5 p-1.5 rounded-lg border border-border bg-card/90 backdrop-blur-sm shadow-sm',
        vertical ? 'flex-col items-stretch' : 'flex-wrap items-center',
        className,
      )}
    >
      {items.map((item) => (
        <button
          key={item.kind}
          type="button"
          data-palette-item
          draggable
          title={item.description ?? (iconOnly ? item.label : undefined)}
          aria-label={iconOnly ? item.label : undefined}
          onDragStart={(event) => {
            event.dataTransfer.setData(GRAPH_NODE_MIME, item.kind);
            // Plain text too, so a drop onto an editor or another app degrades
            // to something meaningful rather than nothing.
            event.dataTransfer.setData('text/plain', item.label);
            event.dataTransfer.effectAllowed = 'copy';
            onDragStart?.(item);
          }}
          onClick={() => onSelect?.(item)}
          className={cn(
            'flex items-center gap-1.5 rounded-md text-xs font-medium',
            'border border-border bg-background text-foreground',
            'hover:bg-accent hover:text-accent-foreground transition-colors',
            'cursor-grab active:cursor-grabbing',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            iconOnly ? 'p-2 justify-center' : 'px-2.5 py-1.5',
            // A column reads better left-aligned; a row centres naturally.
            vertical && !iconOnly && 'justify-start',
          )}
        >
          {item.icon}
          {!iconOnly && item.label}
        </button>
      ))}
    </div>
  );
};

/**
 * The element whose size represents "space available".
 *
 * Walks up from the palette past any ancestor that is merely shrink-wrapping
 * it — an absolutely positioned overlay, an inline-flex wrapper — since such an
 * element's width is the palette's own width and says nothing about the room on
 * offer. Measuring one of those is also what would trap the palette in vertical
 * forever: going vertical narrows the container, which then looks too narrow to
 * go back.
 */
const measurementTarget = (root: HTMLElement): HTMLElement | null => {
  let candidate = root.parentElement;

  for (let depth = 0; candidate && depth < 6; depth += 1) {
    const box = candidate.getBoundingClientRect();
    const self = root.getBoundingClientRect();

    // Meaningfully wider than the palette, so it has a size of its own.
    if (box.width > self.width + 8) return candidate;

    candidate = candidate.parentElement;
  }
  return null;
};

const availableSpace = (root: HTMLElement): { width: number; height: number } | null => {
  const target = measurementTarget(root);
  if (!target) return null;

  const styles = window.getComputedStyle(target);
  const box = target.getBoundingClientRect();

  return {
    width:
      box.width -
      (parseFloat(styles.paddingLeft) || 0) -
      (parseFloat(styles.paddingRight) || 0),
    height:
      box.height -
      (parseFloat(styles.paddingTop) || 0) -
      (parseFloat(styles.paddingBottom) || 0),
  };
};

/**
 * Read the node kind from a drop on the canvas, or `null` if the drag did not
 * come from a {@link NodePalette}.
 *
 * @example
 * ```tsx
 * <GraphCanvas onDrop={(point, event) => {
 *   const kind = readPaletteDrag(event);
 *   if (kind) createNode(kind, point);
 * }} />
 * ```
 */
export const readPaletteDrag = (event: React.DragEvent): string | null =>
  event.dataTransfer.getData(GRAPH_NODE_MIME) || null;
