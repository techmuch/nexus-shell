import { useEffect } from 'react'
import { ShellLayout } from './components/layout/ShellLayout'
import { useKeyboardShortcuts } from './core/services/KeyboardService'
import { CommandPalette } from './components/widgets/CommandPalette'
import { UserProfile } from './components/widgets/UserProfile'
import { useLayoutStore, dialogueMappingLayoutJson, dialogueMapperMenus } from './core/services/LayoutService'
import { DialogueMapperTitle } from './components/widgets/DialogueMapperTitle'
import { ThemeSwitcher } from './components/widgets/ThemeSwitcher'

function App() {
  useKeyboardShortcuts()
  
  const setStorageKey = useLayoutStore((state) => state.setStorageKey)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('layout') === 'dialogue') {
        setStorageKey('nexus-shell-dialogue-layout', dialogueMappingLayoutJson);
      }
    }
  }, [setStorageKey]);

  const isDialogue = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('layout') === 'dialogue';

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col">
      <CommandPalette />
      <ShellLayout 
        title={isDialogue ? <DialogueMapperTitle className="mr-8 scale-[0.85] origin-left" /> : undefined}
        menuConfig={isDialogue ? dialogueMapperMenus : undefined}
        rightMenuBarContent={
          isDialogue ? (
            <div className="flex items-center space-x-3 select-none">
              <ThemeSwitcher />
              <UserProfile showName={false} />
            </div>
          ) : (
            <UserProfile />
          )
        }
      />
    </div>
  )
}

export default App
