import { test, expect } from '@playwright/test';

test.describe('Mockup Reviewer Drawing', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    await page.goto('/');
    // Hover on the 'View' menu to reveal the dropdown
    await page.getByText('View', { exact: true }).hover();
    // Click 'Mockup Reviewer'
    await page.getByText('Mockup Reviewer', { exact: true }).click();
    // Move mouse away to dismiss the CSS group-hover menu dropdown
    await page.mouse.move(0, 0);
    // Wait for the Mockup Reviewer tab content or button to be visible
    await expect(page.getByRole('button', { name: 'Export Feedback Report' })).toBeVisible({ timeout: 5000 });
    // Switch to Mockup Reviewer tab by default for drawing tests
    await page.getByRole('button', { name: 'Mockup Reviewer' }).first().click();
  });

  test('should draw on the mockup canvas', async ({ page }) => {
    // Select the Box tool
    await page.getByRole('button', { name: 'Box' }).click();

    // Find the SVG annotation overlay layer
    const svgOverlay = page.locator('svg.cursor-crosshair');
    await expect(svgOverlay).toBeVisible();

    const box = await svgOverlay.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      // Draw a box from (30%, 30%) to (70%, 70%) relative to the SVG container
      const startX = box.x + box.width * 0.3;
      const startY = box.y + box.height * 0.3;
      const endX = box.x + box.width * 0.7;
      const endY = box.y + box.height * 0.7;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(endX, endY, { steps: 5 });
      await page.mouse.up();

      // Check that a <rect> is rendered inside the SVG overlay
      const rect = svgOverlay.locator('rect[stroke-width="2.5"]');
      await expect(rect).toBeVisible();
      
      // Since it's drawn from 30% to 70%, its x and y coordinate attributes should be close to 30, and width/height should be close to 40
      const xAttr = await rect.getAttribute('x');
      const yAttr = await rect.getAttribute('y');
      const wAttr = await rect.getAttribute('width');
      const hAttr = await rect.getAttribute('height');

      expect(parseFloat(xAttr || '0')).toBeCloseTo(30, 0);
      expect(parseFloat(yAttr || '0')).toBeCloseTo(30, 0);
      expect(parseFloat(wAttr || '0')).toBeCloseTo(40, 0);
      expect(parseFloat(hAttr || '0')).toBeCloseTo(40, 0);
    }
  });

  test('should draw a path with the pencil tool without offsets', async ({ page }) => {
    // Select the Draw (pen) tool
    await page.getByRole('button', { name: 'Draw' }).click();

    const svgOverlay = page.locator('svg.cursor-crosshair');
    await expect(svgOverlay).toBeVisible();

    const box = await svgOverlay.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      // Free draw a stroke
      const startX = box.x + box.width * 0.4;
      const startY = box.y + box.height * 0.4;
      const midX = box.x + box.width * 0.5;
      const midY = box.y + box.height * 0.6;
      const endX = box.x + box.width * 0.6;
      const endY = box.y + box.height * 0.4;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(midX, midY, { steps: 5 });
      await page.mouse.move(endX, endY, { steps: 5 });
      await page.mouse.up();

      // Check that a direct child <path> is rendered inside the SVG overlay (not one inside defs/markers)
      const path = page.locator('svg.cursor-crosshair > g > path[stroke-width="2.5"]');
      await expect(path).toBeVisible();

      // Check its d attribute value
      const dAttr = await path.getAttribute('d');
      expect(dAttr).not.toBeNull();
      expect(dAttr).toContain('M');
      expect(dAttr).toContain('L');

      // The M command coordinates should be close to 40 (our 40% starting point)
      const firstCoord = dAttr!.split(' ')[1];
      expect(parseFloat(firstCoord)).toBeCloseTo(40, 0);
    }
  });

  test('should select a shape and delete it using the toolbar button', async ({ page }) => {
    // 1. Draw a Box first
    await page.getByRole('button', { name: 'Box' }).click();
    const svgOverlay = page.locator('svg.cursor-crosshair');
    const box = await svgOverlay.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.7, { steps: 5 });
      await page.mouse.up();
    }

    // Verify <rect> is visible
    const rect = page.locator('svg > g > rect[stroke-width="2.5"]');
    await expect(rect).toBeVisible();

    // 2. Select 'Interact' tool
    await page.getByRole('button', { name: 'Interact' }).click();

    // 3. Click the rect on its border (top-left offset) to select it
    await rect.click({ force: true, position: { x: 2, y: 2 } });

    // Verify 'Delete Markup' button in toolbar becomes visible
    const deleteBtn = page.getByRole('button', { name: 'Delete Markup' });
    await expect(deleteBtn).toBeVisible();

    // 4. Click the 'Delete Markup' button
    await deleteBtn.click();

    // Confirm that the rect is no longer in the DOM
    await expect(rect).not.toBeVisible();
    await expect(deleteBtn).not.toBeVisible();
  });

  test('should select a shape and delete it using Backspace/Delete key', async ({ page }) => {
    // 1. Draw a Box first
    await page.getByRole('button', { name: 'Box' }).click();
    const svgOverlay = page.locator('svg.cursor-crosshair');
    const box = await svgOverlay.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.7, { steps: 5 });
      await page.mouse.up();
    }

    // Verify <rect> is visible
    const rect = page.locator('svg > g > rect[stroke-width="2.5"]');
    await expect(rect).toBeVisible();

    // 2. Select 'Interact' tool
    await page.getByRole('button', { name: 'Interact' }).click();

    // 3. Click the rect on its border to select it
    await rect.click({ force: true, position: { x: 2, y: 2 } });

    // 4. Press Backspace/Delete key
    await page.keyboard.press('Backspace');

    // Confirm that the rect is no longer in the DOM
    await expect(rect).not.toBeVisible();
  });

  test('should undo the last annotation using the Undo button', async ({ page }) => {
    // 1. Draw two boxes
    await page.getByRole('button', { name: 'Box' }).click();
    const svgOverlay = page.locator('svg.cursor-crosshair');
    const box = await svgOverlay.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      // Box 1
      await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.4, { steps: 5 });
      await page.mouse.up();

      // Box 2
      await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.6);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.8, { steps: 5 });
      await page.mouse.up();
    }

    const rects = page.locator('svg > g > rect[stroke-width="2.5"]');
    await expect(rects).toHaveCount(2);

    // 2. Click the Undo button
    const undoBtn = page.getByRole('button', { name: 'Undo' });
    await expect(undoBtn).toBeVisible();
    await expect(undoBtn).not.toBeDisabled();
    await undoBtn.click();

    // Verify Box 2 is undone (count goes to 1)
    await expect(rects).toHaveCount(1);
    
    // Undo Box 1
    await undoBtn.click();
    await expect(rects).toHaveCount(0);

    // Undo the preloaded comment to verify it disables when empty
    await undoBtn.click();
    await expect(undoBtn).toBeDisabled();
  });

  test('should undo the last annotation using Control+Z shortcut', async ({ page }) => {
    // 1. Draw one box
    await page.getByRole('button', { name: 'Box' }).click();
    const svgOverlay = page.locator('svg.cursor-crosshair');
    const box = await svgOverlay.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.7, { steps: 5 });
      await page.mouse.up();
    }

    const rects = page.locator('svg > g > rect[stroke-width="2.5"]');
    await expect(rects).toHaveCount(1);

    // 2. Press Ctrl+z
    await page.keyboard.press('Control+z');

    // Verify Box is undone
    await expect(rects).toHaveCount(0);
  });

  test('should erase shapes and comments directly using the Eraser tool', async ({ page }) => {
    // 1. Draw a Box shape
    await page.getByRole('button', { name: 'Box' }).click();
    const svgOverlay = page.locator('svg.cursor-crosshair');
    const box = await svgOverlay.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.7, { steps: 5 });
      await page.mouse.up();
    }

    const rect = page.locator('svg > g > rect[stroke-width="2.5"]');
    await expect(rect).toBeVisible();

    // 2. Click the Eraser tool in the toolbar
    await page.getByRole('button', { name: 'Eraser' }).click();

    // 3. Click the rect shape directly on its border stroke using force click
    await rect.click({ force: true, position: { x: 2, y: 2 } });

    // Verify shape is erased
    await expect(rect).not.toBeVisible();

    // 4. Test erasing a comment pin
    // Open 'Comment' tool
    await page.getByRole('button', { name: 'Comment' }).click();
    
    // Click on the canvas to place a comment pin
    if (box) {
      await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
    }
    
    // Fill the comment details and click "Add Comment"
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    await textarea.fill('Testing eraser comment deletion');
    await page.getByRole('button', { name: 'Add Comment' }).click();

    // Verify comment pin is rendered
    const pins = page.locator('.absolute.rounded-full.flex.items-center');
    await expect(pins).toHaveCount(2);

    // Click Eraser tool again
    await page.getByRole('button', { name: 'Eraser' }).click();

    // Click the newly created comment pin
    await pins.last().click();

    // Verify comment pin count goes back to 1 (only the preloaded remains)
    await expect(pins).toHaveCount(1);
  });

  test('should navigate to mockup reviewer on node double-click in workflow', async ({ page }) => {
    // 1. Switch back to Workflow Mapper tab
    await page.getByRole('button', { name: 'Workflow Mapper' }).first().click();

    // 2. Double click on 'Dashboard Overview' node
    const dashboardNode = page.locator('.react-flow__node', { hasText: 'Dashboard Overview' });
    await expect(dashboardNode).toBeVisible();
    await dashboardNode.dblclick();

    // 3. Verify it switches activeTab to 'review' and renders active mockup view header
    await expect(page.getByRole('button', { name: 'Box' })).toBeVisible();
    await expect(page.getByText('System Overview')).toBeVisible(); // Check dashboard HTML is rendered
  });

  test('should overlay parent annotations on child mockup when connected via inheritance', async ({ page }) => {
    // 1. Switch back to Workflow Mapper tab
    await page.getByRole('button', { name: 'Workflow Mapper' }).first().click();

    // 2. Set up prompt response to choose inheritance connection (option '2')
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Select Connection Type');
      await dialog.accept('2'); // Choose inheritance
    });

    // 3. Drag connection from Dashboard Overview source to Login Portal target
    const childNode = page.locator('.react-flow__node', { hasText: 'Dashboard Overview' });
    const parentNode = page.locator('.react-flow__node', { hasText: 'Login Portal' });

    const sourceHandle = childNode.locator('.react-flow__handle.source');
    const targetHandle = parentNode.locator('.react-flow__handle.target');

    await sourceHandle.hover();
    await page.mouse.down();
    await targetHandle.hover();
    await page.mouse.up();

    // 4. Double click Dashboard Overview node to navigate to reviewer
    await childNode.dblclick();

    // 5. Verify inheritance overlay banner and template comment letter 'A'
    await expect(page.getByText('Inheriting template layout structure from Login Portal')).toBeVisible();
    // Template comment code is 'A' (1st comment from parent view login-v2)
    await expect(page.locator('div', { hasText: 'A' }).first()).toBeVisible();
  });

  test('should generate implementation plan from workflows and comments', async ({ page }) => {
    // 1. Switch to Implementation Plan tab
    await page.getByRole('button', { name: 'Implementation Plan' }).first().click();

    // 2. Click "Generate Plan from Mockups" button
    await page.getByRole('button', { name: 'Generate Plan from Mockups' }).click();

    // 3. Switch to Edit mode to inspect the Markdown contents
    await page.getByRole('button', { name: 'Edit' }).click();
    const planTextarea = page.locator('textarea[placeholder="Draft system implementation plan..."]');
    await expect(planTextarea).toBeVisible();
    
    // 4. Verify system workflows, transitions, and annotations are outlined
    await expect(planTextarea).toContainText('System Implementation Plan');
    await expect(planTextarea).toContainText('Login Portal');
    await expect(planTextarea).toContainText('Dashboard Overview');
    await expect(planTextarea).toContainText('Successful Sign In');
    await expect(planTextarea).toContainText('Click Settings Gear');
  });

  test('should refine plan with AI and display progress overlay on execution', async ({ page }) => {
    // 1. Switch to Implementation Plan tab
    await page.getByRole('button', { name: 'Implementation Plan' }).first().click();

    // 2. Generate initial plan
    await page.getByRole('button', { name: 'Generate Plan from Mockups' }).click();

    // 3. Fill refinement prompt and submit
    const refinementTextarea = page.locator('textarea[placeholder^="e.g. Include mobile"]');
    await refinementTextarea.fill('Focus on responsive layout viewports');
    await page.getByRole('button', { name: 'Refine Plan with AI' }).click();

    // 4. Check Edit panel to confirm recommendation is added
    await page.getByRole('button', { name: 'Edit' }).click();
    const planTextarea = page.locator('textarea[placeholder="Draft system implementation plan..."]');
    await expect(planTextarea).toContainText('Mobile Breakpoints');

    // 5. Execute plan and verify progress overlay
    await page.getByRole('button', { name: 'Execute Implementation Plan' }).click();
    await expect(page.getByText('Executing Plan Components')).toBeVisible();

    // 6. Wait for compilation success and dismiss overlay
    await expect(page.getByText('Execution Complete!')).toBeVisible({ timeout: 8000 });
    await page.getByRole('button', { name: 'Close Overlay' }).click();
    await expect(page.getByText('Execution Complete!')).not.toBeVisible();
  });

  test('should undo manual node drags using Control+Z keyboard shortcut', async ({ page }) => {
    // 1. Switch back to Workflow Mapper tab
    await page.getByRole('button', { name: 'Workflow Mapper' }).first().click();

    // 2. Locate node and record initial bounding box
    const node = page.locator('.react-flow__node', { hasText: 'Dashboard Overview' });
    await expect(node).toBeVisible();
    const boxBefore = await node.boundingBox();
    expect(boxBefore).not.toBeNull();

    if (boxBefore) {
      // 3. Drag the node to another position
      await page.mouse.move(boxBefore.x + 10, boxBefore.y + 10);
      await page.mouse.down();
      await page.mouse.move(boxBefore.x + 150, boxBefore.y + 150, { steps: 5 });
      await page.mouse.up();

      // Wait a moment and check position changed
      await page.waitForTimeout(200);
      const boxAfterDrag = await node.boundingBox();
      expect(boxAfterDrag).not.toBeNull();
      if (boxAfterDrag) {
        expect(boxAfterDrag.x).not.toBeCloseTo(boxBefore.x, 1);
        expect(boxAfterDrag.y).not.toBeCloseTo(boxBefore.y, 1);
      }

      // 4. Press Control+Z to undo
      await page.keyboard.press('Control+z');

      // 5. Verify the node position has reverted
      await page.waitForTimeout(200);
      const boxAfterUndo = await node.boundingBox();
      expect(boxAfterUndo).not.toBeNull();
      if (boxAfterUndo) {
        expect(boxAfterUndo.x).toBeCloseTo(boxBefore.x, 1);
        expect(boxAfterUndo.y).toBeCloseTo(boxBefore.y, 1);
      }
    }
  });
});
