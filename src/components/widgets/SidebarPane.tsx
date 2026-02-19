import { useSidebarStore } from "../../core/services/SidebarService"
import { useThemeStore, ThemeType } from "../../core/services/ThemeService"
import { X, Sun, Moon, GraduationCap } from "lucide-react"

export const SidebarPane = () => {
  const { activeSidebar, setActiveSidebar, panels } = useSidebarStore()
  const { theme, setTheme } = useThemeStore()

  if (!activeSidebar) return null;

  const activePanel = panels.find(p => p.id === activeSidebar);

  const renderContent = () => {
    if (activeSidebar === 'settings') {
      return (
        <div className="p-4 space-y-6">
          <section>
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase mb-3">Theme</h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'gt', label: 'Georgia Tech', icon: GraduationCap },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTheme(id as ThemeType)}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-md border text-sm transition-all
                    ${theme === id 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background hover:bg-accent border-border'}
                  `}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      );
    }

    if (activePanel) {
      if (typeof activePanel.component === 'function') {
        const Component = activePanel.component;
        return <Component />;
      }
      return activePanel.component;
    }

    return <div className="p-4 text-sm italic text-muted-foreground">Panel content not found.</div>;
  }

  const getTitle = () => {
    if (activeSidebar === 'settings') return 'SETTINGS';
    return activePanel?.label.toUpperCase() || '';
  }

  return (
    <div className="w-[300px] h-full bg-muted border-r flex flex-col select-none">
      <div className="h-10 flex items-center justify-between px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
        <span>{getTitle()}</span>
        <button 
          onClick={() => setActiveSidebar(null)}
          className="p-1 hover:bg-accent hover:text-foreground rounded transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-auto border-t border-border/50 bg-background/50">
        {renderContent()}
      </div>
    </div>
  )
}
