// The x-axis of a trend chart: every bucket in the chosen period. For "all
// time" the period has no bounds, so the axis runs from the earliest date in
// the data to today (or the last 30 days when there is no data at all).
// Pure: relative imports only.
import { addDays, istDay } from "./filters.js";
import { bucketKeys } from "./buckets.js";

export function periodKeys(filters, dates = [], now = new Date()) {
  const today = istDay(now);
  if (filters.from && filters.to)
    return bucketKeys(filters.from, filters.to, filters.grain);
  const days = dates
    .filter(Boolean)
    .map((d) => istDay(new Date(d)))
    .filter((d) => d <= today);
  const first = days.length
    ? days.reduce((a, b) => (a < b ? a : b))
    : addDays(today, -29);
  return bucketKeys(first, today, filters.grain);
}
