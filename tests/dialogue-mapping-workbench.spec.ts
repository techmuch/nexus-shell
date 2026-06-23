import { test, expect } from '@playwright/test';

test.describe('Dialogue Mapping Workstation Workbench Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/projects', async route => {
      await route.fulfill({ status: 200, json: [] });
    });
    
    await page.route('**/api/files', async route => {
      await route.fulfill({ status: 200, json: [] });
    });

    await page.route('**/api/maps/content', async route => {
      await route.fulfill({ status: 200, json: { success: true } });
    });

    // Navigate to the Dialogue Mapping Workbench workstation layout
    await page.goto('/?layout=dialogue');
    
    // Wait for the workbench layout to load
    await expect(page.getByText('NEXUS DIALOGUE MAPPER')).toBeVisible({ timeout: 5000 });
  });

  test('should load the header title, theme switcher, and user profile', async ({ page }) => {
    // Verify Dialogue Mapper branding title
    await expect(page.getByText('NEXUS DIALOGUE MAPPER')).toBeVisible();
    await expect(page.getByText('IBIS Decision & Argumentation Modeling')).toBeVisible();

    // Verify Theme Switcher buttons
    await expect(page.getByRole('button', { name: 'Light', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Dark', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'GT', exact: true })).toBeVisible();

    // Verify User Profile badge is present
    await expect(page.getByLabel('User Profile Menu')).toBeVisible();
  });

  test('should render Node Library, Dialogue Map, and Argument Inspector tabs', async ({ page }) => {
    // Verify all workstation tab titles are visible
    await expect(page.getByText('Node Library', { exact: true })).toBeVisible();
    await expect(page.locator('.flexlayout__tab_button_content', { hasText: 'Dialogue Map' }).first()).toBeVisible();
    await expect(page.getByText('Argument Inspector', { exact: true })).toBeVisible();

    // Verify that the Node Library list is visible
    await expect(page.getByText('Question / Issue')).toBeVisible();
    await expect(page.getByText('Idea / Position')).toBeVisible();
    await expect(page.getByText('Pro Argument')).toBeVisible();
  });

  test('should support dragging nodes from the Node Library tab to the Dialogue Map tab', async ({ page }) => {
    const source = page.getByRole('button', { name: 'Idea / Position' });
    const target = page.locator('.react-flow');

    await expect(source).toBeVisible();
    await expect(target).toBeVisible();

    // Drag the idea node template from the library tab to the canvas tab
    await source.dragTo(target);

    // Commit edit mode for the newly created node
    await page.locator('.react-flow__node-ibisNode input').press('Enter');

    // Verify the node is placed on the canvas
    await expect(page.getByText('New Idea').first()).toBeVisible();

    // Select the new node on the canvas by clicking its container
    await page.locator('.react-flow__node', { hasText: 'New Idea' }).first().click();

    // Verify the node properties are loaded in the separate Argument Inspector tab
    const inspectorInput = page.locator('input[placeholder="Enter node title..."]');
    await expect(inspectorInput).toBeVisible();
    await expect(inspectorInput).toHaveValue('New Idea');

    // Modify the name in the inspector tab
    await inspectorInput.fill('Updated Idea Name');
    
    // Verify that the name updates on the Dialogue Map tab immediately
    await expect(page.getByText('Updated Idea Name').first()).toBeVisible();
  });
});
