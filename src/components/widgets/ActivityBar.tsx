import type { LucideIcon } from 'lucide-react';
import { Settings } from 'lucide-react';
import { cn } from '../../lib/cn';

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
   * Items rendered in the bottom group, below the flex spacer. Defaults to a
   * single Settings item. Pass `[]` to render no bottom group.
   */
  bottomItems?: IActivityBarItem[];
  /** Id of the currently active item, or `null` when nothing is selected. */
  activeId?: string | null;
  /**
   * Called with the clicked item's id. Toggling — clicking the active item to
   * deselect it — is the caller's decision, not the component's.
   */
  onSelect?: (id: string) => void;
  /** Extra classes merged onto the root `<aside>`. */
  className?: string;
  /** Accessible label for the landmark. Defaults to `"Activity Bar"`. */
  'aria-label'?: string;
}

const DEFAULT_BOTTOM_ITEMS: IActivityBarItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings },
];

/**
 * The narrow vertical icon rail on the left edge of the shell, used to switch
 * which panel the sidebar shows.
 *
 * Controlled — it holds no selection state. For the store-backed variant used
 * by `ShellLayout`, see `ConnectedActivityBar`.
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
  bottomItems = DEFAULT_BOTTOM_ITEMS,
  activeId = null,
  onSelect,
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
        activeId === id && 'text-foreground border-l-2 border-primary rounded-none',
      )}
    >
      <Icon size={20} />
    </button>
  );

  return (
    <aside
      role="navigation"
      aria-label={ariaLabel}
      className={cn(
        'w-12 h-full bg-muted border-r flex flex-col items-center py-2 select-none',
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
