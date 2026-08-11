import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/**
 * Smoke tests for the documentation site.
 *
 * Separate from the library's vitest config because the site has its own module
 * aliases and lives outside `src/`.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'nexus-shell': path.resolve(__dirname, '../src/index.ts'),
      '@site': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __SITE_BASE__: JSON.stringify('/nexus-shell/'),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [path.resolve(__dirname, '../src/tests/setup.ts')],
    include: [path.resolve(__dirname, 'src/**/*.test.tsx')],
  },
});
