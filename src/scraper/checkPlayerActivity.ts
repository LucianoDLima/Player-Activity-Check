import puppeteer, { Browser } from "puppeteer";
import { formatRunescapeDate } from "../util/formatDate";
import { endpoints } from "../config/endpoints";

export async function checkPlayerActivity(player: string) {
  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();

    const url = `${endpoints.player.RUNEMETRICS_WEB}${player}`;

    await page.goto(url, { waitUntil: "domcontentloaded" });

    await page.waitForSelector("h2.profile-block__name", {
      timeout: 15000,
    });

    const rawDate = await page.evaluate(() => {
      const firstTimeElement = document.querySelector(
        "ul.activity-block__list li .activity-block__time",
      );
      return firstTimeElement?.textContent?.trim() || null;
    });

    const activityDate = rawDate ? formatRunescapeDate(rawDate) : null;
    console.log(activityDate);

    return activityDate;
  } catch (error) {
    console.log(`Error checking activity for ${player}:`, error);

    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
