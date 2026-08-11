import { describe, expect, it, beforeAll, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { RouterProvider } from '@site/lib/router';
import { App } from '@site/App';
import { COMPONENTS } from '@site/content/components';
import { demoModule, demoSource } from '@site/lib/source';
import { allApi } from '@site/site/PropsTable';

/**
 * The site renders the library from source, so these tests catch two classes of
 * rot that a passing `vite build` would not:
 *
 *   1. A demo whose `#region` marker no longer matches, which would silently
 *      publish a "region not found" placeholder instead of code.
 *   2. A page that throws at render time — the build only typechecks and
 *      bundles, it never executes a component.
 */

const at = (path: string) => {
  window.history.pushState({}, '', `/nexus-shell${path}`);
  return render(
    <RouterProvider>
      <App />
    </RouterProvider>,
  );
};

beforeAll(() => {
  // jsdom implements neither, and the demos touch both.
  window.alert = vi.fn();
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
});

afterEach(cleanup);

describe('routes', () => {
  it('renders the landing page', () => {
    at('/');
    expect(screen.getAllByText(/IDE-style applications/i).length).toBeGreaterThan(0);
  });

  it('renders the component index with every component listed', () => {
    at('/components');
    COMPONENTS.forEach((component) => {
      expect(screen.getAllByText(component.name).length).toBeGreaterThan(0);
    });
  });

  it.each([
    ['/docs/getting-started', /Getting Started/i],
    ['/docs/architecture', /Architecture/i],
    ['/docs/theming', /Theming/i],
  ])('renders %s', (path, heading) => {
    at(path);
    expect(screen.getAllByText(heading).length).toBeGreaterThan(0);
  });

  it('renders a 404 for an unknown route', () => {
    at('/nope');
    expect(screen.getByText('Page not found')).toBeInTheDocument();
  });

  it.each(COMPONENTS.map((c) => [c.slug, c.name] as const))(
    'renders the %s page',
    (slug, name) => {
      at(`/components/${slug}`);
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
      // Every page must reach its props section, i.e. it rendered to the end.
      expect(screen.getByText('Props')).toBeInTheDocument();
    },
  );
});

describe('demo wiring', () => {
  it.each(
    COMPONENTS.flatMap((component) =>
      component.demos.map((demo) => [
        `${component.name} · ${demo.title}`,
        component,
        demo,
      ] as const),
    ),
  )('%s exports its demo component', (_label, component, demo) => {
    const module = demoModule(component.demoFile);
    expect(module[demo.export], `${component.demoFile}.tsx must export ${demo.export}`).toBeTypeOf(
      'function',
    );
  });

  it.each(
    COMPONENTS.flatMap((component) =>
      component.demos.map((demo) => [
        `${component.name} · ${demo.title}`,
        component,
        demo,
      ] as const),
    ),
  )('%s resolves its source region', (_label, component, demo) => {
    const code = demoSource(component.demoFile, demo.region ?? demo.export);
    expect(code).not.toMatch(/^\/\/ region not found/);
    expect(code).not.toMatch(/^\/\/ demo file not found/);
    expect(code.length).toBeGreaterThan(20);
  });
});

describe('generated API', () => {
  it('has an entry for every documented component', () => {
    const names = new Set(allApi.map((c) => c.name));
    COMPONENTS.forEach((component) => {
      expect(names, `missing generated API for ${component.name}`).toContain(component.name);
    });
  });

  it('documents every prop it exposes', () => {
    const undocumented = allApi.flatMap((component) =>
      component.props.filter((p) => !p.description).map((p) => `${component.name}.${p.name}`),
    );
    expect(undocumented).toEqual([]);
  });
});
