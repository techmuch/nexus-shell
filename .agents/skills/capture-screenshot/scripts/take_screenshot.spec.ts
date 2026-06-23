import { test, expect } from '@playwright/test';
import path from 'path';

test('capture screenshot of the frontend', async ({ page }) => {
  // Navigate to the dev server. Modify this URL if targeting Storybook (http://localhost:6006)
  const targetUrl = process.env.TARGET_URL || 'http://localhost:5173';
  await page.goto(targetUrl);
  
  // Wait for the main shell layout to render
  await page.waitForLoadState('networkidle');
  
  // Create an artifact path
  const artifactDir = process.env.ARTIFACT_DIR || process.cwd();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = path.join(artifactDir, `screenshot-${timestamp}.png`);
  
  // Take a full page screenshot
  await page.screenshot({ path: screenshotPath, fullPage: true });
  
  console.log(`Screenshot saved to: ${screenshotPath}`);
});
