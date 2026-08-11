import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/**
 * Resolves `nexus-shell` to the library source rather than `dist`, so the
 * example runs against the current code without a build step first.
 *
 * A real consumer would drop this alias and let node resolution find the
 * installed package.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'nexus-shell/style.css': path.resolve(__dirname, '../../src/index.css'),
      'nexus-shell': path.resolve(__dirname, '../../src/index.ts'),
    },
  },
});
