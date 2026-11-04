// Checks for the pure report helpers. Run from the frontend folder:
//   node scripts/check-reports.mjs
// No database, no Next: the helpers are plain modules with relative imports.
import assert from "node:assert/strict";
import {
  buildHref,
  exportHref,
  parseReportFilters,
  rangeSlug,
} from "../src/lib/reports/filters.js";
import {
  average,
  bucketKey,
  bucketKeys,
  bucketLabel,
  fillSeries,
  histogram,
  median,
  rate,
  tally,
  topN,
} from "../src/lib/reports/buckets.js";
import {
  pageWindow,
  paginateArray,
  sortRows,
} from "../src/lib/reports/paginate.js";
import { cellText, toCsv, toXlsx } from "../src/lib/reports/export.js";
import { organizationKey } from "../src/lib/organizations.js";

// ---- filters ---------------------------------------------------------------
{
  const now = new Date("2026-10-28T10:00:00Z"); // 15:30 IST, 28 Oct
  const f = parseReportFilters({}, { now });
  assert.equal(f.range, "30d");
  assert.equal(f.from, "2026-09-29");
  assert.equal(f.to, "2026-10-28");
  assert.equal(f.page, 1);
  assert.equal(f.pageSize, 25);
  assert.equal(f.sort, null);
  assert.equal(f.grain, "day");
  assert.deepEqual(f.certs, []);
  assert.deepEqual(f.statuses, []);

  assert.equal(parseReportFilters({ pageSize: "7" }).pageSize, 25);
  assert.equal(parseReportFilters({ page: "0" }).page, 1);
  assert.deepEqual(
    parseReportFilters(
      { status: ["new", "x"] },
      { statuses: ["new", "approved"] },
    ).statuses,
    ["new"],
  );
  assert.deepEqual(parseReportFilters({ cert: "PAM 101,epm201" }).certs, [
    "PAM101",
    "EPM201",
  ]);

  const swapped = parseReportFilters(
    { range: "custom", from: "2026-10-20", to: "2026-10-01" },
    { now },
  );
  assert.equal(swapped.range, "custom");
  assert.equal(swapped.from, "2026-10-01");
  assert.equal(swapped.to, "2026-10-20");

  const implicit = parseReportFilters(
    { from: "2026-10-01", to: "2026-10-20" },
    { now },
  );
  assert.equal(implicit.range, "custom");
  assert.equal(implicit.fromUtc.toISOString(), "2026-09-30T18:30:00.000Z");
  assert.equal(implicit.toUtc.toISOString(), "2026-10-20T18:30:00.000Z");

  const all = parseReportFilters({ range: "all" }, { now });
  assert.equal(all.fromUtc, null);
  assert.equal(all.grain, "month");
  assert.equal(rangeSlug(all), "all-time");
  assert.equal(rangeSlug(f), "2026-09-29_2026-10-28");

  assert.equal(parseReportFilters({ range: "90d" }, { now }).grain, "week");
  assert.equal(
    parseReportFilters({ range: "90d", grain: "day" }, { now }).grain,
    "day",
  );

  assert.equal(
    buildHref(
      "/admin/reports/requests",
      parseReportFilters({ cert: "PAM101" }),
      {
        page: 2,
      },
    ),
    "/admin/reports/requests?cert=PAM101&page=2",
  );
  assert.equal(
    buildHref("/admin/reports/requests", parseReportFilters({})),
    "/admin/reports/requests",
  );

  const sorted = parseReportFilters(
    { page: "3", sort: "name", dir: "asc", pageSize: "50", cert: "PAM101" },
    { sorts: ["name"] },
  );
  const href = exportHref("requests", sorted, "csv");
  assert.ok(href.startsWith("/api/admin/reports/requests/export?"));
  assert.ok(href.includes("format=csv"));
  assert.ok(href.includes("cert=PAM101"));
  assert.ok(!href.includes("page="));
  assert.ok(!href.includes("sort="));
  assert.ok(!href.includes("dir="));
}

// ---- buckets ---------------------------------------------------------------
{
  assert.equal(bucketKey("2026-10-27T18:29:59Z", "day"), "2026-10-27");
  assert.equal(bucketKey("2026-10-27T18:30:00Z", "day"), "2026-10-28");
  assert.equal(
    bucketKey(new Date("2026-10-27T18:30:00Z"), "day"),
    "2026-10-28",
  );
  assert.equal(bucketKey("not a date", "day"), null);
  assert.equal(bucketKey(null, "day"), null);

  // 28 Oct 2026 is a Wednesday; its week starts on Monday 26 Oct.
  const week = bucketKey("2026-10-28T00:00:00Z", "week");
  assert.equal(week, "2026-10-26");
  assert.equal(new Date(`${week}T00:00:00Z`).getUTCDay(), 1);
  // Sunday 1 Nov belongs to the week of Monday 26 Oct.
  assert.equal(bucketKey("2026-11-01T06:00:00Z", "week"), "2026-10-26");
  assert.equal(bucketKey("2026-10-27T18:30:00Z", "month"), "2026-10-01");

  assert.deepEqual(bucketKeys("2026-10-26", "2026-10-28", "day"), [
    "2026-10-26",
    "2026-10-27",
    "2026-10-28",
  ]);
  assert.deepEqual(bucketKeys("2026-10-27", "2026-11-03", "week"), [
    "2026-10-26",
    "2026-11-02",
  ]);
  assert.deepEqual(bucketKeys("2026-09-15", "2026-11-02", "month"), [
    "2026-09-01",
    "2026-10-01",
    "2026-11-01",
  ]);
  assert.deepEqual(bucketKeys("2026-10-28", "2026-10-26", "day"), []);

  assert.equal(bucketLabel("2026-10-28", "day"), "28 Oct");
  assert.equal(bucketLabel("2026-10-26", "week"), "w/c 26 Oct");
  assert.equal(bucketLabel("2026-10-01", "month"), "Oct 2026");

  const rows = [
    { at: "2026-10-27T18:29:59Z", status: "approved" },
    { at: "2026-10-27T18:30:00Z", status: "new" },
    { at: "2026-10-28T05:00:00Z", status: "approved" },
    { at: null, status: "new" },
  ];
  const counts = tally(
    rows,
    (r) => bucketKey(r.at, "day"),
    (r) => r.status,
  );
  const series = fillSeries(
    bucketKeys("2026-10-26", "2026-10-28", "day"),
    "day",
    counts,
    ["approved", "new"],
  );
  assert.deepEqual(series, [
    { date: "2026-10-26", label: "26 Oct", approved: 0, new: 0 },
    { date: "2026-10-27", label: "27 Oct", approved: 1, new: 0 },
    { date: "2026-10-28", label: "28 Oct", approved: 1, new: 1 },
  ]);
  const simple = fillSeries(
    ["2026-10-26", "2026-10-27"],
    "day",
    new Map([["2026-10-27", 4]]),
  );
  assert.deepEqual(
    simple.map((p) => p.value),
    [0, 4],
  );

  assert.deepEqual(
    histogram(
      [0, 39, 40, 59, 60, 79, 80, 100, null],
      [
        { label: "0–39", min: 0, max: 39 },
        { label: "40–59", min: 40, max: 59 },
        { label: "60–79", min: 60, max: 79 },
        { label: "80–100", min: 80, max: 100 },
      ],
    ),
    [
      { name: "0–39", value: 2 },
      { name: "40–59", value: 2 },
      { name: "60–79", value: 2 },
      { name: "80–100", value: 2 },
    ],
  );

  assert.equal(rate(1, 0), null);
  assert.equal(rate(1, null), null);
  assert.equal(rate(1, 3), 33.3);
  assert.equal(rate(2, 4), 50);
  assert.equal(average([]), null);
  assert.equal(average([1, 2, 4]), 2.3);
  assert.equal(median([]), null);
  assert.equal(median([5, 1, 3]), 3);
  assert.equal(median([4, 1, 3, 2]), 2.5);

  assert.deepEqual(
    topN(
      [
        { name: "a", value: 1 },
        { name: "b", value: 5 },
        { name: "c", value: 3 },
        { name: "d", value: 2 },
      ],
      2,
    ),
    [
      { name: "b", value: 5 },
      { name: "c", value: 3 },
      { name: "Other", value: 3 },
    ],
  );
  assert.deepEqual(topN([{ name: "a", value: 1 }], 3), [
    { name: "a", value: 1 },
  ]);
}

// ---- organisations ---------------------------------------------------------
{
  assert.equal(organizationKey("Infosys Ltd."), "infosys");
  assert.equal(organizationKey(" INFOSYS, Limited "), "infosys");
  assert.equal(organizationKey("Tata Co-operative"), "tata co operative");
  assert.equal(organizationKey("Infosys Pvt Ltd"), "infosys");
  assert.equal(organizationKey("The Acme Company"), "acme");
  assert.equal(organizationKey("AT&T Inc"), "at and t");
  assert.equal(organizationKey(""), "unknown");
  assert.equal(organizationKey("Ltd"), "ltd");
}

// ---- paging ----------------------------------------------------------------
{
  const w = pageWindow({ page: 99, pageSize: 25, total: 60 });
  assert.equal(w.page, 3);
  assert.equal(w.totalPages, 3);
  assert.equal(w.skip, 50);
  assert.equal(w.start, 51);
  assert.equal(w.end, 60);

  const empty = pageWindow({ page: 1, pageSize: 25, total: 0 });
  assert.equal(empty.totalPages, 1);
  assert.equal(empty.start, 0);
  assert.equal(empty.end, 0);

  const w2 = pageWindow({ page: 2, pageSize: 25, total: 60 });
  assert.equal(w2.start, 26);
  assert.equal(w2.end, 50);
  assert.equal(pageWindow({ page: 1, pageSize: 7, total: 10 }).pageSize, 25);

  const all = Array.from({ length: 60 }, (_, i) => i + 1);
  const page2 = paginateArray(all, { page: 2, pageSize: 25 });
  assert.equal(page2.rows[0], 26);
  assert.equal(page2.rows.at(-1), 50);
  assert.equal(page2.total, 60);
  assert.equal(paginateArray(all, { page: 9, pageSize: 25 }).rows[0], 51);

  const rows = [
    { id: 1, name: "Zed", score: 10 },
    { id: 2, name: "alpha", score: null },
    { id: 3, name: "Beta", score: 30 },
    { id: 4, name: "beta", score: 30 },
  ];
  assert.deepEqual(
    sortRows(rows, "name", "asc").map((r) => r.id),
    [2, 4, 3, 1],
  );
  assert.deepEqual(
    sortRows(rows, "score", "desc").map((r) => r.id),
    [4, 3, 1, 2],
  );
  assert.deepEqual(
    sortRows(rows, "score", "asc").map((r) => r.id),
    [1, 4, 3, 2],
  );
  assert.deepEqual(
    sortRows(rows, null, "desc").map((r) => r.id),
    [4, 3, 2, 1],
  );
}

// ---- export ----------------------------------------------------------------
{
  const columns = [
    { key: "a", header: "A" },
    { key: "b", header: "B, with comma" },
    { key: "when", header: "When", kind: "datetime" },
  ];
  const rows = [
    { a: "a,b", b: 'say "hi"', when: "2026-10-27T18:30:00Z" },
    { a: "=SUM(1)", b: 5, when: null },
    { a: " padded", b: -5, when: new Date("2026-10-27T18:30:00Z") },
  ];
  const csv = toCsv(columns, rows);
  assert.ok(csv.startsWith("﻿"));
  assert.ok(csv.includes("\r\n"));
  assert.ok(!/[^\r]\n/.test(csv));
  const lines = csv.slice(1).split("\r\n");
  assert.equal(lines[0], 'A,"B, with comma",When');
  // The IST date carries a comma, so it is quoted like any other such field.
  assert.equal(lines[1], '"a,b","say ""hi""","28 Oct 2026, 12:00 am"');
  assert.equal(lines[2], "'=SUM(1),5,");
  assert.equal(lines[3], '" padded",-5,"28 Oct 2026, 12:00 am"');
  assert.equal(lines.at(-1), "");

  assert.equal(cellText(null), "");
  assert.equal(cellText(["PAM 101", "EPM 201"]), "PAM 101, EPM 201");
  assert.equal(cellText(true), "Yes");
  assert.equal(
    cellText("2026-10-28T00:00:00Z", { kind: "date" }),
    "28 Oct 2026",
  );

  const xlsx = await toXlsx(columns, rows, { sheetName: "Requests [test]" });
  assert.ok(Buffer.isBuffer(xlsx));
  assert.equal(xlsx.subarray(0, 2).toString("latin1"), "PK");
}

// Typed dates beat a stale preset select; untouched preset boxes keep the preset.
{
  const now = new Date("2026-10-28T06:00:00Z");
  const typed = parseReportFilters(
    { range: "30d", from: "2026-10-01", to: "2026-10-10" },
    { now },
  );
  assert.equal(typed.from, "2026-10-01");
  assert.equal(typed.to, "2026-10-10");
  const preset = parseReportFilters({ range: "7d", from: "", to: "" }, { now });
  assert.equal(preset.range, "7d");
  assert.equal(preset.from, "2026-10-22");
}
console.log("reports helpers ok");
