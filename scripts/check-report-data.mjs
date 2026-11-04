// Runs every registered report and the overview against the dev database
// under plain Node, so the numbers can be checked without a signed-in browser:
//   node --env-file=.env --import ./scripts/report-loader.mjs scripts/check-report-data.mjs
// (scripts/check-report-data-a.mjs and -b.mjs hold the detailed assertions.)
import assert from "node:assert/strict";
import {
  REPORTS,
  REPORT_SLUGS,
  filterOptions,
} from "../src/lib/reports/index.js";
import * as overview from "../src/lib/reports/overview.js";
import { parseReportFilters } from "../src/lib/reports/filters.js";
import { getReportCatalog } from "../src/lib/reports/catalog.js";

const catalog = await getReportCatalog();
console.log(
  "catalog:",
  catalog.certifications
    .map((c) => `${c.code} (${c.modules.length} modules)`)
    .join(", "),
);

for (const slug of REPORT_SLUGS) {
  const family = REPORTS[slug];
  const filters = parseReportFilters(
    { range: "all" },
    filterOptions(family.definition),
  );
  const data = await family.report(filters);
  assert.ok(
    Array.isArray(data.tiles) && data.tiles.length > 0,
    `${slug}: tiles`,
  );
  const keyTiles = data.tiles.filter((t) => !t.secondary).length;
  assert.ok(
    keyTiles >= 4 && keyTiles <= 5,
    `${slug}: 4-5 key tiles (got ${keyTiles})`,
  );
  assert.ok(Array.isArray(data.series), `${slug}: series`);
  assert.ok(Array.isArray(data.distributions), `${slug}: distributions`);
  assert.ok(
    data.table?.window && Array.isArray(data.table.rows),
    `${slug}: table`,
  );
  for (const col of family.definition.columns) {
    if (col.sortable)
      assert.ok(
        col.key in family.definition.sorts,
        `${slug}: sort key ${col.key}`,
      );
  }
  const rows = await family.rows(filters);
  assert.equal(
    rows.length,
    data.table.window.total,
    `${slug}: export rows = total`,
  );
  const tiles = data.tiles
    .map((t) => `${t.label} ${t.value ?? "—"}`)
    .join(" | ");
  console.log(`${slug}: ${data.table.window.total} rows | ${tiles}`);
}

const ov = await overview.report(parseReportFilters({ range: "all" }));
assert.equal(ov.tiles.length, 10, "overview: 10 tiles");
assert.equal(ov.cards.length, 5, "overview: 5 cards");
assert.ok(
  ov.cards.every((c) => c.href && c.tiles.length > 0 && c.tiles.every(Boolean)),
  "overview: cards carry tiles and a link",
);
assert.ok(
  ov.tiles.every((t) => t.href),
  "overview: tiles link somewhere",
);
console.log(
  "overview:",
  ov.tiles.map((t) => `${t.label} ${t.value ?? "—"}`).join(" | "),
);
console.log("report data ok");
