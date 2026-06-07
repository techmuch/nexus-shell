import { Settings } from "lucide-react"
import { useSidebarStore } from "../../core/services/SidebarService"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const ActivityBar = () => {
  const { activeSidebar, toggleSidebar, panels } = useSidebarStore()

  return (
    <aside role="navigation" aria-label="Activity Bar" className="w-12 h-full bg-muted border-r flex flex-col items-center py-2 select-none">
      <div className="flex-1 flex flex-col space-y-4">
        {panels.map((panel) => {
          const Icon = panel.icon;
          return (
            <div
              key={panel.id}
              onClick={() => toggleSidebar(panel.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleSidebar(panel.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={panel.label}
              aria-pressed={activeSidebar === panel.id}
              className={cn(
                "p-2 cursor-pointer rounded text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
                activeSidebar === panel.id && "text-foreground border-l-2 border-primary rounded-none"
              )}
            >
              <Icon size={24} />
            </div>
          );
        })}
      </div>
      <div 
        onClick={() => toggleSidebar('settings')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleSidebar('settings');
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Settings"
        aria-pressed={activeSidebar === 'settings'}
        className={cn(
          "p-2 cursor-pointer rounded text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
          activeSidebar === 'settings' && "text-foreground border-l-2 border-primary rounded-none"
        )}
      >
        <Settings size={24} />
      </div>
    </aside>
  )
}
