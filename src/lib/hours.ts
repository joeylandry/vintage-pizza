import type { Availability } from "./types";

export const STORE_TZ = "America/New_York";

/** Opening hours by weekday (0 = Sunday), in 24h store time. null = closed. */
export const HOURS: (readonly [open: number, close: number] | null)[] = [
  null, // Sunday
  [11, 20],
  [11, 20],
  [11, 20],
  [11, 20],
  [11, 21],
  [11, 21],
];

export const HOURS_DISPLAY = [
  { days: "Monday – Thursday", time: "11 AM – 8 PM" },
  { days: "Friday – Saturday", time: "11 AM – 9 PM" },
  { days: "Sunday", time: "Closed" },
];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Weekday and fractional hour in store time. */
export function storeClock(now: Date): { day: number; hour: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TZ,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, hour: Number(get("hour")) + Number(get("minute")) / 60 };
}

const fmtHour = (h: number) => `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? "AM" : "PM"}`;

export type StoreStatus = {
  open: boolean;
  /** Short badge text, e.g. "Open · until 8 PM". */
  label: string;
  /** Longer sentence for banners. */
  detail: string;
};

export function getStoreStatus(now: Date): StoreStatus {
  const { day, hour } = storeClock(now);
  const today = HOURS[day];
  if (today && hour >= today[0] && hour < today[1]) {
    return {
      open: true,
      label: `Open until ${fmtHour(today[1])}`,
      detail: `We're open today until ${fmtHour(today[1])}.`,
    };
  }
  let when: string;
  if (today && hour < today[0]) {
    when = `today at ${fmtHour(today[0])}`;
  } else {
    let d = (day + 1) % 7;
    while (!HOURS[d]) d = (d + 1) % 7;
    when = `${d === (day + 1) % 7 ? "tomorrow" : DAY_NAMES[d]} at ${fmtHour(HOURS[d]![0])}`;
  }
  return {
    open: false,
    label: `Closed · opens ${when}`,
    detail: `We're closed right now. Online ordering opens ${when}.`,
  };
}

export function isAvailableNow(availability: Availability | undefined, now: Date): boolean {
  if (!availability) return true;
  return availability.days.includes(storeClock(now).day);
}

/** Lets the site be demoed outside business hours (set NEXT_PUBLIC_FORCE_OPEN=1). */
export const FORCE_OPEN = process.env.NEXT_PUBLIC_FORCE_OPEN === "1";
