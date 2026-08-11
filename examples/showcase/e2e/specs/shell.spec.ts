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

test('persists chat state on reload', async ({ page }) => {
  await page.goto('/');

  // Check initial state
  const chatInput = page.getByPlaceholder('Ask Nexus...');
  const isVisible = await chatInput.isVisible();
  
  if (!isVisible) {
    // Click the 'Chat' button in the status bar (exact text, last one)
    await page.getByText('Chat', { exact: true }).last().click({ force: true });
    
    // Wait for the Chat pane input to be visible
    await expect(chatInput).toBeVisible({ timeout: 5000 });
  }

  // Reload the page
  await page.reload();

  // Chat should still be open
  await expect(chatInput).toBeVisible({ timeout: 5000 });
});

test('persists theme on reload', async ({ page }) => {
  await page.goto('/');

  // Open settings via aria-label
  await page.getByLabel('Settings').click({ force: true });
  
  // Select Georgia Tech theme
  await page.getByText('Georgia Tech').click();
  
  // Verify class exists on html
  await expect(page.locator('html')).toHaveClass(/theme-gt/);

  // Reload the page
  await page.reload();

  // Theme should still be GT
  await expect(page.locator('html')).toHaveClass(/theme-gt/);
});

test('prompts before closing dirty tab', async ({ page }) => {
  await page.goto('/');

  // Mark tab as dirty
  await page.getByText('Mark as Dirty').click();
  await expect(page.getByText('This tab will now prompt')).toBeVisible();

  // Click the 'x' on the Welcome tab
  await page.locator('.flexlayout__tab_button_trailing').first().click();

  // Verify the custom GlobalModal is visible
  const modal = page.locator('[role="dialog"]');
  await expect(modal).toBeVisible();
  await expect(modal.getByText('unsaved changes')).toBeVisible();

  // Confirm closing the tab by clicking the confirm button
  await modal.getByRole('button', { name: 'Confirm' }).click();
  
  // Welcome tab should be gone
  await expect(page.getByText('Start by exploring')).not.toBeVisible();
});

