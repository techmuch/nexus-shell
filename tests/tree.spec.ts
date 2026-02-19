import { test, expect } from '@playwright/test';

test.describe('TreeWidget Context Menu', () => {
  test.beforeEach(async ({ page }) => {
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
    
    // Handle the confirmation dialog
    let dialogMessage = '';
    page.on('dialog', async dialog => {
      dialogMessage = dialog.message();
      await dialog.dismiss(); 
    });
    
    await page.getByText('Delete').click();
    expect(dialogMessage).toBeTruthy();
  });
});
