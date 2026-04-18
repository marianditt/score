const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  const consoleLogs = [];
  
  page.on('pageerror', (e) => errors.push('PAGE ERROR: ' + e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleLogs.push('CONSOLE ERROR: ' + msg.text());
    }
  });
  
  try {
    await page.goto('http://localhost:4175/score/', { waitUntil: 'networkidle', timeout: 10000 });
    
    const title = await page.title();
    const rootContent = await page.innerHTML('#root');
    const bodyBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
    
    console.log('Title:', title);
    console.log('Root innerHTML length:', rootContent.length);
    console.log('Root content first 500:', rootContent.substring(0, 500));
    console.log('Body background:', bodyBg);
    console.log('Errors:', errors);
    console.log('Console errors:', consoleLogs);
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  await browser.close();
})();
