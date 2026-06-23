import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { Layout, TabNode } from 'flexlayout-react';
import 'flexlayout-react/style/light.css';
import '../../styles/flexlayout-theme.css';

import { DialogueMappingWidget } from '../widgets/DialogueMappingWidget';
import { ThemeSwitcher } from '../widgets/ThemeSwitcher';
import { NexusWorkspaceTitle } from '../widgets/NexusWorkspaceTitle';
import { ActivityBar } from '../widgets/ActivityBar';
import { SidebarPane } from '../widgets/SidebarPane';
import { ProjectPropertiesWidget } from '../widgets/ProjectPropertiesWidget';
import { MenuBar } from '../widgets/MenuBar';
import { useThemeStore } from '../../core/services/ThemeService';
import { useLayoutStore, dialogueMappingLayoutJson } from '../../core/services/LayoutService';
import { 
  Settings, 
  Circle
} from 'lucide-react';
import { UserProfile } from '../widgets/UserProfile';
import { clsx, type ClassValue } from 'clsx';
import { componentRegistry } from '../../core/registry/ComponentRegistry';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}



export interface NexusWorkspaceShellProps {
  disableLocalStorage?: boolean;
  initialLayoutJson?: any;
  onLayoutChange?: (model: any) => void;
}

export const NexusWorkspaceShell: React.FC<NexusWorkspaceShellProps> = ({
  disableLocalStorage,
  initialLayoutJson,
  onLayoutChange
}) => {
  const { theme } = useThemeStore();
  const { model, setStorageKey, setModel, initLayout } = useLayoutStore();

  React.useEffect(() => {
    if (initialLayoutJson !== undefined || disableLocalStorage) {
      initLayout(initialLayoutJson, disableLocalStorage);
    } else {
      setStorageKey('nexus-workspace-shell', dialogueMappingLayoutJson);
    }
  }, [setStorageKey, initLayout, initialLayoutJson, disableLocalStorage]);

  const factory = (node: TabNode) => {
    const component = node.getComponent();
    
    if (component === "dialogue-canvas" || component === "dialogue-map") {
      const config = node.getConfig() || {};
      const mapId = config.mapId;
      
      return (
        <ReactFlowProvider>
          <DialogueMappingWidget mapId={mapId} node={node} />
        </ReactFlowProvider>
      );
    }

    if (component === "project-properties") {
      const config = node.getConfig() || {};
      return <ProjectPropertiesWidget projectId={config.projectId} projectName={config.projectName} />;
    }
    
    if (component) {
      const RegisteredComponent = componentRegistry.get(component);
      if (RegisteredComponent) {
        return <RegisteredComponent node={node} />;
      }
    }
    
    return null;
  };

  return (
    <div className={cn(
      "h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground",
      theme === 'dark' ? 'theme-dark' : theme === 'gt' ? 'theme-gt' : 'theme-light'
    )}>
      
      {/* 1. Header Menubar */}
      <MenuBar 
        title={<NexusWorkspaceTitle title="NEXUS DIALOGUE MAPPER" subtitle="IBIS Decision & Argumentation Modeling" />}
        rightContent={
          <div className="flex items-center space-x-3 select-none z-50">
            <ThemeSwitcher />
            <UserProfile showName={false} />
          </div>
        }
      />

      {/* 2. Main FlexLayout Workspace */}
      <div className="flex-1 overflow-hidden min-h-0 relative bg-muted/20 flex flex-row">
        <ActivityBar />
        <SidebarPane />
        <main className="flex-1 overflow-hidden relative">
          <Layout 
            model={model} 
            factory={factory} 
            onModelChange={(newModel) => {
              setModel(newModel);
              if (onLayoutChange) {
                onLayoutChange(newModel.toJson());
              }
            }}
          />
        </main>
      </div>

      {/* 3. Bottom Status Bar */}
      <footer role="status" aria-label="Dialogue Mapper Status Bar" className="h-7 border-t border-border bg-card flex items-center justify-between px-4 shrink-0 select-none text-[10px] text-muted-foreground/80 font-mono">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5 font-semibold">
            <Circle size={8} fill="#22c55e" className="text-emerald-500 animate-pulse" />
            Connected
          </span>

          <span className="h-3 w-px bg-border/40" />

          <span className="italic text-muted-foreground/60 text-[9px]">Workspace Ready</span>

          <span className="h-3 w-px bg-border/40" />

          <button className="hover:text-foreground transition-colors">
            <Settings size={11} />
          </button>
        </div>
      </footer>
    </div>
  );
};
export default NexusWorkspaceShell;
