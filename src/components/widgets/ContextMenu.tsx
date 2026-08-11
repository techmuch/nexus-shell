import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/cn';

/** An entry in a {@link ContextMenu}. */
export interface IContextMenuItem {
  /** Label shown for the entry. */
  label: string;
  /** Optional element rendered before the label, e.g. `<Plus size={14} />`. */
  icon?: React.ReactNode;
  /** Runs on click. The menu closes afterwards. */
  onClick: () => void;
  /** Draw a separator above this entry. */
  divider?: boolean;
  /** Render the entry greyed out and non-interactive. */
  disabled?: boolean;
}

export interface ContextMenuProps {
  /** Viewport x coordinate, typically `event.clientX`. */
  x: number;
  /** Viewport y coordinate, typically `event.clientY`. */
  y: number;
  /** Entries to show, in order. */
  items: IContextMenuItem[];
  /** Called on outside click, on Escape, and after any entry is chosen. */
  onClose: () => void;
  /** Extra classes merged onto the menu surface. */
  className?: string;
}

/**
 * A floating menu positioned at viewport coordinates, for right-click menus.
 *
 * Renders `position: fixed` at the given point and closes on outside click or
 * Escape. It does not decide when to appear — mount it conditionally from your
 * own `onContextMenu` handler and store the coordinates yourself.
 *
 * @example
 * ```tsx
 * {menu && (
 *   <ContextMenu
 *     x={menu.x}
 *     y={menu.y}
 *     items={[{ label: 'Delete', onClick: () => remove(menu.id) }]}
 *     onClose={() => setMenu(null)}
 *   />
 * )}
 * ```
 */
export const ContextMenu = ({ x, y, items, onClose, className }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      role="menu"
      style={{ top: y, left: x }}
      className={cn(
        'fixed z-[1000] min-w-[160px] bg-popover text-popover-foreground border shadow-md rounded-md py-1 animate-in fade-in zoom-in-95 duration-100',
        className,
      )}
    >
      {items.map((item, index) => (
        <React.Fragment key={`${item.label}-${index}`}>
          {item.divider && <div className="h-[1px] bg-border my-1" />}
          <div
            role="menuitem"
            tabIndex={item.disabled ? undefined : 0}
            aria-disabled={item.disabled}
            onClick={() => {
              if (item.disabled) return;
              item.onClick();
              onClose();
            }}
            onKeyDown={(e) => {
              if (item.disabled || (e.key !== 'Enter' && e.key !== ' ')) return;
              e.preventDefault();
              item.onClick();
              onClose();
            }}
            className={cn(
              'px-3 py-1.5 text-xs flex items-center focus:outline-none',
              item.disabled
                ? 'opacity-40 cursor-default'
                : 'cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent',
            )}
          >
            {item.icon && <span className="mr-2 opacity-70">{item.icon}</span>}
            <span>{item.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};
