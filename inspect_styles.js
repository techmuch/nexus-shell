import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');
  
  // Switch to dark theme
  await page.evaluate(() => {
    // We can just click the settings -> dark theme
    const settingsBtn = document.querySelector('[aria-label="Settings"]');
    if (settingsBtn) settingsBtn.click();
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const darkBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Dark');
    if (darkBtn) darkBtn.click();
  });
  await page.waitForTimeout(500);

  // Check computed styles of the tab and welcome content
  const styles = await page.evaluate(() => {
    const tab = document.querySelector('.flexlayout__tab');
    const welcomeH1 = document.querySelector('h1');
    const layout = document.querySelector('.flexlayout__layout');
    return {
      tabBg: tab ? window.getComputedStyle(tab).backgroundColor : null,
      tabColor: tab ? window.getComputedStyle(tab).color : null,
      welcomeH1Color: welcomeH1 ? window.getComputedStyle(welcomeH1).color : null,
      welcomeH1Text: welcomeH1 ? welcomeH1.textContent : null,
      layoutBg: layout ? window.getComputedStyle(layout).backgroundColor : null,
      layoutCssVars: layout ? {
        card: window.getComputedStyle(layout).getPropertyValue('--card'),
        bg: window.getComputedStyle(layout).getPropertyValue('--color-background')
      } : null
    };
  });
  console.log(JSON.stringify(styles, null, 2));

  await browser.close();
})();
