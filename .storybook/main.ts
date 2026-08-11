import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../examples/**/*.mdx',
    '../examples/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  /**
   * Storybook merges the project's `vite.config.ts`, which includes
   * `vite-plugin-dts` for the library build. Declaration files are meaningless
   * here and cost several seconds per build, so drop the plugin.
   */
  viteFinal: async (config) => ({
    ...config,
    plugins: (config.plugins ?? []).filter(
      (p) => !(p && typeof p === 'object' && 'name' in p && p.name === 'vite:dts'),
    ),
  }),
  typescript: {
    // react-docgen-typescript reads JSDoc comments off prop declarations and
    // renders them in the autodocs props table. The default `react-docgen`
    // parser drops them for typed React components.
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      // Keep node_modules types (React.HTMLAttributes etc.) out of prop tables.
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
};

export default config;
