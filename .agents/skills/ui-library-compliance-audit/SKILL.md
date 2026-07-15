---
name: ui-library-compliance-audit
description: Audits the repository against the Nexus Shell UI/UX library design intentions (IoC registry patterns, component decomposition, Storybook/site documentation, and composition testing). Produces a set of prioritized local task files in .scratch/ to resolve compliance issues.
---

# UI/UX Library Compliance Auditor (Nexus Shell)

Audit the repository's components, stories, tests, and documentation to verify alignment with Nexus Shell's core design intentions. Translate findings into actionable, independent developer issues.

---

## 1. Compliance Audit Criteria

Evaluate the codebase against these four pillars of a professional-grade React/TypeScript component library:

### A. Component Decomposition & Modularity
*   **Modularity Seam:** Inspect complex layout containers (e.g., `src/components/ShellLayout.tsx` or `src/App.tsx`). Ensure they do not directly import specific feature tabs, widgets, or tools.
*   **Inversion of Control (IoC):** Features must be injected dynamically via registries (`componentRegistry`, `commandRegistry`, `menuRegistry`).
*   **Single Responsibility:** Extract complex nested DOM sub-trees into independent, reusable sub-components. Components should focus on one layout or functional boundary.

### B. Downstream & Interactive Documentation
*   **Storybook Integration:** Every component must have a corresponding `.stories.tsx` file co-located with it, defining:
    *   Default controls and args.
    *   Different states (disabled, active, loading, error).
*   **Downstream Site Docs:** Verify that components have an associated `.md` or `.mdx` markdown document explaining:
    *   The problem the component solves.
    *   API interface prop definitions.
    *   Downstream developer guides (how to import, customize, and extend it).
*   **MDX Documentation Structure:** When writing documentation site pages, components should have co-located `.stories.mdx` or `.mdx` files containing:
    1. `<Meta of={ComponentStories} />` (binds the page to the component stories).
    2. A clean heading level-1 `# ComponentName` title with a high-level conceptual description.
    3. An interactive preview (`<Canvas of={ComponentStories.Default} />`).
    4. An API properties table (`<Controls />` or `<ArgTypes />`).
    5. Code layout blocks demonstrating downstream integration layouts.
*   **Sitemap Integration:** Documentation must be linkable and exposed to the public docs website.

### C. Thorough Testing Coverage
*   **Unit Tests:** Functional behavior (callbacks, keyboard shortcuts, state transitions) must have unit tests.
*   **Visual Regression Tests:** Playwright tests must capture screenshots of the component in isolation under light, dark, and GT themes.

### D. Compositions & Example Use Cases
*   **Unified Scenarios:** A component cannot be delivered in a vacuum. Assess whether there are composition stories and tests demonstrating how the component interacts with other registry parts (e.g., nesting a `DialogueMapper` tab with an `inspector-panel` sidebar, showing the data sync loop).
*   **Real-world Examples:** Provide downstream developers with ready-to-copy code blocks showing common layouts.

---

## 2. Audit & Task Generation Process

### Step 1: Scan the Codebase
Analyze the workspace structures:
1.  Check the component files in `src/components/` and their co-located story/test files.
2.  Inspect registrations in `src/plugins/` or workspace initialization directories.
3.  Check the documentation directories under `docs/` and public Storybook settings.

### Step 2: Identify Discrepancies
For each component or layout found, build a compliance checklist. Look for:
- Lack of corresponding Storybook story or documentation.
- Missing composition examples showing the component in context.
- Direct coupling/imports where registry dynamic loading should be used.
- Components lacking visual regression coverage in Playwright.

### Step 3: Write Actionable Issues to `.scratch/`
Instead of displaying a generic summary, generate local development issues under `.scratch/design-compliance/issues/` so the headless orchestrator can automatically fix them.

Create:
1.  **PRD File:** `.scratch/design-compliance/PRD.md` summarizing the overall gap in library design compliance.
2.  **Tracer-bullet Issues:** Create files named `.scratch/design-compliance/issues/<NN>-<slug>.md` (starting at `01`).

Each issue must strictly follow the Matt Pocock skills template:
```markdown
---
Status: ready-for-agent
Category: enhancement
---
## Parent
Reported during UI Library Design Intent Audit

## What to build
[Clear description of the component decomposition, documentation update, or test addition needed. Be specific to the module name.]

## Acceptance criteria
- [ ] Criterion 1 (e.g., story file generated and registered)
- [ ] Criterion 2 (e.g., Playwright screenshots verified for theme-dark and theme-gt)
- [ ] Criterion 3 (e.g., composition use case added to Storybook)

## Blocked by
- None (or blocking issue path)
```
