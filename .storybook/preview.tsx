import React from 'react';
import type { Preview, Decorator } from '@storybook/react';
import { BUNDLED_THEMES } from '../src/lib/themes';
import '../src/index.css';

const THEME_IDS = BUNDLED_THEMES.map((t) => t.id);
type ThemeName = (typeof BUNDLED_THEMES)[number]['id'];

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
    THEME_IDS.forEach((t) => root.classList.remove(`theme-${t}`));
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
        items: BUNDLED_THEMES.map((t) => ({ value: t.id, title: t.label })),
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
        // Layout first: ShellLayout is the starting point for an app, and
        // the Primitives section documents what it is assembled from.
        order: [
          'Introduction',
          'Getting Started',
          'Layout',
          'Guides',
          'Primitives',
          'Examples',
        ],
      },
    },
  },
};

export default preview;
