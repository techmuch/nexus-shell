import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '../../src/index.css'
import { initializeShell } from './app/Boot'

// Initialize the shell registries (commands, menus, plugins)
initializeShell();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
