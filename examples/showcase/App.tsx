import { ShellLayout } from '../../src/components/layout/ShellLayout'
import { useKeyboardShortcuts } from '../../src/core/services/KeyboardService'
import { ConnectedCommandPalette } from '../../src/connected/ConnectedCommandPalette'
import { ConnectedUserProfile } from '../../src/connected/ConnectedUserProfile'

import { ConnectedThemeSwitcher } from '../../src/connected/ConnectedThemeSwitcher'
import { NexusWorkspaceShell } from './app/NexusWorkspaceShell'
import { ConnectedModal } from '../../src/connected/ConnectedModal'
import { UnifiedWorkbench } from './dialogue-mapper/DialogueMappingComposition.stories'
import type { IJsonModel } from 'flexlayout-react'

/**
 * What a first visit shows. The library's default layout is empty from 0.3.0
 * — it used to open a `welcome` tab every app had to register — so the
 * showcase seeds its own. A layout the visitor has since arranged is restored
 * instead.
 */
const initialLayout: IJsonModel = {
  global: { tabEnableClose: true, tabSetEnableMaximize: false, tabSetEnableDivide: true },
  borders: [],
  layout: {
    type: 'row',
    weight: 100,
    children: [
      { type: 'tabset', weight: 100, children: [{ type: 'tab', name: 'Welcome', component: 'welcome' }] },
    ],
  },
}

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
        initialLayoutJson={initialLayout}
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
