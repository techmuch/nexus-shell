import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');
  // Wait for the shell to load
  await page.waitForSelector('.flexlayout__layout', { timeout: 10000 });
  
  // Switch to dark theme
  await page.getByLabel('Settings').click({ force: true });
  await page.getByText('Dark').click();
  await page.waitForTimeout(500); // Wait for transition
  
  await page.screenshot({ path: 'debug-dark-theme.png' });
  await browser.close();
})();
