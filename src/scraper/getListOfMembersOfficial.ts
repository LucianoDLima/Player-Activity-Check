import puppeteer, { Browser } from "puppeteer";
import { endpoints } from "../constants/endpoints";

export async function scrapeHiscorePage(pageNum: number) {
  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();

    const url = `${endpoints.clan.MEMBERS}${pageNum}`;

    await page.goto(url, { waitUntil: "domcontentloaded" });

    await page.waitForSelector("div.membersListTable span.name", {
      timeout: 15000,
    });

    // Scrape player names and ranks
    const players = await page.evaluate(() => {
      const playerElements = Array.from(
        document.querySelectorAll(".membersListTable span.name"),
      );

      return playerElements.map((el) => {
        const name = el.textContent?.trim() || "";

        const rankEl = el.parentElement?.querySelector(".clanRank");
        const rank = rankEl?.textContent?.trim() || "";

        return { name, rank };
      });
    });

    return players;
  } catch (error) {
    console.error(`Error scraping page ${pageNum}:`, error);

    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
