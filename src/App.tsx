import { ShellLayout } from './components/layout/ShellLayout'
import { useKeyboardShortcuts } from './core/services/KeyboardService'
import { CommandPalette } from './components/widgets/CommandPalette'
import { UserProfile } from './components/widgets/UserProfile'

import { ThemeSwitcher } from './components/widgets/ThemeSwitcher'
import { NexusWorkspaceShell } from './components/layout/NexusWorkspaceShell'
import { GlobalModal } from './components/widgets/GlobalModal'

function App() {
  useKeyboardShortcuts()

  const queryParams = new URLSearchParams(window.location.search);
  const layoutParam = queryParams.get('layout');

  if (layoutParam === 'dialogue') {
    return (
      <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col">
        <GlobalModal />
        <CommandPalette />
        <NexusWorkspaceShell />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col">
      <GlobalModal />
      <CommandPalette />
      <ShellLayout 
        rightMenuBarContent={
          <div className="flex items-center space-x-3 select-none">
            <ThemeSwitcher />
            <UserProfile />
          </div>
        }
      />
    </div>
  )
}

export default App
