const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const MONTHS_SHORT = [
  "янв",
  "фев",
  "мар",
  "апр",
  "мая",
  "июн",
  "июл",
  "авг",
  "сен",
  "окт",
  "ноя",
  "дек",
];

/** Parses an ISO date without letting the local timezone shift the day. */
function parse(iso: string): { day: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  return { day: Number(match[3]), month: Number(match[2]) - 1 };
}

/**
 * "2026-09-05" + "2026-09-14" -> "5–14 сентября"; across months the month is
 * abbreviated on both sides ("28 сен – 3 окт").
 */
export function formatDateRange(start: string, end: string): string {
  const from = parse(start);
  const to = parse(end);

  if (from && to) {
    if (from.month === to.month) {
      return `${from.day}–${to.day} ${MONTHS_GENITIVE[from.month]}`;
    }
    return `${from.day} ${MONTHS_SHORT[from.month]} – ${to.day} ${MONTHS_SHORT[to.month]}`;
  }
  if (from) return `с ${from.day} ${MONTHS_GENITIVE[from.month]}`;
  if (to) return `до ${to.day} ${MONTHS_GENITIVE[to.month]}`;
  return "";
}

/** Days between two dates, ignoring the time of day. */
function daysApart(a: Date, b: Date): number {
  const day = 24 * 60 * 60 * 1000;
  const startOf = (d: Date) =>
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((startOf(a) - startOf(b)) / day);
}

/** "сегодня" / "вчера" / "3 дня назад" / "12 сентября" for a posting time. */
export function formatPostedAt(iso: string, now = new Date()): string {
  const posted = new Date(iso);
  if (Number.isNaN(posted.getTime())) return "";

  const days = daysApart(now, posted);
  if (days <= 0) return "сегодня";
  if (days === 1) return "вчера";
  if (days < 7) return `${days} дн. назад`;
  return `${posted.getDate()} ${MONTHS_GENITIVE[posted.getMonth()]}`;
}

/**
 * Whether a listing's dates overlap the window a searcher asked for.
 * A listing without dates is flexible, so it matches any window.
 */
export function rangesOverlap(
  listingStart: string,
  listingEnd: string,
  fromFilter: string,
  toFilter: string,
): boolean {
  if (!fromFilter && !toFilter) return true;
  if (!listingStart && !listingEnd) return true;

  // Open ends: a listing with only a start runs indefinitely, and vice versa.
  const start = listingStart || "0000-01-01";
  const end = listingEnd || "9999-12-31";
  if (fromFilter && end < fromFilter) return false;
  if (toFilter && start > toFilter) return false;
  return true;
}
