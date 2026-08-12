import { test, expect, type Page } from '@playwright/test';

/**
 * The dialogue mapper, end to end.
 *
 * Selectors here are the library's own contract — `[data-graph-node]`,
 * `[data-graph-edge]`, and the accessible names of the inspector's fields.
 * Nothing reaches for a rendering library's internal class names, which is what
 * made the previous version of this file break whenever the canvas changed.
 */

const SAMPLE_MAP = {
  nodes: [
    {
      id: 'node-1',
      kind: 'question',
      position: { x: 250, y: 100 },
      size: { width: 240, height: 182 },
      data: {
        title: 'Which communication model should we use for real-time state sync?',
        tags: [],
        author: 'architecture',
        timestamp: '01/03/2026, 09:00',
      },
    },
    {
      id: 'node-2',
      kind: 'idea',
      position: { x: 100, y: 400 },
      size: { width: 240, height: 182 },
      data: {
        title: 'WebSockets with a custom state protocol',
        tags: [],
        author: 'platform',
        timestamp: '01/03/2026, 09:05',
      },
    },
    {
      id: 'node-4',
      kind: 'idea',
      position: { x: 420, y: 400 },
      size: { width: 240, height: 182 },
      data: {
        title: 'Server-Sent Events (SSE) with HTTP/2 multiplexing',
        tags: [],
        author: 'platform',
        timestamp: '01/03/2026, 09:06',
      },
    },
    {
      id: 'node-3',
      kind: 'pro',
      position: { x: 100, y: 700 },
      size: { width: 240, height: 182 },
      data: {
        title: 'Extremely low latency (sub-10ms)',
        tags: [],
        author: 'platform',
        timestamp: '01/03/2026, 09:10',
      },
    },
    {
      id: 'node-link',
      kind: 'link',
      position: { x: 740, y: 100 },
      size: { width: 240, height: 182 },
      data: {
        title: 'IBIS Methodology Reference',
        url: 'https://en.wikipedia.org/wiki/Issue-Based_Information_System',
        tags: [],
        author: 'research',
        timestamp: '01/03/2026, 09:12',
      },
    },
    {
      id: 'node-img',
      kind: 'image',
      position: { x: 1040, y: 240 },
      size: { width: 240, height: 182 },
      data: {
        title: 'Architecture Network Diagram',
        tags: [],
        author: 'research',
        timestamp: '01/03/2026, 09:14',
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'node-1', target: 'node-2' },
    { id: 'e1-4', source: 'node-1', target: 'node-4' },
    { id: 'e2-3', source: 'node-3', target: 'node-2' },
  ],
};

const canvas = (page: Page) => page.getByRole('application', { name: 'Dialogue map' });
const nodes = (page: Page) => page.locator('[data-graph-node]');
const edges = (page: Page) => page.locator('[data-graph-edge]');
const nodeTitleInput = (page: Page) => page.getByLabel('Node title');

/** The inspector's fields, by their accessible names. */
const inspector = (page: Page) => ({
  label: page.getByLabel('Node label'),
  kind: page.getByLabel('Argument logic class'),
  url: page.getByLabel('Link URL'),
  imageUrl: page.getByLabel('Image URL'),
  tags: page.getByLabel('Tags / categories'),
});

test.describe('Dialogue Mapping Workstation', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/projects', (route) => route.fulfill({ status: 200, json: [] }));
    await page.route('**/api/files', (route) =>
      route.fulfill({
        status: 200,
        json: [{ id: undefined, content: JSON.stringify(SAMPLE_MAP) }],
      }),
    );
    await page.route('**/api/maps/content', (route) =>
      route.fulfill({ status: 200, json: { success: true } }),
    );

    await page.goto('/');

    await page.getByText('View', { exact: true }).hover();
    await page.getByText('Dialogue Map', { exact: true }).click();
    await page.mouse.move(0, 0);

    await expect(page.getByText('IBIS Node Library')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Argument Inspector')).toBeVisible();
    await expect(nodes(page).first()).toBeVisible({ timeout: 5000 });
  });

  test('should display preloaded IBIS nodes on the canvas', async ({ page }) => {
    await expect(
      page.getByText('Which communication model should we use for real-time state sync?'),
    ).toBeVisible();
    await expect(page.getByText('WebSockets with a custom state protocol')).toBeVisible();
    await expect(
      page.getByText('Server-Sent Events (SSE) with HTTP/2 multiplexing'),
    ).toBeVisible();
    await expect(nodes(page)).toHaveCount(SAMPLE_MAP.nodes.length);
  });

  test('should add nodes when clicked from library', async ({ page }) => {
    await page.getByRole('button', { name: 'Question / Issue' }).click();

    // A new node opens for editing; Enter commits the default title.
    await nodeTitleInput(page).press('Enter');
    await expect(page.getByText('New Question')).toBeVisible();

    await page.getByText('New Question').first().click();
    await expect(inspector(page).label).toHaveValue('New Question');
  });

  test('should add nodes when dragged from library', async ({ page }) => {
    await page.getByRole('button', { name: 'Idea / Position' }).dragTo(canvas(page));

    await nodeTitleInput(page).press('Enter');
    await expect(page.getByText('New Idea')).toBeVisible();

    await page.getByText('New Idea').first().click();
    await expect(inspector(page).label).toHaveValue('New Idea');
  });

  test('should support context menu copy, paste, and delete on nodes and edges', async ({
    page,
  }) => {
    const title = 'Which communication model should we use for real-time state sync?';

    await page.getByText(title).click({ button: 'right' });
    await page.getByText('Copy Node', { exact: true }).click();

    await canvas(page).click({ button: 'right', position: { x: 220, y: 220 } });
    await page.getByText('Paste Node').click();

    await expect(page.getByText(title).nth(1)).toBeVisible();

    await page.getByText(title).nth(1).click({ button: 'right', force: true });
    await page.getByText('Delete Node', { exact: true }).click();
    await expect(page.getByText(title)).toHaveCount(1);

    // Edges carry their id, so no rendering-library test id is needed.
    await expect(edges(page)).toHaveCount(3);
    await page.locator('[data-graph-edge="e1-4"]').click({ button: 'right', force: true });
    await page.getByText('Delete Connection').click();
    await expect(edges(page)).toHaveCount(2);
  });

  test('should edit node titles in inspector sidebar', async ({ page }) => {
    await page.getByText('WebSockets with a custom state protocol').first().click();

    const label = inspector(page).label;
    await expect(label).toHaveValue('WebSockets with a custom state protocol');

    await label.fill('Updated WebSockets Title');
    await expect(page.getByText('Updated WebSockets Title')).toBeVisible();
  });

  test('should support inline double-click title editing directly on the node', async ({
    page,
  }) => {
    await page.getByText('Extremely low latency (sub-10ms)').dblclick();

    const input = nodeTitleInput(page);
    await expect(input).toBeVisible();

    await input.fill('Updated Low Latency Pro');
    await input.press('Enter');
    await expect(page.getByText('Updated Low Latency Pro')).toBeVisible();
  });

  test('should support adding and removing tags in inspector', async ({ page }) => {
    await page.getByText('Server-Sent Events (SSE) with HTTP/2 multiplexing').first().click();

    const tags = inspector(page).tags;
    await tags.fill('performance-test');
    await tags.press('Enter');

    await expect(page.getByText('performance-test')).toBeVisible();

    await page.getByLabel('Remove performance-test').click();
    await expect(page.getByText('performance-test')).toHaveCount(0);
  });

  /**
   * Selecting several nodes and editing them together — the capability the
   * hand-written inspector explicitly refused ("cannot be edited
   * simultaneously") before it was rebuilt on `PropertyPanel`.
   */
  test('should edit several selected nodes at once, and mark values that differ', async ({
    page,
  }) => {
    await page.getByText('WebSockets with a custom state protocol').first().click();
    await page
      .getByText('Server-Sent Events (SSE) with HTTP/2 multiplexing')
      .first()
      .click({ modifiers: ['Shift'] });

    await expect(page.getByText('2 nodes selected')).toBeVisible();

    // The two titles differ, so no value is shown for either.
    await expect(inspector(page).label).toHaveValue('');
    await expect(inspector(page).label).toHaveAttribute('placeholder', 'Mixed values');

    // Both are ideas, so the shared kind edits normally.
    await expect(inspector(page).kind).toHaveValue('idea');

    const tags = inspector(page).tags;
    await tags.fill('shared-tag');
    await tags.press('Enter');

    // The tag lands on both nodes.
    await expect(page.getByText('#shared-tag')).toHaveCount(2);
  });

  test('should block invalid semantic connections and display a rejection', async ({ page }) => {
    // Pros must target Ideas or Decisions, so Pro → Question is forbidden.
    const accepted = await page.evaluate(() => {
      const store = (window as unknown as Record<string, any>).useDialogueMappingStore?.getState();
      return store ? store.connectNodes('node-3', 'node-1') : null;
    });

    expect(accepted).toBe(false);
    await expect(page.getByText('Semantic Rejection:')).toBeVisible();
  });

  test('should undo manual node drags using keyboard shortcut', async ({ page }) => {
    const node = page.getByText('WebSockets with a custom state protocol').first();
    await node.click();
    await page.waitForTimeout(300);

    const before = await node.boundingBox();
    expect(before).not.toBeNull();

    if (before) {
      await node.hover();
      await page.mouse.down();
      await page.mouse.move(before.x + 150, before.y + 150, { steps: 5 });
      await page.mouse.up();
    }

    const after = await node.boundingBox();
    expect(after).not.toBeNull();
    if (before && after) {
      expect(after.x).not.toBeCloseTo(before.x, 2);
      expect(after.y).not.toBeCloseTo(before.y, 2);
    }

    await page.keyboard.press('Control+Z');

    const undone = await node.boundingBox();
    expect(undone).not.toBeNull();
    if (before && undone) {
      expect(undone.x).toBeCloseTo(before.x, 2);
      expect(undone.y).toBeCloseTo(before.y, 2);
    }
  });

  test('should display preloaded Link and Image nodes', async ({ page }) => {
    await expect(page.getByText('IBIS Methodology Reference')).toBeVisible();

    const anchor = page.locator(
      'a[href="https://en.wikipedia.org/wiki/Issue-Based_Information_System"]',
    );
    await expect(anchor).toBeVisible();

    await expect(page.getByText('Architecture Network Diagram')).toBeVisible();
    await expect(page.locator('img[alt="Architecture Network Diagram"]')).toBeVisible();
  });

  test('should support adding Link and Image nodes from library', async ({ page }) => {
    await page.getByRole('button', { name: 'Link / Reference' }).click();
    await nodeTitleInput(page).press('Enter');
    await expect(page.getByText('New Link')).toBeVisible();

    await page.getByText('New Link').first().click();
    const url = inspector(page).url;
    await expect(url).toBeVisible();
    await url.fill('https://google.com');
    await expect(page.locator('a[href="https://google.com"]')).toBeVisible();

    await page.getByRole('button', { name: 'Image / Diagram' }).click();
    await nodeTitleInput(page).press('Enter');
    await expect(page.getByText('New Image')).toBeVisible();

    await page.getByText('New Image').first().click();
    await expect(inspector(page).imageUrl).toBeVisible();
  });

  test('should support Compendium keyboard shortcuts for node creation', async ({ page }) => {
    await canvas(page).click({ position: { x: 40, y: 40 } });

    for (const [key, title] of [
      ['l', 'New Link'],
      ['i', 'New Image'],
      ['q', 'New Question'],
    ] as const) {
      await page.keyboard.press(key);
      await nodeTitleInput(page).press('Enter');
      await expect(page.getByText(title)).toBeVisible();
    }
  });

  test('should support linked node creation from selected node via shortcuts', async ({
    page,
  }) => {
    await page
      .getByText('Which communication model should we use for real-time state sync?')
      .click();

    await page.keyboard.press('a');

    const linked = await page.evaluate(() => {
      const store = (window as unknown as Record<string, any>).useDialogueMappingStore?.getState();
      if (!store) return false;

      const idea = store.nodes.find((n: any) => n.data.title.includes('New Idea'));
      if (!idea) return false;

      return store.edges.some(
        (e: any) =>
          (e.source === 'node-1' && e.target === idea.id) ||
          (e.source === idea.id && e.target === 'node-1'),
      );
    });
    expect(linked).toBe(true);

    const input = nodeTitleInput(page);
    await expect(input).toBeVisible();
    await input.fill('Idea created by shortcut linking');
    await input.press('Enter');
    await expect(page.getByText('Idea created by shortcut linking')).toBeVisible();
  });

  test('should enter and exit edit mode by pressing Enter key on selected node', async ({
    page,
  }) => {
    await page.getByText('WebSockets with a custom state protocol').first().click();
    await page.keyboard.press('Enter');

    const input = nodeTitleInput(page);
    await expect(input).toBeVisible();

    await input.fill('WebSockets edit via Enter key');
    await page.keyboard.press('Enter');

    await expect(input).not.toBeVisible();
    await expect(page.getByText('WebSockets edit via Enter key')).toBeVisible();
  });

  /**
   * Arrow keys move focus to the nearest node in that direction, which is what
   * makes a hand-arranged map navigable without a pointer.
   */
  test('should move focus spatially with the arrow keys', async ({ page }) => {
    await page.getByText('Which communication model should we use for real-time state sync?').click();
    await expect(inspector(page).label).toHaveValue(
      'Which communication model should we use for real-time state sync?',
    );

    await page.keyboard.press('ArrowDown');
    // Both ideas sit below the question; the nearer one takes focus.
    await expect(inspector(page).label).toHaveValue(
      'WebSockets with a custom state protocol',
    );

    await page.keyboard.press('ArrowRight');
    await expect(inspector(page).label).toHaveValue(
      'Server-Sent Events (SSE) with HTTP/2 multiplexing',
    );
  });
});
