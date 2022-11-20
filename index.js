const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
      headless: false
  });
  const page = await browser.newPage();

  await page.goto('https://developers.google.com/web/');

  // await browser.close();
})();