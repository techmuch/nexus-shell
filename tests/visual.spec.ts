import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('Status Bar should match snapshot', async ({ page }) => {
    await page.goto('/');
    const statusBar = page.locator('.bg-primary.text-primary-foreground').last();
    await expect(statusBar).toBeVisible();
    await expect(statusBar).toHaveScreenshot('status-bar.png');
  });

  test('Activity Bar should match snapshot', async ({ page }) => {
    await page.goto('/');
    const activityBar = page.getByLabel('Explorer').locator('..');
    await expect(activityBar).toBeVisible();
    await expect(activityBar).toHaveScreenshot('activity-bar.png');
  });

  test('Shell Layout Light Theme should match snapshot', async ({ page }) => {
    await page.goto('/');
    // Wait for the layout to settle
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('full-layout-light.png');
  });

  test('Shell Layout Georgia Tech Theme should match snapshot', async ({ page }) => {
    await page.goto('/');
    
    // Open settings and switch to GT theme
    await page.getByLabel('Settings').click({ force: true });
    await page.getByText('Georgia Tech').click();
    
    // Wait for animation
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('full-layout-gt.png');
  });
});
