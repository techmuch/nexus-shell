import { useState, useEffect } from 'react';
import { menuRegistry, IMenuItem } from '../../core/registry/MenuRegistry';
import { commandRegistry } from '../../core/registry/CommandRegistry';
import { ChevronRight } from 'lucide-react';

export const MenuBar = () => {
  const [menus, setMenus] = useState<Record<string, IMenuItem[]>>(menuRegistry.getAllMenus());

  useEffect(() => {
    // Initial sync
    setMenus(menuRegistry.getAllMenus());
    
    // In a full implementation, we would add a listener here to the registry
  }, []);

  const handleCommand = (commandId?: string) => {
    if (commandId) {
      commandRegistry.executeCommand(commandId);
    }
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
                {item.commandId && commandRegistry.getCommand(item.commandId)?.keybinding && (
                  <span className="text-[10px] text-muted-foreground opacity-60">
                    {commandRegistry.getCommand(item.commandId)?.keybinding}
                  </span>
                )}
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
                    {subItem.commandId && commandRegistry.getCommand(subItem.commandId)?.keybinding && (
                      <span className="text-[10px] text-muted-foreground opacity-60">
                        {commandRegistry.getCommand(subItem.commandId)?.keybinding}
                      </span>
                    )}
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
    <div className="h-8 bg-muted border-b flex items-center px-4 select-none">
      <div className="font-semibold mr-6 text-sm">Nexus Shell</div>
      <div className="flex space-x-1 text-sm">
        {Object.entries(menus).map(([name, items]) => (
          <div key={name} className="relative group">
            <div className="cursor-pointer hover:bg-accent hover:text-accent-foreground px-3 py-1 rounded text-xs">
              {name}
            </div>
            {items.length > 0 && renderMenuItems(items)}
          </div>
        ))}
      </div>
    </div>
  );
};
