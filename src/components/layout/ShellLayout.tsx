import { Layout, TabNode, Actions, Action, Model } from 'flexlayout-react'
import 'flexlayout-react/style/light.css'
import '../../styles/flexlayout-theme.css'
import { MenuBar } from '../widgets/MenuBar'
import { StatusBar } from '../widgets/StatusBar'
import { ActivityBar } from '../widgets/ActivityBar'
import { SidebarPane } from '../widgets/SidebarPane'
import { ChatPane } from '../widgets/ChatPane'
import { TerminalPane } from '../widgets/TerminalPane'
import { useLayoutStore } from '../../core/services/LayoutService'
import { useThemeStore } from '../../core/services/ThemeService'
import { useSidebarStore, ISidebarPanel } from '../../core/services/SidebarService'
import { useChatStore, ISlashCommand } from '../../core/services/ChatService'
import { useStatusBarStore, IStatusBarWidget } from '../../core/services/StatusBarService'
import { menuRegistry, IMenuItem } from '../../core/registry/MenuRegistry'
import { componentRegistry } from '../../core/registry/ComponentRegistry'
import { useEffect } from 'react'

interface ShellLayoutProps {
  panels?: ISidebarPanel[];
  slashCommands?: ISlashCommand[];
  menuConfig?: Record<string, IMenuItem[]>;
  statusBarConfig?: IStatusBarWidget[];
  rightMenuBarContent?: React.ReactNode;
  title?: React.ReactNode;
  layoutModel?: Model;
}

export const ShellLayout = ({ 
  panels, 
  slashCommands, 
  menuConfig, 
  statusBarConfig, 
  rightMenuBarContent,
  title,
  layoutModel
}: ShellLayoutProps) => {
  const { model, setModel, isTabDirty, setTabDirty } = useLayoutStore()
  const { theme } = useThemeStore()
  const { setPanels } = useSidebarStore()
  const { setSlashCommands } = useChatStore()
  const { setWidgets } = useStatusBarStore()

  useEffect(() => {
    if (panels) {
      setPanels(panels);
    }
  }, [panels, setPanels]);

  useEffect(() => {
    if (slashCommands) {
      setSlashCommands(slashCommands);
    }
  }, [slashCommands, setSlashCommands]);

  useEffect(() => {
    if (menuConfig) {
      menuRegistry.setMenus(menuConfig);
    }
  }, [menuConfig]);

  useEffect(() => {
    if (statusBarConfig) {
      setWidgets(statusBarConfig);
    }
  }, [statusBarConfig, setWidgets]);

  const factory = (node: TabNode) => {
    try {
      const componentId = node.getComponent();
      const config = node.getConfig() || {};
 
      // Check the Component Registry for dynamic components
      const RegisteredComponent = componentId ? componentRegistry.get(componentId) : undefined;
      if (RegisteredComponent) {
        return <RegisteredComponent node={node} {...config} />;
      }

      return <div className="p-4 text-sm">Unknown Component: {componentId}</div>;
    } catch (e) {
      console.error("Error in component factory:", e);
      return <div className="p-8 text-destructive bg-destructive/10 border border-destructive/20 h-full flex items-center justify-center">
        Error rendering component: {e instanceof Error ? e.message : 'Unknown error'}
      </div>;
    }
  }

  const onAction = (action: Action) => {
    if (action.type === Actions.DELETE_TAB) {
      const node = model.getNodeById(action.data.node) as TabNode;
      if (node && isTabDirty(node.getId())) {
        if (!window.confirm(`Tab "${node.getName()}" has unsaved changes. Are you sure you want to close it?`)) {
          return undefined; // Cancel the close action
        }
        // If confirmed, clean up the dirty state
        setTabDirty(node.getId(), false);
      }
    }
    return action;
  }

  return (
    <div className={`flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden theme-${theme}`}>
      <MenuBar title={title} rightContent={rightMenuBarContent} />
      <div className="flex-1 flex overflow-hidden">
        <ActivityBar />
        <SidebarPane />
        <div className="flex-1 flex flex-col min-w-0 bg-card">
           <div className="flex-1 relative h-full w-full">
              <Layout 
                model={layoutModel || model} 
                factory={factory} 
                onModelChange={(m) => {
                  if (layoutModel) {
                    // If model is controlled/overridden by layoutModel prop, don't write to global store
                  } else {
                    setModel(m);
                  }
                }}
                onAction={onAction}
              />
           </div>
           <TerminalPane />
        </div>
        <ChatPane />
      </div>
      <StatusBar />
    </div>
  )
}
