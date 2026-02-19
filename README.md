# Nexus-Shell Framework

Nexus-Shell is a professional-grade, library-first frontend framework for building "Workbench" style applications (like VS Code or JupyterLab). Built with **React 19**, **TypeScript**, and **FlexLayout**, it provides a modular foundation for complex, multi-panel web tools.

## ✨ Key Features

- **Advanced Tab Docking:** Complete drag-and-drop window management with splits, tabs, and sidebars.
- **Modular Registry System:** Decouple commands, menus, and plugins from the core UI.
- **Persistence:** Automatic workspace restoration via `localStorage`.
- **Command Palette:** `Ctrl+Shift+P` searchable command interface.
- **Theming:** First-class support for Light, Dark, and custom themes (includes a Georgia Tech theme).
- **Library Ready:** ESM and UMD bundles with full TypeScript type definitions.

---

## 🚦 Quick Start

### 1. Installation

```bash
npm install nexus-shell
```

### 2. Basic Setup

In your main entry point (e.g., `App.tsx`):

```tsx
import { ShellLayout, initializeShell } from 'nexus-shell';
import 'nexus-shell/style.css';

// Initialize core shell services
initializeShell();

export default function App() {
  return (
    <div className="h-screen w-screen">
      <ShellLayout />
    </div>
  );
}
```

---

## 🏗 Core Concepts

### 1. Registries (The Brains)
Nexus-Shell uses registries to manage global state without component coupling.

- **`commandRegistry`**: Register global actions with IDs, labels, and optional keybindings.
- **`menuRegistry`**: Map commands to the top Menu Bar.
- **`pluginRegistry`**: Manage the lifecycle (`activate`/`deactivate`) of modular features.

### 2. Commands & Menus
```typescript
import { commandRegistry, menuRegistry } from 'nexus-shell';

// Register a command
commandRegistry.registerCommand({
  id: 'my-app.hello',
  label: 'Say Hello',
  keybinding: 'Control+L',
  execute: () => alert('Hello World!'),
});

// Add it to the Help menu
menuRegistry.registerMenu('Help', {
  id: 'help.hello',
  label: 'Say Hello',
  commandId: 'my-app.hello',
});
```

### 3. Layout Management
The layout is powered by `flexlayout-react`. You can dynamically add tabs from anywhere in your app:

```typescript
import { useLayoutStore } from 'nexus-shell';

const addMyTab = () => {
  useLayoutStore.getState().addTab('my-component', 'My Tab Title');
};
```

---

## 🛠 Step-by-Step: Creating a Custom Application

Follow these steps to build a feature-rich application using Nexus-Shell:

### Step 1: Initialize the Shell
Call `initializeShell()` before your app renders. This sets up the default "Welcome" tab, core menus, and global keyboard listeners.

### Step 2: Define your Components
Create React components that you want to appear as tabs. You must register these in the `factory` of the `ShellLayout` or provide a custom factory.

### Step 3: Register Commands and Menus
Define the actions your users can take. By using `commandRegistry`, your actions automatically show up in the **Command Palette** (`Ctrl+Shift+P`) and can be triggered by **Keyboard Shortcuts**.

### Step 4: Implement Plugins
For larger apps, encapsulate features into Plugins:
```typescript
import { IPlugin, commandRegistry } from 'nexus-shell';

export const MyFeaturePlugin: IPlugin = {
  id: 'my-feature',
  name: 'My Feature',
  activate: () => {
    // Register commands, menus, and sidebars here
  },
  deactivate: () => {
    // Cleanup
  }
};
```

### Step 5: Choose a Theme
Users can switch themes in the Settings sidebar. You can also set the theme programmatically:
```typescript
import { useThemeStore } from 'nexus-shell';

useThemeStore.getState().setTheme('gt'); // Go Jackets!
```

---

## 📂 Project Structure (Library)

```text
/dist               <-- Compiled library artifacts (ESM, UMD, CSS, Types)
/src
  /components       <-- UI Components (Layout, Widgets)
  /core
    /registry       <-- Registry logic (Commands, Menus, Plugins)
    /services       <-- State Management (Zustand)
  /index.ts         <-- Public API Entry Point
```

---

## 🧪 Development & Testing

- **Run Dev App:** `npm run dev`
- **Build Library:** `npm run build`
- **Run Tests:** `npx playwright test`

---

## 📄 License

MIT © [David/TechMuch]
