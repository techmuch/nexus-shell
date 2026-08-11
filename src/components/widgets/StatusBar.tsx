import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

/**
 * A single item rendered into one of the status bar's three alignment groups.
 */
export interface IStatusBarWidget {
  /** Stable unique identifier. Used as the React key. */
  id: string;
  /** Text shown next to the icon. Pass an empty string for an icon-only item. */
  label: string;
  /** Optional `lucide-react` icon rendered before the label at 12px. */
  icon?: LucideIcon;
  /** Which of the three groups the item belongs to. */
  alignment: 'left' | 'center' | 'right';
  /** Invoked on click and on Enter/Space. Providing it makes the item interactive. */
  onClick?: () => void;
  /** Extra classes merged onto the item, e.g. `"text-green-500"`. */
  className?: string;
  /** Higher values sort earlier within the group. Defaults to `0`. */
  priority?: number;
}

export interface StatusBarProps {
  /**
   * Items to display. They are grouped by `alignment` and sorted by descending
   * `priority` within each group.
   */
  widgets?: IStatusBarWidget[];
  /** Accessible label for the landmark. Defaults to `"Status Bar"`. */
  'aria-label'?: string;
  /** Extra classes merged onto the root `<footer>`. */
  className?: string;
}

const byPriority = (a: IStatusBarWidget, b: IStatusBarWidget) =>
  (b.priority ?? 0) - (a.priority ?? 0);

/**
 * A VS Code-style status bar: a fixed-height footer with left, center and right
 * item groups. Items may be static labels or interactive buttons.
 *
 * This component is fully controlled — it holds no state and reads no global
 * store. For the store-backed variant used by `ShellLayout`, see
 * {@link ConnectedStatusBar}.
 *
 * @example
 * ```tsx
 * <StatusBar
 *   widgets={[
 *     { id: 'branch', label: 'main', icon: GitBranch, alignment: 'left', onClick: openBranches },
 *     { id: 'ln', label: 'Ln 12, Col 4', alignment: 'right' },
 *   ]}
 * />
 * ```
 */
export const StatusBar = ({
  widgets = [],
  className,
  'aria-label': ariaLabel = 'Status Bar',
}: StatusBarProps) => {
  const groups = {
    left: widgets.filter((w) => w.alignment === 'left').sort(byPriority),
    center: widgets.filter((w) => w.alignment === 'center').sort(byPriority),
    right: widgets.filter((w) => w.alignment === 'right').sort(byPriority),
  };

  const renderWidget = (widget: IStatusBarWidget) => {
    const Icon = widget.icon;
    const isInteractive = !!widget.onClick;

    return (
      <div
        key={widget.id}
        onClick={widget.onClick}
        onKeyDown={
          isInteractive
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  widget.onClick?.();
                }
              }
            : undefined
        }
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        className={cn(
          'flex items-center space-x-1.5 px-2 py-0.5 rounded transition-colors h-full focus:outline-none',
          isInteractive
            ? 'cursor-pointer hover:bg-white/10 focus:ring-1 focus:ring-white'
            : 'cursor-default',
          widget.className,
        )}
      >
        {Icon && <Icon size={12} />}
        {widget.label && <span>{widget.label}</span>}
      </div>
    );
  };

  return (
    <footer
      role="status"
      aria-label={ariaLabel}
      className={cn(
        'h-6 bg-primary text-primary-foreground text-[11px] flex items-center justify-between px-1 select-none shrink-0 border-t border-white/5',
        className,
      )}
    >
      <div className="flex items-center space-x-1 h-full">
        {groups.left.map(renderWidget)}
      </div>
      <div className="flex items-center space-x-1 h-full">
        {groups.center.map(renderWidget)}
      </div>
      <div className="flex items-center space-x-1 h-full">
        {groups.right.map(renderWidget)}
      </div>
    </footer>
  );
};
