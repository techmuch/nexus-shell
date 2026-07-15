---
Status: ready-for-agent
Category: engineering
---
## Parent
Reported during UI Library Design Intent Audit

## What to build
Design and implement a composition story showing a unified workstation use case: combining the `DialogueMappingWidget` (canvas), `DialogueMapperLibraryWidget` (node list), and `ArgumentInspectorWidget` (property inspector) in a single split layout. Add a corresponding Playwright test ensuring that dragging nodes from the library to the canvas and clicking them updates the inspector tab correctly.

## Acceptance criteria
- [ ] Create a `DialogueMappingComposition.stories.tsx` story demonstrating the unified three-panel workbench.
- [ ] Write a Playwright integration test at `tests/composition.spec.ts` asserting interactive data synchronization between the tabs.
- [ ] Run the Playwright test successfully.

## Blocked by
- .scratch/design-compliance/issues/01-colocate-storybook-stories.md
