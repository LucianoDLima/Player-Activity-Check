import puppeteer, { Browser } from "puppeteer";
import { endpoints } from "../config/endpoints";

export async function getNumberOfPages() {
  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();

    const url = endpoints.clan.MEMBERS;

    console.log(`Checking for number of members`);
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const memberCount = await page.evaluate(() => {
      const span = document.querySelector(".row.first-row .left span");

      return span ? parseInt(span.textContent || "0", 10) : 0;
    });

    console.log(`Found member count: ${memberCount}`);

    const pageSize = 45;
    const totalPages = Math.ceil(memberCount / pageSize);
    console.log(`Total pages: ${totalPages}`);

    return totalPages;
  } catch (error) {
    console.error("Error checking number of pages:", error);

    return 0;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
