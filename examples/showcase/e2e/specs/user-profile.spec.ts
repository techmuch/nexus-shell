import { test, expect } from '@playwright/test';

test.describe('UserProfile Standalone Widget', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to root which includes the UserProfile in ShellLayout by default
    await page.goto('/');
  });

  test('should display default profile and toggle the dropdown menu on click', async ({ page }) => {
    // Verify default badge is visible via its aria-label
    const badge = page.getByLabel('User Profile Menu');
    await expect(badge).toBeVisible();

    // Verify the user name text is visible inside the button
    await expect(page.getByText('David Tech').first()).toBeVisible();

    // Click to open dropdown menu
    await badge.click();

    // Verify dropdown menu is visible and contains expected actions
    const dropdown = page.getByRole('menu');
    await expect(dropdown).toBeVisible();
    await expect(dropdown.getByText('David Tech')).toBeVisible();
    await expect(dropdown.getByText('Shell Architect')).toBeVisible();
    await expect(dropdown.getByText('david@techmuch.io')).toBeVisible();
    await expect(dropdown.getByText('Upload Avatar Image')).toBeVisible();
    await expect(dropdown.getByText('Account Settings')).toBeVisible();
    
    // Clicking outside should close the menu
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await expect(dropdown).not.toBeVisible();
  });

  test('should allow editing profile and persist changes across reload', async ({ page }) => {
    const badge = page.getByLabel('User Profile Menu');
    await badge.click();

    // Find the edit profile pencil button and click it
    const dropdown = page.getByRole('menu');
    const editBtn = dropdown.locator('button[title="Edit Profile"]');
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // Verify form inputs are visible
    const nameInput = page.locator('input#profile-name');
    const roleInput = page.locator('input#profile-role');
    await expect(nameInput).toBeVisible();
    await expect(roleInput).toBeVisible();

    // Edit name and role
    await nameInput.fill('David Updated');
    await roleInput.fill('Lead Architect');
    
    // Save the changes with exact matching
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    // Check that the badge updates immediately
    await expect(page.getByText('David Updated').first()).toBeVisible();
    await expect(page.getByText('Lead Architect').first()).toBeVisible();

    // Reload the page
    await page.reload();

    // Check that changes are persisted in localStorage and loaded correctly
    await expect(page.getByText('David Updated').first()).toBeVisible();
    await expect(page.getByText('Lead Architect').first()).toBeVisible();
  });
});
