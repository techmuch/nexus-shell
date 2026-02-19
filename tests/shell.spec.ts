import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Nexus Shell/);
});

test('loads layout', async ({ page }) => {
  await page.goto('/');

  // Check for the main heading
  await expect(page.getByRole('heading', { name: 'Nexus Shell' })).toBeVisible();
  
  // Check for menu items
  await expect(page.getByText('File')).toBeVisible();
  
  // Check for tab content
  await expect(page.getByText('Start by exploring')).toBeVisible();
});
