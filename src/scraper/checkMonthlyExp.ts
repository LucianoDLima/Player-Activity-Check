import puppeteer, { Browser } from "puppeteer";
import { endpoints } from "../config/endpoints";

// TODO: Maybe new name, this feels like it checks how much exp a player gets monthly
/**
 * Scrape the Runemetrics page to check if the player has gained exp this month.
 * @param player player name
 */
export async function checkMonthlyExp(player: string) {
  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();

    const url = `${endpoints.player.RUNEMETRICS_EXP}${player}/-1`;

    await page.goto(url, { waitUntil: "domcontentloaded" });

    await page.waitForSelector("[data-title=\"'Gain this month'\"]", {
      timeout: 15000,
    });

    const gainThisMonth = await page.evaluate(() => {
      const element = document.querySelector("[data-title=\"'Gain this month'\"]");

      return element?.textContent?.trim() || null;
    });

    console.log(gainThisMonth);

    return gainThisMonth;
  } catch (error) {
    console.log(`Error checking monthly exp gain for ${player}:`, error);

    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
