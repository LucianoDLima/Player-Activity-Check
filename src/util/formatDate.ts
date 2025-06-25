/**
 * Format a Runescape date string into a prisma compatible date
 *
 * @param dateStr The date string scraped from the Runescape site (like 1-Jan-2023 00:00:00)
 */
export function formatRunescapeDate(dateStr: string) {
  const parts = dateStr.split(" ");
  if (parts.length < 1) return null;

  const [day, monthText, year] = parts[0].split("-");

  const months: Record<string, string> = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };

  const month = months[monthText];
  if (!month) return null;

  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

export function calcDaysSince(date: Date | null): number | null {
  if (!date) return null;

  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}
