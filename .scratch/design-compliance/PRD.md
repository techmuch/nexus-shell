# PRD: UI/UX Library Design Compliance Alignment

## Problem Statement
The `nexus-shell` project is designed as a professional-grade, library-first component workbench. However, the codebase does not fully adhere to the best practices of a reusable UI/UX component library:
1. **Stories are not co-located:** Storybook files are placed in a global `src/stories/` folder rather than next to the components they document.
2. **Missing downstream MDX docs:** There are no component-specific `.mdx` files documenting properties, API signatures, and custom developer instructions.
3. **No unit testing framework:** The project lacks a unit test runner (Vitest/Jest) to run fast, headless unit tests on Zustand hooks and component logic.
4. **Missing composition use cases:** There are no stories or tests demonstrating complex interaction compositions (data flow between multiple registered tabs).

## Solution
Expose these alignment tasks as independent issues on the local scratch tracker so the headless auto-developer loop can execute them:
1. Co-locate all Storybook stories with their respective components.
2. Generate comprehensive `.mdx` documentation pages for all major widgets.
3. Install and configure Vitest for fast, headless unit tests.
4. Add composition stories and integration tests for multi-tab workflows.

## Out of Scope
- Major architectural changes to the flexlayout engine itself.
- Visual theme redesigns.
