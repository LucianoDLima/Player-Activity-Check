import puppeteer from "puppeteer";

export async function getListOfMembers(): Promise<string[]> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  console.log("Going to page...");
  await page.goto("https://runepixels.com/clans/iron-rivals/list", {
    waitUntil: "domcontentloaded",
  });

  console.log("Waiting for status header...");
  await page.waitForFunction(
    () => {
      const elements = Array.from(document.querySelectorAll("th.right.line-height"));
      return elements.some((el) => el.textContent?.includes("Status"));
    },
    { timeout: 25000 },
  );
  console.log("Status header found, scraping members...");

  await new Promise((res) => setTimeout(res, 5000));

  const playerNames = await page.evaluate(() => {
    const nameSpans = Array.from(
      document.querySelectorAll("a.name app-player-name .name span"),
    );
    return nameSpans.map((span) => span.textContent?.trim() || "");
  });

  await browser.close();

  console.log("Members scraped:", playerNames.length);
  return playerNames;
}
