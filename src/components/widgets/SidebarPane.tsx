import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { PaneHostProvider } from '../layout/PaneHost';

/** Which edge of the shell a pane or rail is docked to. */
export type PaneSide = 'left' | 'right';

export interface SidebarPaneProps {
  /**
   * Heading text. Rendered uppercase with letter-spacing; pass it in natural
   * case and let the component style it.
   */
  title: string;
  /** Panel body. Scrolls independently of the header. */
  children?: ReactNode;
  /**
   * Called when the close button is pressed. Omit it to hide the close button
   * entirely — useful when the pane is always visible.
   */
  onClose?: () => void;
  /** Fixed pane width, as a CSS length. Defaults to `"300px"`. */
  width?: string;
  /**
   * Which edge of the shell the pane is docked to. Defaults to `"left"`.
   *
   * Only the divider moves — a right-hand pane is the same container, so an
   * inspector does not need a component of its own.
   */
  side?: PaneSide;
  /** Extra classes merged onto the root `<aside>`. */
  className?: string;
}


/**
 * A docked side panel: a titled header with an optional close button, over a
 * scrolling body.
 *
 * A pure container — it decides nothing about which panel is showing and holds
 * no state. Render whatever you like as `children`.
 *
 * `side` docks it left (beside the {@link ActivityBar}) or right, where it
 * becomes an inspector. Both are the same component deliberately: before this
 * prop existed every application hand-rolled its own right-hand
 * `<div className="w-80 border-l …">`, and they all drifted apart.
 *
 * For the store-backed variants used by `ShellLayout`, see
 * `ConnectedSidebarPane` and `ConnectedInspectorPane`.
 *
 * @example
 * ```tsx
 * <SidebarPane title="Explorer" onClose={() => setActive(null)}>
 *   <TreeWidget data={files} />
 * </SidebarPane>
 *
 * <SidebarPane title="Properties" side="right" width="320px">
 *   <PropertyPanel subjects={selected} fields={fields} />
 * </SidebarPane>
 * ```
 */
export const SidebarPane = ({
  title,
  children,
  onClose,
  width = '300px',
  side = 'left',
  className,
}: SidebarPaneProps) => (
  <aside
    role="tabpanel"
    aria-label={`${title} Panel`}
    data-side={side}
    style={{ width }}
    className={cn(
      'h-full bg-muted flex flex-col select-none shrink-0',
      // The divider always faces the content it separates from.
      side === 'right' ? 'border-l' : 'border-r',
      className,
    )}
  >
    <div className="h-10 flex items-center justify-between px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
      <span className="truncate">{title}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Panel"
          className="p-1 hover:bg-accent hover:text-foreground rounded transition-colors focus:outline-none focus:ring-2 focus:ring-ring shrink-0"
        >
          <X size={14} />
        </button>
      )}
    </div>
    <div className="flex-1 min-h-0 overflow-auto border-t border-border/50 bg-background/50">
      {/* The header above is the pane's title bar, so anything hosted here
          should not draw a second one. */}
      <PaneHostProvider chrome placement={side}>
        {children}
      </PaneHostProvider>
    </div>
  </aside>
);
