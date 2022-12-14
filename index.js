const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
      headless: false,         // indicates that we want the browser visible
      defaultViewport: false,  // indicates not to use the default viewport size but to adjust to the user's screen resolution instead
      userDataDir: './tmp'     // caches previous actions for the website. Useful for remembering if we've had to solve captchas in the past so we don't have to resolve them
  });
  const page = await browser.newPage();

  await page.goto('https://www.amazon.com/s?k=gaming+laptop');

  const laptops = await page.$$('div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item')

  for (const laptop of laptops) {
    // for each element attempt to retrieve the title if there is one (some elements in here may not have a title)
    try {
      const title = await page.evaluate(el => el.querySelector('h2 > a > span').textContent, laptop)
    } catch (err) {
      console.log('no title found for this element')
      console.log(err)
    }

    // for each element try to retrieve the price
    try {
      // #search > div.s-desktop-width-max.s-desktop-content.s-opposite-dir.sg-row > div.s-matching-dir.sg-col-16-of-20.sg-col.sg-col-8-of-12.sg-col-12-of-16 > div > span.rush-component.s-latency-cf-section > div.s-main-slot.s-result-list.s-search-results.sg-row > div:nth-child(4) > div > div > div > div > div > div > div > div.sg-col.sg-col-4-of-12.sg-col-8-of-16.sg-col-12-of-20.s-list-col-right > div > div > div.sg-row > div.sg-col.sg-col-4-of-12.sg-col-4-of-16.sg-col-4-of-20 > div > div.a-section.a-spacing-none.a-spacing-top-micro.s-price-instructions-style > div > a > span:nth-child(1) > span:nth-child(2) > span.a-price-whole
      const priceDollar = await page.evaluate(el => el.querySelector('span.a-price-whole').textContent, laptop)
      const priceCent = await page.evaluate(el => el.querySelector('span.a-price-fraction').textContent, laptop)

    } catch(err) {
      console.log('no price found for this element')
    }

    // for each element try to retrieve the image url
    try {
      // s-image
      const image = await page.evaluate(el => el.querySelector('.s-image').getAttribute('src'), laptop)
      console.log('image url')
      console.log(image)
    } catch(err) {
      console.log('no image found for element')
    }
    
  }

  // await browser.close();
})();
