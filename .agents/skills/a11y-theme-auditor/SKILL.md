---
name: a11y-theme-auditor
description: Specialised accessibility and theme auditor for Nexus Shell components. Use when verifying that components correctly adapt to theme-light, theme-dark, and theme-gt contrast, layout, and keyboard-focus standards.
---

# Accessibility & Theme Auditor (Nexus Shell)

Verify that new or refactored UI components behave correctly and comply with contrast and accessibility guidelines under all three Nexus Shell themes: `theme-light`, `theme-dark`, and `theme-gt` (Georgia Tech Theme).

## Core Verification Criteria

### 1. Color Contrast & Variables
*   **Semantic CSS Variables:** Controls and components must use the project's HSL semantic tokens (`--card`, `--foreground`, `--border`, `--accent`) defined in `index.css` instead of hardcoded hex values (e.g. `bg-white` or `text-black`).
*   **Dark Mode Softness:** Ensure text elements do not use pure white text on absolute black backgrounds. Verify that text uses soft, high-readability colors (e.g. `hsl(240, 5%, 85%)`).
*   **Contrast Ratios:** Text-to-background contrast must satisfy WCAG AA ratio (4.5:1 for normal text, 3:1 for large text). Check contrast ratios in each of the three active themes.

### 2. Interactive States & Keyboard Accessibility
*   **Visible Focus Ring:** Interactive elements (buttons, inputs, tabs) must have a clearly visible focus indicator when navigated via keyboard. Ensure they map to Tailwind classes such as `focus-visible:ring-2 focus-visible:ring-ring`.
*   **Keyboard Traps:** If testing modals, dialogs, or popovers, verify focus is caught inside the element and cannot escape to behind-the-scenes layout components until closed.

### 3. Screen Reader Tree (A11y Tree)
*   **Interactive Names:** Ensure icon-only buttons (like drawer close buttons) have explicit `aria-label` tags or `sr-only` descriptions.
*   **Structural Hierarchy:** Pages must use a single `<h1>` tag and preserve heading levels (`h2`, `h3`, etc.) in sequential order.

---

## Audit Workflow

### Step 1: Start Storybook Server
Run the local Storybook server in the background:
```bash
npm run dev:bg
```
Monitor the logs (`storybook.log`) to ensure compilation is successful.

### Step 2: Open Headless Browser
Using the browser agent, navigate to the Storybook preview URL of your targeted component.
For example: `http://localhost:6006/iframe.html?id=components-welcome--default`

### Step 3: Check Console Issues & Contrast
1.  Open Chrome Developer tools or run console message queries:
    ```javascript
    // In console / browser agent:
    list_console_messages({ types: ["issue"], includePreservedMessages: true })
    ```
2.  Review low-contrast warnings.

### Step 4: Toggle & Verify All Themes
To check visual compliance across all themes, add class toggles directly onto the document root (`<html>` or `<body>`) via browser injection or Storybook parameter switches:
1.  **Light Theme:** Apply class `theme-light` on body, capture screenshot, and audit contrast.
2.  **Dark Theme:** Apply class `theme-dark` on body, capture screenshot, and audit contrast.
3.  **Georgia Tech Theme:** Apply class `theme-gt` on body, capture screenshot, and audit contrast.

Ensure all text and interactive borders are visible and distinct.

### Step 5: Keyboard Tab Check
1.  Focus on the first element.
2.  Simulate keyboard tabs (`press_key` with "Tab") and check the active element using:
    ```javascript
    document.activeElement
    ```
3.  Ensure the focus outline is visible in your screenshot capture at each tab step.
