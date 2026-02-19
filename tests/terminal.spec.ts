import { test, expect } from '@playwright/test';

test.describe('Terminal Pane', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should toggle terminal via status bar', async ({ page }) => {
    // Click Terminal button in status bar
    await page.getByText('Terminal', { exact: true }).click();
    
    // Check if terminal is visible
    await expect(page.getByText('Welcome to Nexus Shell Terminal')).toBeVisible();
    
    // Close terminal via X button
    await page.locator('button').filter({ has: page.locator('svg.lucide-x') }).last().click();
    
    // Check if terminal is hidden
    await expect(page.getByText('Welcome to Nexus Shell Terminal')).not.toBeVisible();
  });

  test('should execute commands and show output', async ({ page }) => {
    await page.getByText('Terminal', { exact: true }).click();
    
    const input = page.locator('input[type="text"]').last();
    await input.fill('echo hello world');
    await input.press('Enter');
    
    await expect(page.getByText('hello world', { exact: true })).toBeVisible();
    
    await input.fill('help');
    await input.press('Enter');
    await expect(page.getByText('Available commands: help, clear, echo')).toBeVisible();
  });
});
