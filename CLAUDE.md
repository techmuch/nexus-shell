# CLAUDE.md

## Build & Test Commands

- **Start Dev Server (Vite):** `npm run dev`
- **Start Dev + Storybook in Background:** `npm run dev:bg`
- **Open Dev & Storybook Tabs in Browser:** `npm run dev:open`
- **Start All (Background + Open Tabs):** `npm run dev:all`
- **Stop Background Servers:** `npm run dev:stop`
- **Build Library:** `npm run build`
- **Run Storybook:** `npm run storybook`
- **Run E2E & Visual Regression Tests:** `npx playwright test`
- **Lint Code:** `npm run lint`

## Code Style & Architecture Guidelines

- **Architecture:** Follow the "Workbench" pattern. Features must register commands (`commandRegistry`), menus (`menuRegistry`), panels (`sidebarStore`), and tabs (`componentRegistry`) instead of hardcoding imports.
- **Language:** React 19, TypeScript 5.x, ESM modules. Use functional components and strict TypeScript typing (avoid `any`).
- **State:** Use Zustand stores for global/shell state.
- **Styling:** Tailwind CSS with CSS Variables for theming (Light, Dark, Georgia Tech `theme-gt`). Ensure dark theme colors prevent eye glare and maintain high contrast/accessibility.
- **Components:** Interactive elements must have focus outline/rings (`focus:ring-2`) and hover indicators.
- **Persistence:** Ensure layout states, themes, panel options, and workspace setups are serialized to `localStorage` or restore correctly.
- **Lifecycle:** Tabs containing unsaved changes must trigger confirm dialogs before closing.
