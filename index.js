const puppeteer = require('puppeteer');
const fs = require("fs");
const fastcsv = require('fast-csv');

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
  let pageCounter = 1;

  // as long as the next button is clickable, we want to continue clicking the next button and fetching results on each page
  while (nextButtonVisible) {
    // wait until the search results have fully loaded before trying to interact with them
    await page.waitForSelector('[data-cel-widget="search_result_0"]', {visible: true});
    await page.waitForSelector('.s-pagination-item.s-pagination-next', {visible: true});
    const laptops = await page.$$('.s-result-item');
    console.log(`CURRENT PAGE: ${pageCounter}`)

    for (const laptop of laptops) {
      let title = null;
      let priceDollar = null;
      let priceCent = null
      let image = null;
      let url = null;
  
      // for each element attempt to retrieve the title if there is one (some elements in here may not have a title)
      try {
        title = await page.evaluate(el => el.querySelector('h2 > a > span').textContent, laptop);
      } catch (err) {
        //console.log('no title found for this element');
        // console.log(err);
      }
  
      // for each element try to retrieve the price
      try {
        priceDollar = await page.evaluate(el => el.querySelector('span.a-price-whole').textContent, laptop);
        priceCent = await page.evaluate(el => el.querySelector('span.a-price-fraction').textContent, laptop);
      } catch(err) {
        //console.log('no price found for this element');
      }
  
      // for each element try to retrieve the image url
      try {
        image = await page.evaluate(el => el.querySelector('.s-image').getAttribute('src'), laptop);
      } catch(err) {
        //console.log('no image found for element');
      }

      // for each element try to receive page URL
      try {
        url = await page.evaluate(el => el.querySelector('.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal').href, laptop);
      } catch (err) {
        console.log('No URL found for this element');
      }
     
      // create our cleaned array of JSON objects with just the pertinent data
      if (title !== null) {
        transformedLaptops.push({
          title: title,
          price: `${priceDollar}${priceCent}`,
          imageUrl: image,
          pageUrl: url
        });
      }
    }
    pageCounter++;

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

  // TO-DO: navigate to the details page of each laptop to fetch specific details about each laptop
  // for (laptop of transformedLaptops) {

  // }

  // TO-DO: write final data to csv report

  console.log(`Final List Count: ${transformedLaptops.length}`)
  console.log('SCRIPT COMPLETE');
  // await browser.close();
})();
