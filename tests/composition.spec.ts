import { test, expect } from '@playwright/test';

test.describe('Dialogue Mapping Composition Story', () => {
  test('should support dragging nodes from library to canvas and updating inspector', async ({ page }) => {
    // Navigate to Storybook story directly
    await page.goto('http://localhost:6006/iframe.html?id=compositions-dialogue-mapping-workbench--dark-theme&viewMode=story');

    // Wait for the workbench layout to load
    await expect(page.getByText('IBIS Node Library')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.react-flow')).toBeVisible();

    // Verify the initial state of the inspector (no node selected)
    await expect(page.getByText('No node selected. Click on a node in the mapping canvas to view and edit its logical properties.')).toBeVisible();

    // Drag a Question / Issue node template from the library to the canvas
    const sourceQuestion = page.getByRole('button', { name: 'Question / Issue' });
    const target = page.locator('.react-flow');

    await expect(sourceQuestion).toBeVisible();
    await expect(target).toBeVisible();

    // Drag and drop the Question node to canvas
    await sourceQuestion.dragTo(target);

    // Commit edit mode for the newly created node
    await page.locator('.react-flow__node-ibisNode input').press('Enter');

    // Verify the node is placed on the canvas
    await expect(page.getByText('New Question').first()).toBeVisible();

    // Select the new node on the canvas by clicking its container
    await page.locator('.react-flow__node', { hasText: 'New Question' }).first().click();

    // Verify the node properties are loaded in the Argument Inspector
    const inspectorInput = page.locator('input[placeholder="Enter node title..."]');
    await expect(inspectorInput).toBeVisible();
    await expect(inspectorInput).toHaveValue('New Question');

    // Modify the name in the inspector
    await inspectorInput.fill('Composition Test Question');
    await inspectorInput.press('Enter');

    // Verify that the name updates on the canvas immediately
    await expect(page.getByText('Composition Test Question').first()).toBeVisible();
  });
});
