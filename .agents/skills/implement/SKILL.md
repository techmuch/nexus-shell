---
name: implement
description: "Implement a piece of work based on a PRD or set of issues, actively verifying alignment with documented design intentions."
---

# Implement

Implement the work described in the target issue or PRD. Your primary responsibility is to ensure that the code you write matches the **design intent** of the library.

## Process

### 1. Detect Design Gaps (CRITICAL)
Before writing any code, compare the issue details against the existing project design documentation:
- **Domain Glossary (`CONTEXT.md`):** Ensure the feature uses vocabulary and structures matching the domain model.
- **Library Specifications (`docs/REQUIREMENTS.md`):** Ensure modularity and IoC patterns are maintained.
- **Website Specifications (`docs/website-requirements.md`):** If touching documentation or mockups, ensure visual systems and contrast standards align.
- **ADRs (`docs/adr/`):** Check that the solution does not violate established architectural boundaries.

> **If a gap or contradiction is detected:**
> - If the change represents an evolution of design, update the relevant documentation (`CONTEXT.md`, ADRs, or spec files) directly in your branch.
> - If the change breaks design rules (e.g., direct imports instead of IoC registration), adjust the code implementation to align with the documented design intent.

### 2. TDD & Seam Discipline
- Propose test seams at the highest possible layer (ideally on public interfaces).
- Use `/tdd` to write unit and integration tests before writing matching implementations.

### 3. Verification & Checks
- Run typechecking (`npx tsc --noEmit`) and linter regularly.
- Run single test files while editing, and the full test suite (`npx playwright test` and `vitest run`) once complete.

### 4. Review & Deliver
- Run `/review` to audit your work against standards and spec files.
- Commit your work using Conventional Commits.
