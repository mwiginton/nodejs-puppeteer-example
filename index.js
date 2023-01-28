const puppeteer = require('puppeteer');

// TODO FIGURE OUT WHY ONLY SEVEN RESULTS ARE GETTING FETCHED ON PAGE 2 ONWARD
(async () => {
  const browser = await puppeteer.launch({
      headless: false,         // indicates that we want the browser visible
      defaultViewport: false,  // indicates not to use the default viewport size but to adjust to the user's screen resolution instead
      userDataDir: './tmp'     // caches previous actions for the website. Useful for remembering if we've had to solve captchas in the past so we don't have to resolve them
  });
  const page = await browser.newPage();

  await page.goto('https://www.amazon.com/s?k=gaming+laptop', {waitUntil: "load"});

  let nextButtonVisible = await page.$('a.s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator') != null;
  let transformedLaptops = [];

  // as long as the next button is clickable, we want to continue clicking the next button and fetching results on each page
  while (nextButtonVisible) {
    // wait until the search results have fully loaded before trying to interact with them
    // div.s-main-slot.s-result-list.s-search-results.sg-row
    await page.waitForSelector('div.s-main-slot.s-result-list.s-search-results.sg-row', {visible: true});
    console.log('selector found')
    const laptops = await page.$$('.s-result-item');
    console.log(`laptops length ${laptops.length}`)
 
    for (const laptop of laptops) {
      let title = null;
      let priceDollar = null;
      let priceCent = null
      let image = null;
  
      // for each element attempt to retrieve the title if there is one (some elements in here may not have a title)
      try {
        title = await page.evaluate(el => el.querySelector('h2 > a > span').textContent, laptop);
      } catch (err) {
        console.log('no title found for this element');
        // console.log(err);
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
      } catch(err) {
        console.log('no image found for element');
      }
      
      // create our cleaned array of JSON objects with just the pertinent data
      if (title !== null) {
        transformedLaptops.push({
          title: title,
          price: `${priceDollar}${priceCent}`,
          imageUrl: image
        });
      }
      
    }

    console.log(`CURRENT RESULT COUNT: ${transformedLaptops.length}`)

    // once we finish processing all the results on the current page, let's try to navigate to the next page if possible
    // if the next button is disabled, we know we can break out of our while loop
    await page.waitForSelector('.s-pagination-item.s-pagination-next', {visible: true});
    if (await page.$('a.s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator') !== null) {
      // if next button is clickable, click to proceed to the next page
      await page.click('a.s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator');
    } else {
      // if next button is not clickable, set nextButtonVisible to false to break out of our while loop
      nextButtonVisible = false;
    }
  }
  // await browser.close();
})();
