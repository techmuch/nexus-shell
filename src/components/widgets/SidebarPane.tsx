import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

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
  /** Extra classes merged onto the root `<aside>`. */
  className?: string;
}

/**
 * The collapsible panel beside the {@link ActivityBar}: a titled header with an
 * optional close button, over a scrolling body.
 *
 * A pure container — it decides nothing about which panel is showing and holds
 * no state. Render whatever you like as `children`. For the store-backed
 * variant that resolves the active panel from `useSidebarStore`, see
 * `ConnectedSidebarPane`.
 *
 * @example
 * ```tsx
 * <SidebarPane title="Explorer" onClose={() => setActive(null)}>
 *   <TreeWidget data={files} />
 * </SidebarPane>
 * ```
 */
export const SidebarPane = ({
  title,
  children,
  onClose,
  width = '300px',
  className,
}: SidebarPaneProps) => (
  <aside
    role="tabpanel"
    aria-label={`${title} Panel`}
    style={{ width }}
    className={cn(
      'h-full bg-muted border-r flex flex-col select-none shrink-0',
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
    <div className="flex-1 overflow-auto border-t border-border/50 bg-background/50">
      {children}
    </div>
  </aside>
);
