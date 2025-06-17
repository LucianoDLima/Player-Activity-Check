import puppeteer from "puppeteer";

export async function getLatestActivityDate(user: string): Promise<string> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(
    `https://apps.runescape.com/runemetrics/app/overview/player/${user}`,
    {
      waitUntil: "domcontentloaded",
    },
  );

  await new Promise((res) => setTimeout(res, 10000));

  const date = await page.evaluate((userName: string) => {
    const dateElement = document.querySelector(
      ".activity-block__list-item .activity-block__time",
    );

    return (
      `Last activity from ${userName}: ` +
      (dateElement?.textContent?.replace(/\s+/g, " ").trim() || "No activity found")
    );
  }, user);

  await browser.close();

  return date;
}
