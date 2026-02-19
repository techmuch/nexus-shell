# Project Requirement Document: Nexus-Shell Framework

## 1. Executive Summary
Nexus-Shell is a professional-grade frontend framework built with React and TypeScript. It mimics the "Workbench" model found in JupyterLab and VS Code, providing a highly modular plugin architecture, advanced tab-docking, and a centralized command/registry system. It is designed to be serialized, allowing users to save and restore complex workspace configurations.

## 2. Goals & Objectives
*   **Modularity:** Functionality must be decoupled from the shell via a Plugin API.
*   **Docking Excellence:** Support complex window management (splits, tabs, sidebars).
*   **Persistence:** The entire UI state must be serializable to JSON.
*   **Developer Ready:** Provide a "plug-and-play" foundation for building new tools.

## 3. Functional Requirements

### 3.1 Tab Docking & Layout Management
*   **Docking Engine:** Utilize a flexible layout engine (e.g., `flexlayout-react`) to support drag-and-drop tab management.
*   **Layout Splits:** Support horizontal and vertical splits, tab stacking, and resizing.
*   **Persistence:**
    *   Serialize the current layout to a JSON string.
    *   Reconstitute the layout on page refresh or from a stored profile.
*   **Tab Lifecycle:** Support "Save" prompts when closing tabs with unsaved data (via plugin hooks).

### 3.2 Global UI Components
*   **Menu Bar:**
    *   Highly configurable top-level menu (File, Edit, View, etc.).
    *   Support for nested sub-menus and keyboard accelerators.
*   **Status Bar:**
    *   Bottom-aligned strip for system health, branch names, or status messages.
    *   Areas for "left," "center," and "right" aligned widgets.
*   **Sidebars (Activity Bar):**
    *   Left/Right collapsible panels.
    *   Icon-based toggle for switching between panels (e.g., File Explorer, Settings).
*   **Tree Widget:**
    *   A high-performance, virtualized tree for file/data navigation.
    *   Support for custom icons, context menus, and drag-and-drop.

### 3.3 Plugin System
*   **Registration:** A central Registry that handles plugin initialization.
*   **Inversion of Control (IoC):** The shell provides "Services" (Command, Menu, Layout) that plugins consume.
*   **Lazy Loading:** Plugins should be dynamically importable to reduce initial bundle size.

## 4. Technical Requirements

### 4.1 Framework & Language
*   **Frontend:** React 19 (Functional Components & Hooks).
*   **Language:** TypeScript 5.x (Strict mode enabled).
*   **Styling:** Tailwind CSS with CSS Variable-based theming (Light/Dark support).

### 4.2 State Management
*   **Internal Shell State:** Zustand or Jotai for lightweight, atomic state management.
*   **Layout Storage:** `localStorage` for session persistence; API hooks for database-backed storage.

### 4.3 Testing Strategy
*   **Framework:** Playwright for End-to-End (E2E) testing.
*   **Coverage Areas:**
    *   **Layout Stability:** Verify dragging a tab to a border creates a split.
    *   **Serialization:** Save a complex layout, refresh, and verify the UI matches.
    *   **Plugin Isolation:** Ensure a crashing plugin does not bring down the entire Shell.
    *   **Visual Regression:** Snapshot testing for the Status Bar and Tree Widget.

## 5. Architectural Pattern: The "Workbench"
The shell should be structured into three main layers:
1.  **The Registry Layer:** Manages Commands, Menus, and Plugin instances.
2.  **The Layout Layer:** Manages the FlexLayout model and Sidebar state.
3.  **The Component Layer:** The React components that render the UI based on the registries.

## 6. Project Structure (Proposed)
```text
/src
  /core
    /registry       <-- CommandRegistry, MenuRegistry
    /services       <-- LayoutService, PersistenceService
  /components
    /layout         <-- FlexLayout wrapper
    /widgets        <-- Tree, MenuBar, StatusBar
  /plugins          <-- Example: FileExplorer, Terminal
  /tests            <-- Playwright .spec.ts files
```

## 7. Success Criteria
*   User can drag a tab to create a 3rd vertical split.
*   The state of that split is maintained after a browser refresh.
*   A new feature can be added by creating a single `.ts` file without editing the `App.tsx` core.
*   All Playwright tests pass in headless mode.
