import type { LucideIcon } from 'lucide-react';

import { cn } from '../../lib/cn';
import type { PaneSide } from './SidebarPane';

/** A single icon button in the {@link ActivityBar}. */
export interface IActivityBarItem {
  /** Stable identifier reported to `onSelect`. */
  id: string;
  /** Accessible label and tooltip text. */
  label: string;
  /** `lucide-react` icon rendered at 20px. */
  icon: LucideIcon;
}

export interface ActivityBarProps {
  /** Items rendered in the main (top) group, in order. */
  items?: IActivityBarItem[];
  /**
   * Items rendered in the bottom group, below the flex spacer. Empty by
   * default.
   *
   * This used to default to a Settings item, which meant every rail grew one
   * whether the app had settings or not. Settings is now an ordinary panel with
   * `align: 'end'` — see `settingsPanel()`.
   */
  bottomItems?: IActivityBarItem[];
  /** Id of the currently active item, or `null` when nothing is selected. */
  activeId?: string | null;
  /**
   * Called with the clicked item's id. Toggling — clicking the active item to
   * deselect it — is the caller's decision, not the component's.
   */
  onSelect?: (id: string) => void;
  /**
   * Which edge of the shell the rail is docked to. Defaults to `"left"`.
   *
   * The divider and the active-item indicator both mirror, so a right-hand rail
   * marks its selection on the edge facing the content.
   */
  side?: Exclude<PaneSide, 'bottom'>;
  /** Extra classes merged onto the root `<aside>`. */
  className?: string;
  /** Accessible label for the landmark. Defaults to `"Activity Bar"`. */
  'aria-label'?: string;
}

/**
 * The narrow vertical icon rail at the edge of the shell, used to switch which
 * panel the adjacent {@link SidebarPane} shows.
 *
 * Controlled — it holds no selection state. `side` docks it left or right; for
 * the store-backed variants used by `ShellLayout`, see `ConnectedActivityBar`
 * and `ConnectedInspectorBar`.
 *
 * @example
 * ```tsx
 * <ActivityBar
 *   items={[{ id: 'files', label: 'Explorer', icon: Files }]}
 *   activeId={active}
 *   onSelect={(id) => setActive(id === active ? null : id)}
 * />
 * ```
 */
export const ActivityBar = ({
  items = [],
  bottomItems = [],
  activeId = null,
  onSelect,
  side = 'left',
  className,
  'aria-label': ariaLabel = 'Activity Bar',
}: ActivityBarProps) => {
  const renderItem = ({ id, label, icon: Icon }: IActivityBarItem) => (
    <button
      key={id}
      type="button"
      onClick={() => onSelect?.(id)}
      aria-label={label}
      title={label}
      aria-pressed={activeId === id}
      className={cn(
        'p-2 cursor-pointer rounded text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
        activeId === id && [
          'text-foreground border-primary rounded-none',
          // The marker sits on the edge facing the panel it opens.
          side === 'right' ? 'border-r-2' : 'border-l-2',
        ],
      )}
    >
      <Icon size={20} />
    </button>
  );

  return (
    <aside
      role="navigation"
      aria-label={ariaLabel}
      data-side={side}
      className={cn(
        'w-12 h-full bg-muted flex flex-col items-center py-2 select-none',
        side === 'right' ? 'border-l' : 'border-r',
        className,
      )}
    >
      <div className="flex-1 flex flex-col space-y-4">{items.map(renderItem)}</div>
      {bottomItems.length > 0 && (
        <div className="flex flex-col space-y-4">{bottomItems.map(renderItem)}</div>
      )}
    </aside>
  );
};
