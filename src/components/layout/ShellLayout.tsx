import { Layout, TabNode, Actions, Action } from 'flexlayout-react'
import 'flexlayout-react/style/light.css'
import { MenuBar } from '../widgets/MenuBar'
import { StatusBar } from '../widgets/StatusBar'
import { ActivityBar } from '../widgets/ActivityBar'
import { SidebarPane } from '../widgets/SidebarPane'
import { ChatPane } from '../widgets/ChatPane'
import { useLayoutStore } from '../../core/services/LayoutService'
import { useThemeStore } from '../../core/services/ThemeService'

export const ShellLayout = () => {
  const { model, setModel, isTabDirty, setTabDirty } = useLayoutStore()
  const { theme } = useThemeStore()

  const factory = (node: TabNode) => {
    try {
      var component = node.getComponent();
      const nodeId = node.getId();
      const dirty = isTabDirty(nodeId);

      if (component === "welcome") {
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-8">
              <h1 className="text-4xl font-bold text-primary">Nexus Shell</h1>
              <p className="text-muted-foreground">A professional-grade frontend framework built with React and TypeScript.</p>
              <p className="text-sm text-muted-foreground">Start by exploring the menu or dragging tabs.</p>
              
              <div className="mt-8 p-4 border rounded bg-muted/20">
                <p className="text-xs mb-2">Tab Persistence & Lifecycle Test:</p>
                <button 
                  onClick={() => setTabDirty(nodeId, !dirty)}
                  className={`px-3 py-1 text-xs rounded border ${dirty ? 'bg-destructive text-destructive-foreground' : 'bg-secondary text-secondary-foreground'}`}
                >
                  {dirty ? "Mark as Saved (Clear Dirty)" : "Mark as Dirty (Unsaved Changes)"}
                </button>
                {dirty && <p className="text-[10px] mt-1 text-destructive">This tab will now prompt before closing.</p>}
              </div>
          </div>
        );
      }
      
      // Future: Plugin-contributed components would be checked here
      return <div className="p-4 text-sm">Unknown Component: {component}</div>;
    } catch (e) {
      console.error("Error in component factory:", e);
      return <div className="p-8 text-destructive bg-destructive/10 border border-destructive/20 h-full flex items-center justify-center">
        Error rendering component: {(e as any)?.message || 'Unknown error'}
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
      <MenuBar />
      <div className="flex-1 flex overflow-hidden">
        <ActivityBar />
        <SidebarPane />
        <div className="flex-1 relative bg-card h-full w-full">
           <Layout 
             model={model} 
             factory={factory} 
             onModelChange={(model) => setModel(model)}
             onAction={onAction}
           />
        </div>
        <ChatPane />
      </div>
      <StatusBar />
    </div>
  )
}
