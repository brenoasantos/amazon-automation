const { chromium } = require('playwright'); // Import library 'Chromium' from the 'Playwright' packet to create an instance of Chromium, browser controlled by Playwright
const readline = require('readline'); // Import the module 'readline', used to create a text input reading interface in the terminal

const input = readline.createInterface({ // Prompt user for keyword
   input: process.stdin,
   output: process.stdout
});

input.question('Enter the keyword for the search: ', async (keyword) => {
   // Initialize Chromium and set the headless parameter: false, which allows graphical visualization of the code step by step in the started Chromium instance
   const browser = await chromium.launch({ headless: false });
   const page = await browser.newPage(); // Create a new page in the browser from the launched instance
   await page.goto('https://www.amazon.com');  // Access Amazon
   await page.waitForTimeout(2000); // Wait for page elements to load
   await page.click('#glow-ingress-block'); // Click on the button to edit address
   await page.waitForTimeout(2000); // Wait for page elements to load
   await page.fill('input[class="GLUX_Full_Width a-declarative"]', '11001'); // Fill in the zip code provided 11001
   await page.click('#GLUXZipUpdate-announce'); // Click on the apply button
   await page.waitForTimeout(3000); // Wait for page elements to load
   await page.locator('span.a-button-text#GLUXConfirmClose-announce').last().click({ force: true }); // Click on the Done button
   await page.waitForTimeout(3000); // Wait for page elements to load
   // Perform a search with the user-supplied keyword
   await page.fill('input[name="field-keywords"]', keyword); // Fill in the search bar with the keyword provided by the user
   await page.click('span[class="nav-search-submit-text nav-sprite nav-progressive-attribute"]'); //Click on the search button
   await page.waitForTimeout(3000); // Wait for page elements to load

   const nonSponsoredProduct = await page.locator('div[data-cy="title-recipe"]:not(:has(div[class="a-row a-spacing-micro"]))'); // References the first non-sponsored product

   if (await nonSponsoredProduct.count() > 0) { // Check if there is at least one non-sponsored product
      // Get the link to the first non-sponsored product
      const productLink = await nonSponsoredProduct.first().evaluate(el => el.querySelector('a[class="a-link-normal s-underline-text s-underline-link-text s-link-style a-text-normal"]').href);
      await page.goto(productLink); // Access the link

      console.log(`\nResult for '${keyword}':\n`); // Inform about the result obtained from the keyword provided by the user

      // Extract title, price, units sold, rating, number of reviews and feature bullets
      const title = await page.$eval('span.a-size-large.product-title-word-break', el => el.textContent);
      const priceWhole = await page.$eval('span.a-price-whole', el => el.textContent);
      const priceFraction = await page.$eval('span.a-price-fraction', el => el.textContent);
      const price = `${priceWhole}${priceFraction}`;
      console.log(`Title: ${title.trim()}`); // Print product title on terminal
      console.log(`Price: $${price}`); // Print product price on terminal

      try { // Try to access the element that contains the number of units sold
            const unitsSold = await page.$eval('span[id="social-proofing-faceout-title-tk_bought"]', el => el.textContent);
            const cleanUnitsSold = unitsSold.trim().split(' ')[0].replace('K', ',000'); // Make it more presentable
            console.log(`Units sold: ${cleanUnitsSold} past month`); // Print units sold of the product in the previous month on the terminal
      } catch (error) { // If it is not possible to access the element, inform that there is no information about sales
            console.log("Units sold: no information");
      }

      try { // Try to access the element that contains the product rating 
            const ratingText = await page.$eval('span[data-hook="rating-out-of-text"]', el => el.textContent);
            console.log(`Rating: ${ratingText} stars`); // Print product rating on terminal
      } catch (error) { // If it is not possible to access the element, inform that the product has not yet been rated
            console.log("Rating: product not yet rated");
      }

      try { // Try to access the element that contains the product number of reviews 
            const numReviews = await page.$eval('span[data-hook="total-review-count"]', el => el.textContent);
            const numReviewsClean = numReviews.replace(/[^0-9,]/g, ''); // Make it more presentable
            console.log(`Number of reviews: ${numReviewsClean}`); // Print product number of reviews on terminal
      } catch (error) { // If it is not possible to access the element, inform that the product has not yet been reviewed
            console.log("Number of reviews: product not yet reviewed");
      }
      // Print the resource markers with a line break so that the information is below the rest, as the volume of content is greater than the rest
      console.log('Feature bullets:\n');

      // Initialize a structure that is modifiable as feature bullets do not have as uniform a structure as other product information
      let featureBullets = '';
      try { // Try to access the element containing the resource markers header ('About this item') because it is not mandatory to have
            const header = await page.$eval('div.a-section.a-spacing-medium.a-spacing-top-small h1', el => el.textContent);
            featureBullets += `${header.trim()}\n\n`;
      } catch (error) {} // Simply do nothing if the element does not exist
      // Dynamically add feature bullets divided into topics like on website to make the terminal content more presentable
      featureBullets += await page.$$eval('div.a-section.a-spacing-medium.a-spacing-top-small ul li', listItems => {
            return listItems.map(item => {
               return '- ' + item.textContent.trim();
            }).join('\n');
      });

      console.log(featureBullets); // Print product feature bullets on terminal

   } else { // If no (non-sponsored) product is found, inform
      console.log('No products found');
   }

   await page.waitForTimeout(3000); // Wait a bit so it doesn't close suddenly
   await page.close(); // Close the page
   await browser.close(); // Close the browser
   input.close(); // Close the reading interface that was opened to obtain user input
});
