// Grouping by Indian calendar day, week or month for the trend charts, plus
// the small maths every report shares (rates, averages, histograms). Pure:
// relative imports only, so scripts/check-reports.mjs can load it in Node.
//
// All grouping happens here on the server from a date-bounded select; the
// browser only draws what comes out. MySQL date grouping is avoided on
// purpose: CONVERT_TZ needs timezone tables and the TIMESTAMP columns depend
// on the session zone, so bucketing in code keeps IST logic in one place.
import { addDays, istDay, istDayStart } from "./filters.js";

const MAX_KEYS = 5000;

const toDate = (value) => (value instanceof Date ? value : new Date(value));

/** The Monday on or before `day` ("YYYY-MM-DD", Indian calendar). */
export function weekStart(day) {
  const dow = new Date(`${day}T00:00:00Z`).getUTCDay(); // 0 = Sunday
  return addDays(day, -((dow + 6) % 7));
}

/** The bucket a calendar day falls in. */
export function keyForDay(day, grain = "day") {
  if (grain === "week") return weekStart(day);
  if (grain === "month") return `${day.slice(0, 7)}-01`;
  return day;
}

/**
 * The bucket an instant falls in, by Indian time: the IST day for "day",
 * the IST Monday of that week for "week", "YYYY-MM-01" for "month".
 * Accepts a Date or an ISO string; null for anything unparseable.
 */
export function bucketKey(dateLike, grain = "day") {
  if (dateLike == null) return null;
  const d = toDate(dateLike);
  if (Number.isNaN(d.getTime())) return null;
  return keyForDay(istDay(d), grain);
}

/** The bucket after `key`. */
function nextKey(key, grain) {
  if (grain === "week") return addDays(key, 7);
  if (grain === "month") {
    const [y, m] = key.split("-").map(Number);
    return new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
  }
  return addDays(key, 1);
}

/**
 * Every bucket key from `fromDay` to `toDay` inclusive, in order, so a trend
 * shows a zero for quiet days instead of skipping them. For "all time" the
 * caller passes the earliest data day and today.
 */
export function bucketKeys(fromDay, toDay, grain = "day") {
  const keys = [];
  if (!fromDay || !toDay || toDay < fromDay) return keys;
  let key = keyForDay(fromDay, grain);
  while (key <= toDay && keys.length < MAX_KEYS) {
    keys.push(key);
    key = nextKey(key, grain);
  }
  return keys;
}

/** "28 Oct" for a day, "w/c 27 Oct" for a week, "Oct 2026" for a month. */
export function bucketLabel(key, grain = "day") {
  const date = istDayStart(key);
  const opts =
    grain === "month"
      ? { month: "short", year: "numeric" }
      : { day: "numeric", month: "short" };
  const text = date.toLocaleDateString("en-IN", {
    ...opts,
    timeZone: "Asia/Kolkata",
  });
  return grain === "week" ? `w/c ${text}` : text;
}

/**
 * Build the Map that fillSeries() reads: for each row, keyOf(row) names the
 * bucket (null skips the row) and fieldOf(row) names the field to add one to
 * ("value" when fieldOf is omitted; null skips).
 */
export function tally(rows, keyOf, fieldOf) {
  const counts = new Map();
  for (const row of rows) {
    const key = keyOf(row);
    if (key == null) continue;
    const field = fieldOf ? fieldOf(row) : "value";
    if (field == null) continue;
    const bucket = counts.get(key) ?? {};
    bucket[field] = (bucket[field] ?? 0) + 1;
    counts.set(key, bucket);
  }
  return counts;
}

/**
 * One point per key, every field zero-filled, ready for the chart:
 * [{ date: "2026-10-28", label: "28 Oct", value: 3, ... }]. countsByKey maps a
 * key to an object of fields, or to a number when fields is just ["value"].
 */
export function fillSeries(keys, grain, countsByKey, fields = ["value"]) {
  return keys.map((key) => {
    const got = countsByKey?.get(key);
    const point = { date: key, label: bucketLabel(key, grain) };
    for (const field of fields) {
      const n =
        typeof got === "number"
          ? field === fields[0]
            ? got
            : 0
          : Number(got?.[field] ?? 0);
      point[field] = Number.isFinite(n) ? n : 0;
    }
    return point;
  });
}

/** Count values into bands: [{ label, min, max }] (both ends inclusive). */
export function histogram(values, bands) {
  return bands.map((band) => ({
    name: band.label,
    value: values.filter(
      (v) => v != null && Number.isFinite(v) && v >= band.min && v <= band.max,
    ).length,
  }));
}

/** 1 of 3 -> 33.3 (one decimal). null when there is nothing to divide by. */
export function rate(numerator, denominator) {
  if (!denominator) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}

const finite = (nums) => nums.filter((n) => Number.isFinite(n));

/** Mean to one decimal, or null when empty. */
export function average(nums) {
  const xs = finite(nums);
  if (!xs.length) return null;
  return Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10;
}

/** Middle value, or null when empty. */
export function median(nums) {
  const xs = finite(nums).sort((a, b) => a - b);
  if (!xs.length) return null;
  const mid = Math.floor(xs.length / 2);
  return xs.length % 2 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2;
}

/**
 * Keep the n largest [{ name, value }] rows and fold the rest into one
 * "Other" row, so a breakdown chart stays readable.
 */
export function topN(entries, n, otherLabel = "Other") {
  const sorted = [...entries].sort((a, b) => b.value - a.value);
  if (sorted.length <= n) return sorted;
  const kept = sorted.slice(0, n);
  const other = sorted.slice(n).reduce((sum, e) => sum + e.value, 0);
  return other > 0 ? [...kept, { name: otherLabel, value: other }] : kept;
}
