import { test, expect } from '@playwright/test';

test.describe('TreeWidget Context Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/projects', async route => {
      await route.fulfill({ status: 200, json: [
        { id: 'proj1', name: 'src' },
        { id: 'proj2', name: 'docs' }
      ] });
    });
    await page.route('**/api/files', async route => {
      await route.fulfill({ status: 200, json: [] });
    });

    await page.goto('/');
    // Ensure Explorer sidebar is active
    await page.getByLabel('Explorer').click({ force: true });
    await page.waitForTimeout(500);
  });

  test('should show context menu on right click', async ({ page }) => {
    // Right click on the 'src' folder in the explorer
    const srcFolder = page.locator('div').filter({ hasText: /^src$/ }).first();
    await srcFolder.click({ button: 'right', force: true });
    
    // Check if context menu items are visible
    await expect(page.getByText('New File')).toBeVisible();
    await expect(page.getByText('New Folder')).toBeVisible();
  });

  test('should trigger delete confirmation', async ({ page }) => {
    const srcFolder = page.locator('div').filter({ hasText: /^src$/ }).first();
    await srcFolder.click({ button: 'right', force: true });
    
    await page.getByText('Delete').click();

    // Verify the custom GlobalModal is visible
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal.getByText('Delete this item?')).toBeVisible();

    // Dismiss by clicking Cancel
    await modal.getByRole('button', { name: 'Cancel' }).click();
    await expect(modal).not.toBeVisible();
  });
});
