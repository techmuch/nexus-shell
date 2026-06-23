---
name: capture-screenshot
description: "Uses a Playwright fallback script to capture a screenshot of the visual UI when native browser agent tools fail or are restricted."
---

# capture-screenshot

This skill provides a reliable fallback for taking visual screenshots of the frontend applications using Playwright. 

## When to use this skill
- When you have made CSS or UI layout changes and need to verify them.
- When the native browser agent screenshot capabilities fail or are blocked.
- When you need a high-fidelity snapshot of a specific state to attach to an artifact or review.

## Instructions
1. Run the helper script located at `scripts/take_screenshot.spec.ts` using the Playwright runner.
   Command to run: `npx playwright test .agents/skills/capture-screenshot/scripts/take_screenshot.spec.ts`
2. The script will navigate to the local dev server (default `http://localhost:5173`) and save a screenshot to the artifacts folder.
3. Review the saved screenshot. If you are attaching it to a `walkthrough.md` or `ui_implementation_plan.md`, use the markdown syntax: `![Screenshot of UI](/absolute/path/to/screenshot.png)`
4. If you need to screenshot Storybook instead, you can modify the URL in the helper script temporarily or pass an environment variable if supported.
