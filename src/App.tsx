import { ShellLayout } from './components/layout/ShellLayout'
import { useKeyboardShortcuts } from './core/services/KeyboardService'
import { CommandPalette } from './components/widgets/CommandPalette'

function App() {
  useKeyboardShortcuts()
  
  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col">
      <CommandPalette />
      <ShellLayout />
    </div>
  )
}

export default App
