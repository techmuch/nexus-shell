---
name: scaffold-component
description: "Scaffolds a new React component along with its Storybook story and registers it via the componentRegistry following IoC patterns."
---

# scaffold-component

This skill provides instructions for creating a new component adhering to the `nexus-shell` architectural guidelines.

## When to use this skill
- When you need to create a new UI widget, panel, or workspace tab.
- When you are extracting a piece of UI into a reusable component.

## Instructions
When creating a new component, you must ensure you generate the following files and follow these rules:

1. **Component File (`Component.tsx`)**:
   - Use functional components and React Hooks.
   - Use strict TypeScript typing (no `any`).
   - Use Tailwind CSS classes mapped to the `index.css` variables for styling.

2. **Storybook File (`Component.stories.tsx`)**:
   - Create a corresponding story file next to the component.
   - Include default args and different interaction states.

3. **IoC Registration**:
   - Do NOT directly import your component into `ShellLayout.tsx` or `App.tsx`.
   - Instead, register your component using the appropriate registry (e.g., `componentRegistry.register({ id: 'my-component', component: MyComponent })`) inside the plugin or feature initialization block.

4. **Review Visuals**:
   - After creation, check the newly generated Storybook story in your browser agent to ensure it meets the accessibility and theme standards.
