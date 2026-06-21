import { test, expect } from '@playwright/test';

test.describe('Artifact Creation Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Ensure Explorer sidebar is active
    await page.getByLabel('Explorer').click({ force: true });
    await page.waitForTimeout(500);
  });

  test('should create a new dialogue map and open it in a tab', async ({ page }) => {
    // 1. Right click on the root or 'src' folder in the explorer
    const srcFolder = page.locator('div').filter({ hasText: /^src$/ }).first();
    await srcFolder.click({ button: 'right', force: true });
    
    // 2. Click "New Dialogue Map"
    // This is the intended feature we want to build
    await expect(page.getByText('New Dialogue Map')).toBeVisible();
    await page.getByText('New Dialogue Map').click();

    // 3. Expect a new file input or directly an 'Untitled.map' node
    // We'll assume for simplicity it creates an 'Untitled.map' immediately and we can see it
    const newMapFile = page.locator('div').filter({ hasText: /^Untitled\.map$/ }).first();
    await expect(newMapFile).toBeVisible({ timeout: 2000 });

    // 4. Double click the map file to open it
    await newMapFile.dblclick();

    // 5. Expect a new tab with the title "Untitled.map"
    const newTab = page.locator('.flexlayout__tab_button', { hasText: 'Untitled.map' }).first();
    await expect(newTab).toBeVisible();

    // 6. Expect the Dialogue Mapping Canvas to be visible in that tab
    // We can look for the ReactFlow canvas inside the active layout
    const canvas = page.locator('.react-flow').first();
    await expect(canvas).toBeVisible();
  });
});
