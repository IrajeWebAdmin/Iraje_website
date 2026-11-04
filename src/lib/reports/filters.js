// The filters every report page and the export route share, parsed from the
// page address so a filtered view can be bookmarked or pasted to a colleague.
// Pure: no React, no Prisma, relative imports only, so the Node check script
// (scripts/check-reports.mjs) can load it.
//
// Address parameters:
//   range=7d|30d|90d|12m|all   or   from=YYYY-MM-DD&to=YYYY-MM-DD (custom)
//   grain=day|week|month       (trend buckets; "auto" picks by span)
//   cert=PAM101,EPM201         (repeat the key or comma-separate: multi-select)
//   status=new,approved        (whitelisted per report, multi-select)
//   org=infosys                (organisation search, matched on the cleaned key)
//   country=India  q=text      (free-text search, per report)
//   by=certification           (which breakdown the distribution chart shows)
//   page=2  pageSize=25|50|100  sort=<key>  dir=asc|desc
import { normalizeCertCode } from "../certCodes.js";

export const RANGES = ["7d", "30d", "90d", "12m", "all", "custom"];
export const DEFAULT_RANGE = "30d";
export const RANGE_LABELS = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
  "12m": "12 months",
  all: "All time",
  custom: "Custom",
};
export const GRAINS = ["auto", "day", "week", "month"];
export const PAGE_SIZES = [25, 50, 100];
export const DEFAULT_PAGE_SIZE = 25;
export const MAX_Q = 80;
export const MAX_ORG = 100;

// India has no daylight saving, so IST is a fixed offset.
const IST_OFFSET_MS = 330 * 60 * 1000;
const DAY_MS = 86_400_000;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** "YYYY-MM-DD" of the instant `now` in Indian time. */
export function istDay(now = new Date()) {
  return new Date(now.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** The UTC instant at which the Indian calendar day `day` begins. */
export function istDayStart(day) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) - IST_OFFSET_MS);
}

/** "2026-10-28" + 3 -> "2026-10-31"; negative steps go back. */
export function addDays(day, n) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** The string if it is a real calendar day, else null. */
export function validDay(value) {
  const s = typeof value === "string" ? value.trim() : "";
  if (!DAY_RE.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
    ? s
    : null;
}

/**
 * The period as inclusive Indian days plus the UTC instants that bound it,
 * [fromUtc, toUtc). "all" gives nulls. A custom period with neither date
 * falls back to the default; with one date the other end is today.
 */
export function rangeBounds(range, from, to, now = new Date()) {
  const today = istDay(now);
  let r = range;
  let f = null;
  let t = null;

  if (r === "custom") {
    f = validDay(from);
    t = validDay(to);
    if (!f && !t) r = DEFAULT_RANGE;
    else {
      f = f ?? t;
      t = t ?? today;
      if (t < f) [f, t] = [t, f];
    }
  }
  if (r !== "custom") {
    if (r === "7d") [f, t] = [addDays(today, -6), today];
    else if (r === "30d") [f, t] = [addDays(today, -29), today];
    else if (r === "90d") [f, t] = [addDays(today, -89), today];
    else if (r === "12m") {
      const [y, m] = today.split("-").map(Number);
      f = new Date(Date.UTC(y, m - 12, 1)).toISOString().slice(0, 10);
      t = today;
    } else {
      r = "all";
    }
  }
  return {
    range: r,
    from: f,
    to: t,
    fromUtc: f ? istDayStart(f) : null,
    toUtc: t ? istDayStart(addDays(t, 1)) : null,
  };
}

/** Day for a month or less, week up to six months, month beyond or for "all". */
export function resolveGrain(grainParam, bounds) {
  if (grainParam && grainParam !== "auto" && GRAINS.includes(grainParam))
    return grainParam;
  if (!bounds.fromUtc || !bounds.toUtc) return "month";
  const days = Math.round((bounds.toUtc - bounds.fromUtc) / DAY_MS);
  return days <= 31 ? "day" : days <= 182 ? "week" : "month";
}

const first = (v) => (Array.isArray(v) ? v[0] : v);
const text = (v, max) =>
  String(first(v) ?? "")
    .trim()
    .slice(0, max);
const list = (v) =>
  (Array.isArray(v) ? v : v == null ? [] : [v])
    .flatMap((s) => String(s).split(","))
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Parse page searchParams (values string | string[]) or
 * Object.fromEntries(url.searchParams). Unknown or invalid values fall back
 * to defaults; nothing here ever throws. `options` carries the per-report
 * whitelists: statuses, sorts (+ defaultSort, defaultDir), groupBys
 * (+ defaultGroupBy). `now` is injectable for tests.
 */
export function parseReportFilters(raw = {}, options = {}) {
  const {
    statuses = [],
    sorts = [],
    defaultSort = null,
    defaultDir = "desc",
    groupBys = [],
    defaultGroupBy = null,
    now = new Date(),
  } = options;

  const rangeIn = String(first(raw.range) ?? "");
  const fromIn = validDay(text(raw.from, 10));
  const toIn = validDay(text(raw.to, 10));
  const range = RANGES.includes(rangeIn)
    ? rangeIn
    : fromIn || toIn
      ? "custom"
      : DEFAULT_RANGE;
  let bounds = rangeBounds(range, fromIn, toIn, now);
  // The filter form submits the preset select and the date boxes together.
  // Typed dates that differ from the preset's own days win, so an admin who
  // fills the boxes but leaves "30 days" selected still gets their dates.
  if (range !== "custom" && (fromIn || toIn)) {
    const typed = rangeBounds("custom", fromIn, toIn, now);
    if (typed.from !== bounds.from || typed.to !== bounds.to) bounds = typed;
  }

  const grainIn = first(raw.grain);
  const grainParam = GRAINS.includes(grainIn) ? grainIn : "auto";

  const sortIn = first(raw.sort);
  const dirIn = first(raw.dir);
  const byIn = first(raw.by);
  const pageIn = Number.parseInt(first(raw.page), 10);
  const sizeIn = Number.parseInt(first(raw.pageSize), 10);

  return {
    ...bounds,
    grain: resolveGrain(grainParam, bounds),
    grainParam,
    certs: [...new Set(list(raw.cert).map(normalizeCertCode).filter(Boolean))],
    statuses: [
      ...new Set(list(raw.status).filter((s) => statuses.includes(s))),
    ],
    org: text(raw.org, MAX_ORG).toLowerCase(),
    country: text(raw.country, 100),
    q: text(raw.q, MAX_Q),
    groupBy: groupBys.includes(byIn) ? byIn : defaultGroupBy,
    page: Number.isInteger(pageIn) && pageIn >= 1 ? pageIn : 1,
    pageSize: PAGE_SIZES.includes(sizeIn) ? sizeIn : DEFAULT_PAGE_SIZE,
    sort: sorts.includes(sortIn) ? sortIn : defaultSort,
    dir: dirIn === "asc" || dirIn === "desc" ? dirIn : defaultDir,
    defaults: { sort: defaultSort, dir: defaultDir, groupBy: defaultGroupBy },
  };
}

/**
 * The address parameters for `filters` with `patch` applied, leaving out
 * defaults and empties so addresses stay short. A patch with from/to and no
 * range means a custom period; a patch with a preset range drops from/to.
 */
export function toQuery(filters, patch = {}) {
  const f = { ...filters, ...patch };
  if (("from" in patch || "to" in patch) && !("range" in patch))
    f.range = "custom";
  const params = new URLSearchParams();
  const put = (key, value) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(","));
      return;
    }
    params.set(key, String(value));
  };

  if (f.range === "custom") {
    put("from", f.from);
    put("to", f.to);
  } else if (f.range && f.range !== DEFAULT_RANGE) put("range", f.range);
  if (f.grainParam && f.grainParam !== "auto") put("grain", f.grainParam);
  put("cert", f.certs);
  put("status", f.statuses);
  put("org", f.org);
  put("country", f.country);
  put("q", f.q);
  if (f.groupBy && f.groupBy !== f.defaults?.groupBy) put("by", f.groupBy);
  if (f.sort && f.sort !== f.defaults?.sort) put("sort", f.sort);
  if (f.dir && f.dir !== (f.defaults?.dir ?? "desc")) put("dir", f.dir);
  if (f.page && f.page !== 1) put("page", f.page);
  if (f.pageSize && f.pageSize !== DEFAULT_PAGE_SIZE)
    put("pageSize", f.pageSize);
  return params;
}

/** "/admin/reports/requests?cert=PAM101&page=2" — same filters, patched. */
export function buildHref(pathname, filters, patch = {}) {
  const qs = toQuery(filters, patch).toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

/** The download address: same filters, no paging or sorting, plus `extra`. */
export function exportHref(report, filters, format, extra = {}) {
  const params = toQuery(filters, {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    sort: filters.defaults?.sort ?? null,
    dir: filters.defaults?.dir ?? "desc",
  });
  params.set("format", format);
  for (const [k, v] of Object.entries(extra)) if (v) params.set(k, String(v));
  return `/api/admin/reports/${report}/export?${params.toString()}`;
}

/** "2026-10-01_2026-10-28" or "all-time", for file names. */
export function rangeSlug(filters) {
  return filters.from && filters.to
    ? `${filters.from}_${filters.to}`
    : "all-time";
}

/** "1 Oct 2026 – 28 Oct 2026", "All time". */
export function describeRange(filters) {
  if (!filters.from || !filters.to) return "All time";
  const fmt = (day) =>
    istDayStart(day).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  return `${fmt(filters.from)} – ${fmt(filters.to)}`;
}
