const nodeCron = require("node-cron");
const puppeteer = require("puppeteer");

const url = "https://www.worldometers.info/world-population/";

async function scrapeWorldPopulation() {
    // Log a message on the terminal as the scheduled job starts
    // We are using chalk to make the message on the terminal look colorful
    console.log("Running scheduled job");
    
    try {
      // This will help us compute the duration of the job later
      const date = Date.now();
      // Launch puppeteeer
      const browser = await puppeteer.launch();
      // Launch a new headless browser page
      const newPage = await browser.newPage();
      // Navigate to the URL of the page we are scraping. This takes a bit of time
      // You can change the timeout to an appropriate value if you wish otherwise
      // we wait until the page loads
      await newPage.goto(url, { waitUntil: "load", timeout: 0 });
      // Start scraping the page
      // If world population is 7,876,395,914 then digitGroups will be
      // ["7", "876", "395", "914"]
      const digitGroups = await newPage.evaluate(() => {
        const digitGroupsArr = [];
        // For selecting span elements containing digit groups
        const selector =
          "#maincounter-wrap .maincounter-number .rts-counter span";
        const digitSpans = document.querySelectorAll(selector);
        // Loop through the digit spans selected above
        digitSpans.forEach((span) => {
          if (!isNaN(parseInt(span.textContent))) {
            digitGroupsArr.push(span.textContent);
          }
        });
        return JSON.stringify(digitGroupsArr);
      });
      // Close the headless browser
      await browser.close();
      // Print world population on the terminal if scraping is successful
      console.log( `World population on ${new Date().toISOString()}:`, JSON.parse(digitGroups).join(","));
    } catch (error) {
      // Print the error message on the terminal
      console.log(error);
    }
}
// Schedule a job to run every two minutes
const job = nodeCron.schedule("*/1 * * * *", scrapeWorldPopulation);