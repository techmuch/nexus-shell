import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';

/** An entry in a {@link MenuBar} dropdown. */
export interface IMenuItem {
  /** Stable identifier reported to `onSelect`. */
  id: string;
  /** Label shown in the dropdown. */
  label: string;
  /** Keybinding hint shown right-aligned, e.g. `"⌘S"`. */
  keybinding?: string;
  /** Nested items. An item with a submenu is not itself selectable. */
  submenu?: IMenuItem[];
}

export interface MenuBarProps {
  /**
   * Menus keyed by top-level label, e.g. `{ File: [...], Edit: [...] }`.
   * Insertion order determines display order.
   */
  menus?: Record<string, IMenuItem[]>;
  /** Called with the chosen leaf item. Items with a `submenu` never fire this. */
  onSelect?: (item: IMenuItem) => void;
  /**
   * Branding shown at the far left. Pass a string, a logo element, or omit it
   * for the default wordmark. Providing a `title` switches the bar to its
   * taller, translucent variant.
   */
  title?: ReactNode;
  /**
   * Slot between the menus and the right edge, sized for a search input. The
   * bar renders whatever you pass — it does not embed a search component.
   */
  center?: ReactNode;
  /** Slot at the far right, for a theme switcher, avatar, or actions. */
  right?: ReactNode;
  /** Extra classes merged onto the root `<header>`. */
  className?: string;
}

/**
 * The application menu bar: a row of hover-activated dropdowns with optional
 * one-level submenus, plus slots for branding, a centre widget and right-hand
 * actions.
 *
 * Presentational and fully controlled — menus come in as data and selections go
 * out through `onSelect`. It reads no registry. For the variant wired to the
 * {@link menuRegistry} and {@link commandRegistry}, see `ConnectedMenuBar`.
 *
 * @example
 * ```tsx
 * <MenuBar
 *   menus={{ File: [{ id: 'save', label: 'Save', keybinding: '⌘S' }] }}
 *   onSelect={(item) => run(item.id)}
 *   right={<ThemeSwitcher value={theme} onChange={setTheme} />}
 * />
 * ```
 */
export const MenuBar = ({
  menus = {},
  onSelect,
  title,
  center,
  right,
  className,
}: MenuBarProps) => {
  const renderKeybinding = (item: IMenuItem) =>
    item.keybinding ? (
      <span className="text-[10px] text-muted-foreground opacity-60 ml-4">
        {item.keybinding}
      </span>
    ) : null;

  const renderItems = (items: IMenuItem[]) => (
    <div
      role="menu"
      className="absolute left-0 top-full hidden group-hover:block z-50 min-w-[180px] bg-popover text-popover-foreground border shadow-md rounded-md py-1"
    >
      {items.map((item) => (
        <div key={item.id} className="relative group/sub">
          <div
            role="menuitem"
            tabIndex={0}
            onClick={() => !item.submenu && onSelect?.(item)}
            onKeyDown={(e) => {
              if (!item.submenu && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onSelect?.(item);
              }
            }}
            className="px-3 py-1.5 hover:bg-accent hover:text-accent-foreground cursor-pointer text-xs flex justify-between items-center focus:outline-none focus:bg-accent"
          >
            <span>{item.label}</span>
            <div className="flex items-center space-x-2">
              {renderKeybinding(item)}
              {item.submenu && <ChevronRight size={10} />}
            </div>
          </div>

          {item.submenu && (
            <div
              role="menu"
              className="absolute left-full top-0 hidden group-hover/sub:block z-[60] min-w-[180px] bg-popover text-popover-foreground border shadow-md rounded-md py-1 ml-[-2px]"
            >
              {item.submenu.map((subItem) => (
                <div
                  key={subItem.id}
                  role="menuitem"
                  tabIndex={0}
                  onClick={() => onSelect?.(subItem)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect?.(subItem);
                    }
                  }}
                  className="px-3 py-1.5 hover:bg-accent hover:text-accent-foreground cursor-pointer text-xs flex justify-between items-center focus:outline-none focus:bg-accent"
                >
                  <span>{subItem.label}</span>
                  {renderKeybinding(subItem)}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <header
      role="banner"
      aria-label="Application Header"
      className={cn(
        'bg-muted border-b flex items-center justify-between px-4 select-none shrink-0 transition-all z-50 relative',
        title !== undefined ? 'h-12 bg-card/65 backdrop-blur-sm' : 'h-8',
        className,
      )}
    >
      <div className="flex items-center flex-1 min-w-0">
        {title !== undefined ? (
          <div className="mr-12 flex items-center shrink-0">{title}</div>
        ) : (
          <div className="font-semibold mr-6 text-sm shrink-0">Nexus Shell</div>
        )}

        <nav
          role="navigation"
          aria-label="Main Menu"
          className="flex space-x-1 text-sm shrink-0"
        >
          {Object.entries(menus).map(([name, items]) => (
            <div key={name} className="relative group">
              <div
                role="button"
                tabIndex={0}
                aria-haspopup="menu"
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground px-3 py-1 rounded text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {name}
              </div>
              {items.length > 0 && renderItems(items)}
            </div>
          ))}
        </nav>

        {center && (
          <div className="ml-8 w-60 md:w-72 relative hidden sm:block">{center}</div>
        )}
      </div>

      {right && <div className="flex items-center ml-4 shrink-0">{right}</div>}
    </header>
  );
};
