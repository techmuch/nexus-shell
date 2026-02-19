import { useEffect } from 'react';
import { 
  ShellLayout, 
  initializeShell, 
  commandRegistry, 
  menuRegistry, 
  useLayoutStore 
} from 'nexus-shell';

function App() {
  useEffect(() => {
    // 1. Initialize core registries
    initializeShell();

    // 2. Custom App Logic: Register a new command
    commandRegistry.registerCommand({
      id: 'app.ping',
      label: 'Ping App',
      execute: () => alert('Pong! Greetings from the basic app.'),
    });

    // 3. Add to the File menu
    menuRegistry.registerMenu('File', {
      id: 'file.ping',
      label: 'Ping App',
      commandId: 'app.ping',
    });

    // 4. Automatically open a custom tab on start
    useLayoutStore.getState().addTab('welcome', 'App Start');

  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ShellLayout />
    </div>
  );
}

export default App;
