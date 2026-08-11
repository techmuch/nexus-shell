import React from 'react';
import type { Preview, Decorator } from '@storybook/react';
import '../src/index.css';

const THEMES = ['light', 'dark', 'gt'] as const;
type ThemeName = (typeof THEMES)[number];

/**
 * Applies the selected theme class to both the preview root element and the
 * document element. Components read their colors from CSS custom properties
 * scoped to `.theme-*`, and some portalled UI (modals, context menus, command
 * palette) renders outside the story subtree — so both need the class.
 */
const withTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme ?? 'light') as ThemeName;

  React.useEffect(() => {
    const root = document.documentElement;
    THEMES.forEach((t) => root.classList.remove(`theme-${t}`));
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <div className={`theme-${theme} bg-background text-foreground`}>
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Active Nexus Shell theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        dynamicTitle: true,
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
          { value: 'gt', title: 'Georgia Tech' },
        ],
      },
    },
  },
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          'Introduction',
          'Getting Started',
          'Layout',
          'Primitives',
          'Examples',
        ],
      },
    },
  },
};

export default preview;
