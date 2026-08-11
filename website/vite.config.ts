import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs';

/**
 * The documentation site.
 *
 * It imports the library from `../src` rather than from `dist`, so every live
 * demo on the site is rendered by the current source. A demo that would break
 * against the real API breaks the site build.
 *
 * `base` targets a GitHub Pages project site at `/<repo>/`. Override it with
 * `SITE_BASE=/ npm run build` when serving from a custom domain.
 */
const base = process.env.SITE_BASE ?? '/nexus-shell/';

/**
 * GitHub Pages has no SPA rewrite rule, but it does serve `404.html` for any
 * unmatched path. Copying the entry document there makes deep links work.
 */
const spaFallback = () => ({
  name: 'spa-fallback-404',
  closeBundle() {
    const out = path.resolve(__dirname, 'dist');
    const index = path.join(out, 'index.html');
    if (fs.existsSync(index)) {
      fs.copyFileSync(index, path.join(out, '404.html'));
    }
  },
});

export default defineConfig({
  // Vite resolves `root` against the working directory, not the config file, so
  // running `vite build --config website/vite.config.ts` from the repo root
  // would otherwise pick up the repo's own index.html — the showcase app —
  // as the entry. Pin it.
  root: __dirname,
  base,
  plugins: [react(), spaFallback()],
  resolve: {
    alias: {
      // Demos import from 'nexus-shell' exactly as a consumer would, so the
      // code shown on the page is the code you can paste into your own app.
      'nexus-shell': path.resolve(__dirname, '../src/index.ts'),
      '@site': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __SITE_BASE__: JSON.stringify(base),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        /**
         * Split the heavy, rarely-changing dependencies out of the app chunk so
         * a docs edit doesn't invalidate a visitor's cached copy of React and
         * the docking engine.
         */
        manualChunks: {
          react: ['react', 'react-dom'],
          docking: ['flexlayout-react'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
