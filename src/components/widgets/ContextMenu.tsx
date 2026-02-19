import React, { useEffect, useRef } from 'react';

export interface IContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  divider?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: IContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[1000] min-w-[160px] bg-popover text-popover-foreground border shadow-md rounded-md py-1 animate-in fade-in zoom-in-95 duration-100"
      style={{ top: y, left: x }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.divider && <div className="h-[1px] bg-border my-1" />}
          <div
            className="px-3 py-1.5 hover:bg-accent hover:text-accent-foreground cursor-pointer text-xs flex items-center"
            onClick={() => {
              item.onClick();
              onClose();
            }}
          >
            {item.icon && <span className="mr-2 opacity-70">{item.icon}</span>}
            <span>{item.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};
