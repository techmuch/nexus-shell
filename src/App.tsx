import { ShellLayout } from './components/layout/ShellLayout'
import { useKeyboardShortcuts } from './core/services/KeyboardService'
import { CommandPalette } from './components/widgets/CommandPalette'
import { UserProfile } from './components/widgets/UserProfile'

import { ThemeSwitcher } from './components/widgets/ThemeSwitcher'

function App() {
  useKeyboardShortcuts()

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col">
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
