const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
      headless: false,         // indicates that we want the browser visible
      defaultViewport: false,  // indicates not to use the default viewport size but to adjust to the user's screen resolution instead
      userDataDir: './tmp'     // caches previous actions for the website. Useful for remembering if we've had to solve captchas in the past so we don't have to resolve them
  });
  const page = await browser.newPage();

  await page.goto('https://www.amazon.com/s?k=gaming+laptop');

  const laptops = await page.$$('div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item');

  let title = null;
  let priceDollar = null;
  let priceCent = null
  let image = null;

  let transformedLaptops = [];

  for (const laptop of laptops) {
    // for each element attempt to retrieve the title if there is one (some elements in here may not have a title)
    try {
      title = await page.evaluate(el => el.querySelector('h2 > a > span').textContent, laptop);
    } catch (err) {
      console.log('no title found for this element');
      console.log(err);
    }

    // for each element try to retrieve the price
    try {
      priceDollar = await page.evaluate(el => el.querySelector('span.a-price-whole').textContent, laptop);
      priceCent = await page.evaluate(el => el.querySelector('span.a-price-fraction').textContent, laptop);
    } catch(err) {
      console.log('no price found for this element');
    }

    // for each element try to retrieve the image url
    try {
      image = await page.evaluate(el => el.querySelector('.s-image').getAttribute('src'), laptop);
      console.log('image url');
      console.log(image);
    } catch(err) {
      console.log('no image found for element');
    }
    
    if (title !== null) {
      transformedLaptops.push({
        title: title,
        price: `${priceDollar}.${priceCent}`,
        imageUrl: image
      });
    }
  }
  // await browser.close();
})();
