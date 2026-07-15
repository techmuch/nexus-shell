---
Status: ready-for-agent
Category: engineering
---
## Parent
Reported during UI Library Design Intent Audit

## What to build
Install and configure Vitest and React Testing Library in the project to support fast, headless unit tests of component logic and store states. Update `package.json` with a `test` script running `vitest run`, and add a basic unit test verifying the Zustand store initial states (`LayoutService`, `ThemeService`, `SidebarService`).

## Acceptance criteria
- [ ] Install devDependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`.
- [ ] Create `vitest.config.ts` configuration.
- [ ] Add `npm run test` script running `vitest run`.
- [ ] Write unit tests for Zustand stores ensuring they pass typechecking and runtime validation.

## Blocked by
- None - can start immediately
