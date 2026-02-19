import { useState, useEffect } from 'react';
import { menuRegistry, IMenuItem } from '../../core/registry/MenuRegistry';
import { commandRegistry } from '../../core/registry/CommandRegistry';

export const MenuBar = () => {
  const [menus, setMenus] = useState<Record<string, IMenuItem[]>>({
    'File': menuRegistry.getMenu('File'),
    'Edit': menuRegistry.getMenu('Edit'),
    'View': menuRegistry.getMenu('View'),
    'Help': menuRegistry.getMenu('Help'),
  });

  // In a real app, we'd use an event emitter or store for registry updates
  useEffect(() => {
    const updateMenus = () => {
      setMenus({
        'File': menuRegistry.getMenu('File'),
        'Edit': menuRegistry.getMenu('Edit'),
        'View': menuRegistry.getMenu('View'),
        'Help': menuRegistry.getMenu('Help'),
      });
    };
    
    // Initial population and potential future listener
    updateMenus();
  }, []);

  const handleCommand = (commandId?: string) => {
    if (commandId) {
      commandRegistry.executeCommand(commandId);
    }
  };

  return (
    <div className="h-8 bg-muted border-b flex items-center px-4 select-none">
      <div className="font-semibold mr-6">Nexus Shell</div>
      <div className="flex space-x-1 text-sm">
        {Object.entries(menus).map(([name, items]) => (
          <div key={name} className="relative group">
            <div className="cursor-pointer hover:bg-accent hover:text-accent-foreground px-3 py-1 rounded">
              {name}
            </div>
            {items.length > 0 && (
              <div className="absolute left-0 top-full hidden group-hover:block z-50 min-w-[160px] bg-popover text-popover-foreground border shadow-md rounded-md py-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="px-3 py-1.5 hover:bg-accent hover:text-accent-foreground cursor-pointer text-xs flex justify-between items-center"
                    onClick={() => handleCommand(item.commandId)}
                  >
                    <span>{item.label}</span>
                    {item.commandId && commandRegistry.getCommand(item.commandId)?.keybinding && (
                      <span className="ml-4 text-[10px] text-muted-foreground">
                        {commandRegistry.getCommand(item.commandId)?.keybinding}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
