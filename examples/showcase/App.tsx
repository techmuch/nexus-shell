import { ShellLayout } from '../../src/components/layout/ShellLayout'
import { useKeyboardShortcuts } from '../../src/core/services/KeyboardService'
import { ConnectedCommandPalette } from '../../src/connected/ConnectedCommandPalette'
import { ConnectedUserProfile } from '../../src/connected/ConnectedUserProfile'

import { ConnectedThemeSwitcher } from '../../src/connected/ConnectedThemeSwitcher'
import { NexusWorkspaceShell } from './app/NexusWorkspaceShell'
import { ConnectedModal } from '../../src/connected/ConnectedModal'
import { UnifiedWorkbench } from './dialogue-mapper/DialogueMappingComposition.stories'

function App() {
  useKeyboardShortcuts()

  const queryParams = new URLSearchParams(window.location.search);
  const layoutParam = queryParams.get('layout');

  if (layoutParam === 'dialogue') {
    return (
      <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col">
        <ConnectedModal />
        <ConnectedCommandPalette />
        <NexusWorkspaceShell />
      </div>
    );
  }

  if (layoutParam === 'composition') {
    return (
      <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col theme-dark">
        <ConnectedModal />
        <ConnectedCommandPalette />
        <UnifiedWorkbench />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col">
      <ConnectedModal />
      <ConnectedCommandPalette />
      <ShellLayout 
        rightMenuBarContent={
          <div className="flex items-center space-x-3 select-none">
            <ConnectedThemeSwitcher />
            <ConnectedUserProfile />
          </div>
        }
      />
    </div>
  )
}

export default App
