import {
  format,
  formatDistanceToNowStrict,
  differenceInDays,
  parseISO,
} from "date-fns";

export function fmtDate(date: string | Date, pattern = "PP") {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern);
}

export function fmtRelative(date: string | Date) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNowStrict(d, { addSuffix: true });
}

export function daysSince(date: string | Date) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return Math.max(0, differenceInDays(new Date(), d));
}
