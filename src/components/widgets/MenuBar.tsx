import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
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
 * The application menu bar: a row of menu buttons with dropdowns and optional
 * one-level submenus, plus slots for branding, a centre widget and right-hand
 * actions.
 *
 * Presentational and fully controlled — menus come in as data and selections go
 * out through `onSelect`. It reads no registry. For the variant wired to the
 * {@link menuRegistry} and {@link commandRegistry}, see `ConnectedMenuBar`.
 *
 * # Open and closed are state, not hover
 *
 * The menus used to be CSS hover: shown while the pointer was over them. So a
 * menu stayed open after an item was chosen (the pointer was still there),
 * Escape could not close it, and a keyboard could not open one at all. Now a
 * menu opens on a click or a key and closes when an item is chosen, on
 * Escape, on Tab, or on a click elsewhere. While one is open, pointing at
 * another switches to it, as desktop menu bars do.
 *
 * Keys, following the WAI-ARIA menu button pattern: Enter, Space or ↓ on a
 * menu name opens it at its first item, ↑ at its last; ↑ ↓ Home End move
 * through items; ← → move to the neighbouring menu; → or Enter on an item with
 * a submenu opens it and ← closes it; Escape closes and returns focus to the
 * menu's name.
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
  const names = Object.keys(menus);
  const [open, setOpen] = useState<string | null>(null);
  // The item whose submenu is showing, within the open menu.
  const [openSub, setOpenSub] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const buttons = useRef<Record<string, HTMLButtonElement | null>>({});
  const baseId = useId();
  const menuId = (name: string) => `${baseId}-menu-${names.indexOf(name)}`;

  const close = useCallback((focusName?: string) => {
    setOpen(null);
    setOpenSub(null);
    if (focusName) buttons.current[focusName]?.focus();
  }, []);

  // A click anywhere else closes the open menu.
  useEffect(() => {
    if (open === null) return;
    const onDown = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, close]);

  /** The focusable items of a menu element, in order. */
  const itemsIn = (el: Element | null) =>
    el ? Array.from(el.querySelectorAll<HTMLElement>(':scope > div > [role="menuitem"], :scope > [role="menuitem"]')) : [];

  /** Open a menu and put focus on its first or last item. */
  const openAt = (name: string, where: 'first' | 'last' | 'none') => {
    setOpen(name);
    setOpenSub(null);
    if (where === 'none') return;
    requestAnimationFrame(() => {
      const items = itemsIn(document.getElementById(menuId(name)));
      (where === 'first' ? items[0] : items[items.length - 1])?.focus();
    });
  };

  const neighbour = (name: string, step: number) =>
    names[(names.indexOf(name) + step + names.length) % names.length];

  const choose = (item: IMenuItem) => {
    close();
    onSelect?.(item);
  };

  const onButtonKey = (e: KeyboardEvent<HTMLButtonElement>, name: string) => {
    const go: Record<string, () => void> = {
      ArrowDown: () => openAt(name, 'first'),
      Enter: () => openAt(name, 'first'),
      ' ': () => openAt(name, 'first'),
      ArrowUp: () => openAt(name, 'last'),
      ArrowRight: () => {
        const next = neighbour(name, 1);
        buttons.current[next]?.focus();
        if (open !== null) openAt(next, 'none');
      },
      ArrowLeft: () => {
        const prev = neighbour(name, -1);
        buttons.current[prev]?.focus();
        if (open !== null) openAt(prev, 'none');
      },
      Escape: () => close(name),
    };
    const run = go[e.key];
    if (run) { e.preventDefault(); run(); }
  };

  /** Keys inside a menu or a submenu. */
  const onMenuKey = (e: KeyboardEvent<HTMLElement>, name: string, item: IMenuItem, parent?: IMenuItem) => {
    const inSub = parent !== undefined;
    const list = e.currentTarget.closest('[role="menu"]');
    const items = itemsIn(list);
    const at = items.indexOf(e.currentTarget);
    const focus = (i: number) => items[(i + items.length) % items.length]?.focus();
    const go: Record<string, () => void> = {
      ArrowDown: () => focus(at + 1),
      ArrowUp: () => focus(at - 1),
      Home: () => focus(0),
      End: () => focus(items.length - 1),
      Escape: () => (inSub ? closeSub() : close(name)),
      Tab: () => close(),
      ArrowRight: () => {
        if (!inSub && item.submenu) return openSubAt(item);
        const next = neighbour(name, 1);
        buttons.current[next]?.focus();
        openAt(next, 'first');
      },
      ArrowLeft: () => {
        if (inSub) return closeSub();
        const prev = neighbour(name, -1);
        buttons.current[prev]?.focus();
        openAt(prev, 'first');
      },
      Enter: () => (item.submenu ? openSubAt(item) : choose(item)),
      ' ': () => (item.submenu ? openSubAt(item) : choose(item)),
    };
    const run = go[e.key];
    if (run) {
      if (e.key !== 'Tab') e.preventDefault();
      run();
    }

    function closeSub() {
      setOpenSub(null);
      if (parent) document.getElementById(`${menuId(name)}-item-${parent.id}`)?.focus();
    }
    function openSubAt(it: IMenuItem) {
      setOpenSub(it.id);
      requestAnimationFrame(() => {
        const sub = document.getElementById(`${menuId(name)}-sub-${it.id}`);
        itemsIn(sub)[0]?.focus();
      });
    }
  };

  const renderKeybinding = (item: IMenuItem) =>
    item.keybinding ? (
      <span className="text-[10px] text-muted-foreground opacity-60 ml-4">
        {item.keybinding}
      </span>
    ) : null;

  const itemClass =
    'px-3 py-1.5 hover:bg-accent hover:text-accent-foreground cursor-pointer text-xs flex justify-between items-center focus:outline-none focus:bg-accent focus:text-accent-foreground';

  const renderItems = (name: string, items: IMenuItem[]) => (
    <div
      id={menuId(name)}
      role="menu"
      aria-label={name}
      className="absolute left-0 top-full z-50 min-w-[180px] bg-popover text-popover-foreground border shadow-md rounded-md py-1"
    >
      {items.map((item) => (
        <div key={item.id} className="relative">
          <div
            id={`${menuId(name)}-item-${item.id}`}
            role="menuitem"
            tabIndex={-1}
            aria-haspopup={item.submenu ? 'menu' : undefined}
            aria-expanded={item.submenu ? openSub === item.id : undefined}
            onClick={() => (item.submenu ? setOpenSub(openSub === item.id ? null : item.id) : choose(item))}
            onMouseEnter={() => setOpenSub(item.submenu ? item.id : null)}
            onKeyDown={(e) => onMenuKey(e, name, item)}
            className={itemClass}
          >
            <span>{item.label}</span>
            <div className="flex items-center space-x-2">
              {renderKeybinding(item)}
              {item.submenu && <ChevronRight size={10} aria-hidden />}
            </div>
          </div>

          {item.submenu && openSub === item.id && (
            <div
              id={`${menuId(name)}-sub-${item.id}`}
              role="menu"
              aria-label={item.label}
              className="absolute left-full top-0 z-[60] min-w-[180px] bg-popover text-popover-foreground border shadow-md rounded-md py-1 ml-[-2px]"
            >
              {item.submenu.map((subItem) => (
                <div
                  key={subItem.id}
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => choose(subItem)}
                  onKeyDown={(e) => onMenuKey(e, name, subItem, item)}
                  className={itemClass}
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
          ref={navRef}
          role="navigation"
          aria-label="Main Menu"
          className="flex space-x-1 text-sm shrink-0"
        >
          {names.map((name) => {
            const items = menus[name];
            const isOpen = open === name && items.length > 0;
            return (
              <div key={name} className="relative">
                <button
                  ref={(el) => { buttons.current[name] = el; }}
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isOpen}
                  aria-controls={isOpen ? menuId(name) : undefined}
                  onClick={() => (open === name ? close() : openAt(name, 'none'))}
                  // Pointing at another menu while one is open switches to it.
                  onMouseEnter={() => { if (open !== null && open !== name) openAt(name, 'none'); }}
                  onKeyDown={(e) => onButtonKey(e, name)}
                  className={cn(
                    'cursor-pointer hover:bg-accent hover:text-accent-foreground px-3 py-1 rounded text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isOpen && 'bg-accent text-accent-foreground',
                  )}
                >
                  {name}
                </button>
                {isOpen && renderItems(name, items)}
              </div>
            );
          })}
        </nav>

        {center && (
          <div className="ml-8 w-60 md:w-72 relative hidden sm:block">{center}</div>
        )}
      </div>

      {right && <div className="flex items-center ml-4 shrink-0">{right}</div>}
    </header>
  );
};
