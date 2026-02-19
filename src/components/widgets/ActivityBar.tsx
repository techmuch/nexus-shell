import { Files, Search, Settings, GitGraph, Plug } from "lucide-react"
import { useSidebarStore, SidebarType } from "../../core/services/SidebarService"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const ActivityBar = () => {
  const { activeSidebar, toggleSidebar } = useSidebarStore()

  const items: { type: SidebarType, icon: any, label: string }[] = [
    { type: 'files', icon: Files, label: 'Explorer' },
    { type: 'search', icon: Search, label: 'Search' },
    { type: 'git', icon: GitGraph, label: 'Source Control' },
    { type: 'plugins', icon: Plug, label: 'Extensions' },
  ]

  return (
    <div className="w-12 h-full bg-muted border-r flex flex-col items-center py-2 select-none">
      <div className="flex-1 flex flex-col space-y-4">
        {items.map(({ type, icon: Icon, label }) => (
          <div
            key={type}
            onClick={() => toggleSidebar(type)}
            aria-label={label}
            className={cn(
              "p-2 cursor-pointer rounded text-muted-foreground hover:text-foreground transition-colors",
              activeSidebar === type && "text-foreground border-l-2 border-primary rounded-none"
            )}
          >
            <Icon size={24} />
          </div>
        ))}
      </div>
      <div 
        onClick={() => toggleSidebar('settings')}
        aria-label="Settings"
        className={cn(
          "p-2 cursor-pointer rounded text-muted-foreground hover:text-foreground transition-colors",
          activeSidebar === 'settings' && "text-foreground border-l-2 border-primary rounded-none"
        )}
      >
        <Settings size={24} />
      </div>
    </div>
  )
}
