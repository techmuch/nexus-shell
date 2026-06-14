import { useState, useEffect } from 'react';
import { menuRegistry, IMenuItem } from '../../core/registry/MenuRegistry';
import { commandRegistry } from '../../core/registry/CommandRegistry';
import { ChevronRight } from 'lucide-react';

interface MenuBarProps {
  title?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export const MenuBar = ({ title, rightContent }: MenuBarProps) => {
  const [menus, setMenus] = useState<Record<string, IMenuItem[]>>(menuRegistry.getAllMenus());

  useEffect(() => {
    // Initial sync
    setMenus(menuRegistry.getAllMenus());
  }, []);

  const handleCommand = (commandId?: string) => {
    if (commandId) {
      commandRegistry.executeCommand(commandId);
    }
  };

  const renderKeybinding = (item: IMenuItem) => {
    const binding = item.keybinding || (item.commandId && commandRegistry.getCommand(item.commandId)?.keybinding);
    if (!binding) return null;
    return (
      <span className="text-[10px] text-muted-foreground opacity-60 ml-4">
        {binding}
      </span>
    );
  };

  const renderMenuItems = (items: IMenuItem[]) => {
    return (
      <div className="absolute left-0 top-full hidden group-hover:block z-50 min-w-[180px] bg-popover text-popover-foreground border shadow-md rounded-md py-1">
        {items.map((item) => (
          <div key={item.id} className="relative group/sub">
            <div
              className="px-3 py-1.5 hover:bg-accent hover:text-accent-foreground cursor-pointer text-xs flex justify-between items-center"
              onClick={() => !item.submenu && handleCommand(item.commandId)}
            >
              <span>{item.label}</span>
              <div className="flex items-center space-x-2">
                {renderKeybinding(item)}
                {item.submenu && <ChevronRight size={10} />}
              </div>
            </div>
            
            {item.submenu && (
              <div className="absolute left-full top-0 hidden group-hover/sub:block z-[60] min-w-[180px] bg-popover text-popover-foreground border shadow-md rounded-md py-1 ml-[-2px]">
                {item.submenu.map(subItem => (
                  <div
                    key={subItem.id}
                    className="px-3 py-1.5 hover:bg-accent hover:text-accent-foreground cursor-pointer text-xs flex justify-between items-center"
                    onClick={() => handleCommand(subItem.commandId)}
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
  };

  return (
    <header 
      role="banner" 
      aria-label="Application Header" 
      className={`bg-muted border-b flex items-center justify-between px-4 select-none shrink-0 transition-all ${
        title ? "h-12 bg-card/65 backdrop-blur-sm" : "h-8"
      }`}
    >
      <div className="flex items-center">
        {title !== undefined ? (
          title
        ) : (
          <div className="font-semibold mr-6 text-sm">Nexus Shell</div>
        )}
        <nav role="navigation" aria-label="Main Menu" className="flex space-x-1 text-sm">
          {Object.entries(menus).map(([name, items]) => (
            <div key={name} className="relative group">
              <div className="cursor-pointer hover:bg-accent hover:text-accent-foreground px-3 py-1 rounded text-xs">
                {name}
              </div>
              {items.length > 0 && renderMenuItems(items)}
            </div>
          ))}
        </nav>
      </div>
      
      {rightContent && (
        <div className="flex items-center">
          {rightContent}
        </div>
      )}
    </header>
  );
};
