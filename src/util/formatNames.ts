/**
 * Format a player name by removing the &nbsp; (whitespace) from scraped names.
 * From "Rok%C2%A0un" to "Rok u".
 *
 * @param name The player name from the scraped data
 */
export function formatName(name: string): string {
  return name
    .replace(/\s+/g, " ")
    .replace(/\u00A0/g, " ")
    .trim();
}
