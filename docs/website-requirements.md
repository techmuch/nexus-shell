# 🌐 Nexus Shell Website Requirements & Specifications

This document outlines the design goals, features, and content requirements for the official `nexus-shell` component library website. The website serves as the primary landing page, interactive showcase, and learning portal for downstream developers.

---

## 1. Core Objectives
1. **The "Wow" Factor (Visual Excellence):** Immediately capture developer interest with a high-fidelity, modern UI featuring glowing gradients, glassmorphic headers, and smooth micro-animations.
2. **Interactive Playground (Hands-On Experience):** Let developers split layouts, drag tabs, toggle themes, and run commands inside a simulated sandbox on the home page without downloading the package.
3. **Frictionless Onboarding:** Clear commands, Copy-to-Clipboard buttons, and a clean documentation layout that matches Storybook.

---

## 2. Design System & Aesthetics
*   **Theme Integration:** The website must support three themes: `theme-light`, `theme-dark`, and `theme-gt` (Georgia Tech Theme).
*   **Dark Theme Baseline:** A dark slate/violet background (e.g., `hsl(240, 10%, 4%)`) with soft gray text (`hsl(240, 5%, 85%)`) and glowing neon accents.
*   **Typography:** Google Fonts Outfit for headings (bold, clean) and Inter for readable body text.
*   **Interactions:** Hover scaling, button focus outlines, and smooth transitions on collapsible panels.

---

## 3. Required Pages & Mockups

### A. Main Landing Page (`index.html`)
*   **Hero Section:** Features a bold value proposition ("The Registry-Driven Workspace Engine for React") and a live, interactive mini-workbench.
*   **Key Features Section:** Grid of animated cards explaining:
    *   *Flexible Docking Layouts* (flexlayout integration).
    *   *Inversion of Control Registries* (component, command, and menu registries).
    *   *Theme Adaptivity* (contrast-first styling).
    *   *Pre-built Tactical Widgets* (maps, terminals, canvas layouts).
*   **Terminal Quick-Start:** Interactive terminal widget with clipboard copy.

### B. Documentation Portal (`docs.html`)
*   **Collapsible Sidebar:** Lists pages hierarchically (Getting Started, Configuration, Registries, Themes, Advanced).
*   **Content Area:** Clean, readable Markdown formatting (heading structures, info/warning callout alerts, code blocks).
*   **Tab Navigation:** Switch between NPM install, PNPM, and Yarn tabs.

### C. Interactive Component Sandbox (`sandbox.html`)
*   **Layout Configurator:** Splittable panels representing the flexlayout structure.
*   **Theme Switcher:** Toggles the HTML page between the light, dark, and Georgia Tech theme, verifying that all elements adapt.
*   **Live Preview:** Shows a simulated registered tab, sidebar panel, and status indicators.
