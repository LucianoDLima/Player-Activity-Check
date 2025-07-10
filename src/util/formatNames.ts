/**
 * Format a player name by removing the &nbsp; (whitespace) from scraped names.
 * Example: From "Rok%C2%A0un" to "Rok u".
 */
export function formatName(name: string) {
  return name
    .replace(/\s+/g, " ")
    .replace(/\u00A0/g, " ")
    .trim();
}
