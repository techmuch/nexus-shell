---
Status: ready-for-agent
Category: refactor
---
## Parent
Reported during UI Library Design Intent Audit

## What to build
Co-locate all Storybook story files (`*.stories.tsx`) currently residing in `src/stories/` into their corresponding component folders under `src/components/widgets/` and `src/components/layout/`. Ensure that the Storybook config (`.storybook/main.ts` or similar) is updated to scan for stories recursively in `src/components/`.

## Acceptance criteria
- [ ] Move all stories from `src/stories/` to their respective widget folders (e.g. `src/stories/ActivityBar.stories.tsx` moves to `src/components/widgets/`).
- [ ] Update Storybook configuration file to scan for stories at `../src/**/*.stories.@(js|jsx|mjs|ts|tsx)`.
- [ ] Run `npm run build-storybook` successfully to ensure the paths resolve correctly.

## Blocked by
- None - can start immediately
