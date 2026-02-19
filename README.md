# Nexus-Shell Framework

Nexus-Shell is a professional-grade frontend framework built with **React 19** and **TypeScript 5.x**. It implements a "Workbench" model similar to JupyterLab or VS Code, providing a highly modular plugin architecture, advanced tab-docking, and a centralized command/registry system.

## 🚀 Key Features

- **Modular Plugin Architecture:** Decouple functionality from the shell via a robust Plugin API.
- **Advanced Tab-Docking:** Powered by `flexlayout-react` for drag-and-drop window management (splits, tabs, sidebars).
- **Session Persistence:** UI state is automatically serialized to `localStorage`, allowing for workspace restoration on refresh.
- **Modern Tech Stack:** Built with React 19, TypeScript, Tailwind CSS, and Zustand.
- **Developer Ready:** Includes a "plug-and-play" foundation with built-in registries for Commands, Menus, and Plugins.

## 🛠 Project Structure

```text
/src
  /core
    /registry       <-- CommandRegistry, MenuRegistry, PluginRegistry
    /services       <-- LayoutService (State & Persistence)
  /components
    /layout         <-- ShellLayout (FlexLayout wrapper)
    /widgets        <-- Tree, MenuBar, StatusBar, ActivityBar
  /plugins          <-- Plugin implementations
  /tests            <-- Playwright E2E tests
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/techmuch/nexus-shell.git
cd nexus-shell

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

### Testing

```bash
# Run Playwright E2E tests
npx playwright test
```

### Build

```bash
# Build for production
npm run build
```

## 🏗 Architectural Pattern: The "Workbench"

The shell is structured into three main layers:
1.  **The Registry Layer:** Manages global state for Commands, Menus, and Plugins.
2.  **The Layout Layer:** Manages the FlexLayout model and panel states.
3.  **The Component Layer:** React components that render the UI dynamically based on the registries.

## 📄 License

MIT
