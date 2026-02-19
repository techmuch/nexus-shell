import { Layout, TabNode } from 'flexlayout-react'
import 'flexlayout-react/style/light.css'
import { MenuBar } from '../widgets/MenuBar'
import { StatusBar } from '../widgets/StatusBar'
import { ActivityBar } from '../widgets/ActivityBar'
import { useLayoutStore } from '../../core/services/LayoutService'

export const ShellLayout = () => {
  const { model, setModel } = useLayoutStore()

  const factory = (node: TabNode) => {
    var component = node.getComponent();
    if (component === "welcome") {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-8">
            <h1 className="text-4xl font-bold text-primary">Nexus Shell</h1>
            <p className="text-muted-foreground">A professional-grade frontend framework built with React and TypeScript.</p>
            <p className="text-sm text-muted-foreground">Start by exploring the menu or dragging tabs.</p>
        </div>
      );
    }
    return <div className="p-4">Unknown Component: {component}</div>;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden">
      <MenuBar />
      <div className="flex-1 flex overflow-hidden">
        <ActivityBar />
        <div className="flex-1 relative bg-card h-full w-full">
           <Layout 
             model={model} 
             factory={factory} 
             onModelChange={(model) => setModel(model)}
           />
        </div>
      </div>
      <StatusBar />
    </div>
  )
}
