// Paging maths shared by every report table. Pure: relative imports only.
// Database-backed reports use pageWindow() for skip/take and the footer text;
// the organisations report, which is aggregated in memory, uses
// paginateArray() and sortRows() on the finished rows.
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from "./filters.js";

/**
 * Where page `page` of `total` rows sits: a page past the end is clamped to
 * the last one, and start/end are the 1-based row numbers for
 * "Showing 26–50 of 312" (0–0 when there is nothing).
 */
export function pageWindow({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  total = 0,
} = {}) {
  const size = PAGE_SIZES.includes(pageSize) ? pageSize : DEFAULT_PAGE_SIZE;
  const count = Math.max(0, Number(total) || 0);
  const totalPages = Math.max(1, Math.ceil(count / size));
  const wanted = Number.parseInt(page, 10);
  const p = Math.min(
    Math.max(1, Number.isInteger(wanted) ? wanted : 1),
    totalPages,
  );
  const skip = (p - 1) * size;
  return {
    page: p,
    pageSize: size,
    total: count,
    totalPages,
    skip,
    take: size,
    start: count === 0 ? 0 : skip + 1,
    end: count === 0 ? 0 : Math.min(skip + size, count),
  };
}

/** The slice of `rows` for the page, plus the window it came from. */
export function paginateArray(rows, { page, pageSize } = {}) {
  const window = pageWindow({ page, pageSize, total: rows.length });
  return {
    rows: rows.slice(window.skip, window.skip + window.take),
    ...window,
  };
}

/** Empty values sort last whichever way the column is sorted. */
const isEmpty = (v) => v === null || v === undefined || v === "";

function compareValues(a, b) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (a instanceof Date || b instanceof Date) return new Date(a) - new Date(b);
  return String(a).localeCompare(String(b), "en", {
    sensitivity: "base",
    numeric: true,
  });
}

/**
 * A sorted copy of in-memory rows by `key`: numbers numerically, strings
 * alphabetically, empties last. Ties fall back to `tieBreak` descending
 * (ids, newest first) so paging never shows a row twice.
 */
export function sortRows(rows, key, dir = "desc", { tieBreak = "id" } = {}) {
  const sign = dir === "asc" ? 1 : -1;
  return [...rows].sort((x, y) => {
    if (key) {
      const a = x[key];
      const b = y[key];
      const ae = isEmpty(a);
      const be = isEmpty(b);
      if (ae !== be) return ae ? 1 : -1;
      if (!ae) {
        const c = compareValues(a, b) * sign;
        if (c) return c;
      }
    }
    if (tieBreak && !isEmpty(x[tieBreak]) && !isEmpty(y[tieBreak]))
      return -compareValues(x[tieBreak], y[tieBreak]);
    return 0;
  });
}
