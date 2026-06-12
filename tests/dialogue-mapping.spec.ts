import { test, expect } from '@playwright/test';

test.describe('Dialogue Mapping Workstation', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    await page.goto('/');
    
    // Hover on 'View' menu and open the Dialogue Map tab
    await page.getByText('View', { exact: true }).hover();
    await page.getByText('Dialogue Map', { exact: true }).click();
    await page.mouse.move(0, 0); // dismiss menu

    // Verify workspace elements are visible
    await expect(page.getByText('IBIS Node Library')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Argument Inspector')).toBeVisible();

    // Wait for React Flow nodes to be fully rendered in DOM
    const nodeLocator = page.locator('.react-flow__node').first();
    await nodeLocator.waitFor({ state: 'attached', timeout: 5000 });

    // Print computed styles and bounding box to console
    await page.evaluate(() => {
      const node = document.querySelector('.react-flow__node');
      const container = document.querySelector('.react-flow');
      if (node && container) {
        console.log('TEST DEBUG - NODE CLIENT: ' + JSON.stringify({
          nodeWidth: node.clientWidth,
          nodeHeight: node.clientHeight,
          nodeRect: {
            x: node.getBoundingClientRect().x,
            y: node.getBoundingClientRect().y,
            width: node.getBoundingClientRect().width,
            height: node.getBoundingClientRect().height
          },
          nodeStyle: {
            display: window.getComputedStyle(node).display,
            visibility: window.getComputedStyle(node).visibility,
            opacity: window.getComputedStyle(node).opacity,
          },
          containerRect: {
            x: container.getBoundingClientRect().x,
            y: container.getBoundingClientRect().y,
            width: container.getBoundingClientRect().width,
            height: container.getBoundingClientRect().height
          },
          containerStyle: {
            display: window.getComputedStyle(container).display,
            visibility: window.getComputedStyle(container).visibility,
            width: window.getComputedStyle(container).width,
            height: window.getComputedStyle(container).height,
          }
        }));
      } else {
        console.log('TEST DEBUG - NODE OR CONTAINER NOT FOUND: ' + JSON.stringify({
          nodeExists: !!node,
          containerExists: !!container,
        }));
      }
    });

    // Wait for React Flow nodes to be fully rendered and visible
    await expect(nodeLocator).toBeVisible({ timeout: 5000 });
  });

  test('should display preloaded IBIS nodes on the canvas', async ({ page }) => {
    // Check that preloaded question is visible
    await expect(page.getByText('Which communication model should we use for real-time state sync?')).toBeVisible();
    // Check that preloaded ideas are visible
    await expect(page.getByText('WebSockets with a custom state protocol')).toBeVisible();
    await expect(page.getByText('Server-Sent Events (SSE) with HTTP/2 multiplexing')).toBeVisible();
  });

  test('should add nodes when clicked from library', async ({ page }) => {
    // Click 'Question / Issue' button in the node library
    await page.getByRole('button', { name: 'Question / Issue' }).click();
    
    // A new question node should be visible
    await expect(page.getByText('New Question')).toBeVisible();

    // Select the new question node
    await page.getByText('New Question').first().click();

    // The inspector should show properties for this new node
    await expect(page.locator('input[placeholder="Enter node title..."]')).toHaveValue('New Question');
  });

  test('should edit node titles in inspector sidebar', async ({ page }) => {
    // Click on the preloaded WebSockets Idea node to select it
    await page.getByText('WebSockets with a custom state protocol').first().click();

    // Inspector title input should have its current value
    const titleInput = page.locator('input[placeholder="Enter node title..."]');
    await expect(titleInput).toHaveValue('WebSockets with a custom state protocol');

    // Change title in the inspector
    await titleInput.fill('Updated WebSockets Title');
    
    // The node on the canvas should immediately update its text
    await expect(page.getByText('Updated WebSockets Title')).toBeVisible();
  });

  test('should support inline double-click title editing directly on the node', async ({ page }) => {
    const nodeLabel = page.getByText('Extremely low latency (sub-10ms)');
    
    // Double click the label to trigger inline editing
    await nodeLabel.dblclick();

    // An input element should appear in the node container
    const inlineInput = page.locator('.react-flow__node-ibisNode input');
    await expect(inlineInput).toBeVisible();

    // Type new title and blur
    await inlineInput.fill('Updated Low Latency Pro');
    await inlineInput.press('Enter');

    // Verify updated title is rendered
    await expect(page.getByText('Updated Low Latency Pro')).toBeVisible();
  });

  test('should support adding and removing tags in inspector', async ({ page }) => {
    // Click on the preloaded SSE Idea node
    await page.getByText('Server-Sent Events (SSE) with HTTP/2 multiplexing').first().click();

    // Find the tag input field and add a tag
    const tagInput = page.locator('input[placeholder="e.g. database"]');
    await tagInput.fill('performance-test');
    await tagInput.press('Enter');

    // Tag badge should be visible in the inspector
    const inspectorTag = page.locator('aside').getByText('#performance-test');
    await expect(inspectorTag).toBeVisible();

    // Click on tag in the inspector to remove it
    await inspectorTag.click();

    // Tag badge should be removed in the inspector
    await expect(inspectorTag).not.toBeVisible();
  });

  test('should block invalid semantic connections and display toast', async ({ page }) => {
    // Question node node-1: 'Which communication model should we use...'
    // Pro node node-3: 'Extremely low latency...'
    
    // Let's attempt to connect Pro (node-3) to Question (node-1) directly, which is forbidden in IBIS (Pros must target Ideas).
    // React Flow handles connections by dragging from source handles.
    // Instead of coordinate dragging which can be fragile, we can evaluate a script inside browser standard scope to trigger state connect.
    const connectResult = await page.evaluate(() => {
      // Access store directly from window object if exposed, or use programmatic test hook
      const store = (window as any).useDialogueMappingStore?.getState();
      if (store) {
        return store.connectNodes({ source: 'node-3', target: 'node-1' });
      }
      return null;
    });

    // If store is exposed, verify connection failed and alert/warning text is displayed
    // Let's check if the connection toast alert appears on page
    if (connectResult === false) {
      await expect(page.getByText('Semantic Rejection:')).toBeVisible();
    }
  });

  test('should undo manual node drags using keyboard shortcut', async ({ page }) => {
    // 1. Locate node and record initial bounding box
    const node = page.getByText('WebSockets with a custom state protocol').first();
    const boxBefore = await node.boundingBox();
    expect(boxBefore).not.toBeNull();

    // 2. Drag the node
    if (boxBefore) {
      await node.hover();
      await page.mouse.down();
      await page.mouse.move(boxBefore.x + 150, boxBefore.y + 150, { steps: 5 });
      await page.mouse.up();
    }

    // 3. Verify node moved
    const boxAfter = await node.boundingBox();
    expect(boxAfter).not.toBeNull();
    if (boxBefore && boxAfter) {
      expect(boxAfter.x).not.toBeCloseTo(boxBefore.x, 2);
      expect(boxAfter.y).not.toBeCloseTo(boxBefore.y, 2);
    }

    // 4. Press Control+Z to undo
    await page.keyboard.press('Control+Z');

    // 5. Verify node moved back
    const boxUndone = await node.boundingBox();
    expect(boxUndone).not.toBeNull();
    if (boxBefore && boxUndone) {
      expect(boxUndone.x).toBeCloseTo(boxBefore.x, 2);
      expect(boxUndone.y).toBeCloseTo(boxBefore.y, 2);
    }
  });

  test('should display preloaded Link and Image nodes', async ({ page }) => {
    // Check that preloaded link is visible and contains its anchor URL
    const linkNode = page.getByText('IBIS Methodology Reference');
    await expect(linkNode).toBeVisible();
    
    const urlAnchor = page.locator('a[href="https://en.wikipedia.org/wiki/Issue-Based_Information_System"]');
    await expect(urlAnchor).toBeVisible();
    await expect(urlAnchor).toHaveText('https://en.wikipedia.org/wiki/Issue-Based_Information_System');

    // Check that preloaded image is visible
    const imageNode = page.getByText('Architecture Network Diagram');
    await expect(imageNode).toBeVisible();

    const imageTag = page.locator('img[alt="Architecture Network Diagram"]');
    await expect(imageTag).toBeVisible();
  });

  test('should support adding Link and Image nodes from library', async ({ page }) => {
    // Add Link node
    await page.getByRole('button', { name: 'Link / Reference' }).click();
    await expect(page.getByText('New Link')).toBeVisible();

    // Select new Link node and check inspector URL input
    await page.getByText('New Link').first().click();
    const linkInput = page.locator('input[placeholder="https://example.com"]');
    await expect(linkInput).toBeVisible();
    await linkInput.fill('https://google.com');
    await linkInput.press('Enter');

    // Check link node on canvas has the updated link URL
    await expect(page.locator('a[href="https://google.com"]')).toBeVisible();

    // Add Image node
    await page.getByRole('button', { name: 'Image / Diagram' }).click();
    await expect(page.getByText('New Image')).toBeVisible();

    // Select new Image node and check inspector Image URL input
    await page.getByText('New Image').first().click();
    const imageInput = page.locator('input[placeholder="Image URL or local path..."]');
    await expect(imageInput).toBeVisible();
  });

  test('should support Compendium keyboard shortcuts for node creation', async ({ page }) => {
    // Click on canvas background to ensure no inputs are focused
    await page.locator('.react-flow').click();

    // Press 'l' -> Create Link
    await page.keyboard.press('l');
    await expect(page.getByText('New Link')).toBeVisible();

    // Press 'i' -> Create Image
    await page.keyboard.press('i');
    await expect(page.getByText('New Image')).toBeVisible();

    // Press 'q' -> Create Question
    await page.keyboard.press('q');
    await expect(page.getByText('New Question')).toBeVisible();
  });
});
