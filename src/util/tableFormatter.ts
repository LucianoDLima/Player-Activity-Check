import { calcDaysSince } from "./dates";

export function formatDaysColumn(
  date: Date | null | undefined,
  width: number,
): string {
  if (!date) {
    return " ".repeat(width);
  }

  const days = calcDaysSince(date);

  return String(days).padStart(width);
}

export function formatBooleanColumn(
  value: boolean | null | undefined,
  width: number,
): string {
  if (value === null || value === undefined) {
    return " ".repeat(width);
  }

  return value ? "yes" : "no".padEnd(width).slice(0, width);
}
