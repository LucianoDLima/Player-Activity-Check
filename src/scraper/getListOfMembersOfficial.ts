import puppeteer from "puppeteer";

export async function checkNumberOfPages() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const url = process.env.RUNESCAPE_CLAN!;
  console.log(`Checking for number of members`);

  await page.goto(url, { waitUntil: "domcontentloaded" });

  const memberCount = await page.evaluate(() => {
    const span = document.querySelector(".row.first-row .left span");
    return span ? parseInt(span.textContent || "0", 10) : 0;
  });

  await browser.close();
  console.log(`Found member count: ${memberCount}`);

  const pageSize = 45;
  const totalPages = Math.ceil(memberCount / pageSize);
  console.log(`Total pages: ${totalPages}`);

  return totalPages;
}

export async function scrapeHiscorePage(pageNum: number) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const url = `${process.env.RUNESCAPE_CLAN_MEMBERS}${pageNum}`;

  await page.goto(url, { waitUntil: "domcontentloaded" });

  await page.waitForSelector("div.membersListTable span.name", {
    timeout: 15000,
  });

  const members = await page.evaluate(() => {
    const memberElements = Array.from(
      document.querySelectorAll(".membersListTable span.name"),
    );

    return memberElements.map((el) => {
      const name = el.textContent?.trim() || "";

      const rankEl = el.parentElement?.querySelector(".clanRank");
      const rank = rankEl?.textContent?.trim() || "";

      return { name, rank };
    });
  });

  await browser.close();
  return members;
}
