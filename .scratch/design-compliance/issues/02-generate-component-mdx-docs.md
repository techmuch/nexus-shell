---
Status: ready-for-agent
Category: documentation
---
## Parent
Reported during UI Library Design Intent Audit

## What to build
Generate MDX documentation files (`*.mdx`) for key components: `ShellLayout`, `DialogueMappingWidget`, `WargameMap`, and `AgentManager`. Follow the MDX structure guidelines:
1. Meta tags binding the docs to their stories.
2. A clear conceptual description of the widget.
3. Interactive Canvas preview link.
4. Comprehensive prop table.
5. Integration layout code examples.

## Acceptance criteria
- [ ] MDX docs authored for the 4 core components and co-located next to them.
- [ ] Compiles successfully with `npm run build-storybook`.
- [ ] Verify that docs appear in the Storybook site navigation.

## Blocked by
- .scratch/design-compliance/issues/01-colocate-storybook-stories.md
