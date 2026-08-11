import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dts from 'vite-plugin-dts';
import pkg from './package.json';

/**
 * Declaration output, used only by the library build.
 *
 * Storybook reuses this config but has no use for `.d.ts` files, so
 * `.storybook/main.ts` strips this plugin in its `viteFinal` hook — matched by
 * the name below.
 */
export const DTS_PLUGIN_NAME = 'vite:dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src'],
      // Stories and tests are dev-only; they must not appear in the published
      // type surface.
      exclude: ['src/tests', 'src/**/*.stories.tsx', 'src/**/__tests__/**'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'NexusShell',
      formats: ['es', 'umd'],
      fileName: (format) => `nexus-shell.${format}.js`,
    },
    rollupOptions: {
      // Peers and runtime dependencies stay external so consumers resolve and
      // dedupe a single copy of each, rather than getting one bundled inside
      // the library. Anything listed here must appear in package.json's
      // `dependencies` or `peerDependencies`.
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        ...Object.keys(pkg.dependencies ?? {}),
        // Sub-path imports, e.g. flexlayout-react/style/light.css
        /^flexlayout-react\//,
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          clsx: 'clsx',
          'tailwind-merge': 'tailwindMerge',
          'lucide-react': 'lucideReact',
          'react-virtuoso': 'reactVirtuoso',
          'flexlayout-react': 'FlexLayout',
          zustand: 'zustand',
        },
      },
    },
  },
});
