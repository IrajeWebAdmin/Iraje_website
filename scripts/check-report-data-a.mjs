// Runs the requests, certificates and exams reports against the dev database
// and checks their shapes, so the numbers can be verified without a browser:
//   node --env-file=.env --import ./scripts/report-loader.mjs scripts/check-report-data-a.mjs
import assert from "node:assert/strict";
import { parseReportFilters } from "../src/lib/reports/filters.js";
import { EXPORT_ROW_CAP } from "../src/lib/reports/export.js";
import * as requests from "../src/lib/reports/requests.js";
import * as certificates from "../src/lib/reports/certificates.js";
import * as exams from "../src/lib/reports/exams.js";

// Same as filterOptions() in src/lib/reports/index.js, copied so this script
// does not depend on every family module existing yet.
function filterOptions(definition) {
  return {
    statuses: definition.statuses.map((s) => s.value),
    sorts: Object.keys(definition.sorts),
    defaultSort: definition.defaultSort,
    defaultDir: definition.defaultDir ?? "desc",
    groupBys: definition.groupBys.map((g) => g.value),
    defaultGroupBy: definition.defaultGroupBy,
  };
}

const FORMATS = new Set([
  "number",
  "percent",
  "minutes",
  "hours",
  "days",
  "text",
]);
const KINDS = new Set([
  "text",
  "number",
  "percent",
  "date",
  "datetime",
  "status",
  "list",
  "progress",
  "link",
  "enrollmentLink",
  "orgLink",
  "multiline",
]);

function checkShape(name, out, def) {
  assert.ok(Array.isArray(out.tiles) && out.tiles.length > 0, `${name}: tiles`);
  for (const t of out.tiles) {
    assert.ok(t.key && t.label, `${name}: tile key/label`);
    assert.ok("value" in t, `${name}: tile value`);
    assert.ok(FORMATS.has(t.format), `${name}: tile format ${t.format}`);
  }
  assert.ok(
    Array.isArray(out.series) && out.series.length > 0,
    `${name}: series`,
  );
  for (const s of out.series) {
    assert.ok(
      s.key && s.title && s.grain && Array.isArray(s.fields),
      `${name}: series ${s.key}`,
    );
    assert.ok(["area", "bar"].includes(s.kind), `${name}: series kind`);
    for (const p of s.data) {
      assert.ok(p.date && p.label, `${name}: series point date/label`);
      for (const f of s.fields)
        assert.equal(
          typeof p[f.key],
          "number",
          `${name}: ${s.key}.${f.key} numeric`,
        );
    }
  }
  assert.ok(
    Array.isArray(out.distributions) && out.distributions.length > 0,
    `${name}: distributions`,
  );
  for (const d of out.distributions) {
    assert.ok(
      d.key && d.title && Array.isArray(d.data),
      `${name}: distribution ${d.key}`,
    );
    for (const e of d.data) {
      assert.ok(typeof e.name === "string", `${name}: ${d.key} name`);
      assert.equal(typeof e.value, "number", `${name}: ${d.key} value`);
    }
  }
  const w = out.table.window;
  for (const k of [
    "page",
    "pageSize",
    "total",
    "totalPages",
    "skip",
    "take",
    "start",
    "end",
  ])
    assert.equal(typeof w[k], "number", `${name}: window.${k}`);
  assert.ok(Array.isArray(out.table.rows), `${name}: rows`);
  assert.ok(
    out.table.rows.length <= w.pageSize,
    `${name}: page size respected`,
  );
  for (const r of out.table.rows) assert.ok("id" in r, `${name}: row id`);
  for (const c of def.columns) {
    assert.ok(KINDS.has(c.kind), `${name}: column kind ${c.kind}`);
    if (c.sortable)
      assert.ok(
        c.key in def.sorts,
        `${name}: sortable column ${c.key} in sorts`,
      );
    if (out.table.rows[0])
      assert.ok(c.key in out.table.rows[0], `${name}: column ${c.key} on row`);
  }
  for (const c of def.exportColumns)
    if (out.table.rows[0])
      assert.ok(
        c.key in out.table.rows[0],
        `${name}: export column ${c.key} on row`,
      );
  assert.ok(Array.isArray(out.options.certifications), `${name}: options`);
}

async function run(mod, extra = {}, label = "") {
  const def = mod.definition;
  const name = `${def.slug}${label ? ` (${label})` : ""}`;
  const filters = parseReportFilters(
    { range: "all", ...extra },
    filterOptions(def),
  );
  const out = await mod.report(filters);
  checkShape(name, out, def);
  const all = await mod.rows(filters);
  if (out.table.window.total <= EXPORT_ROW_CAP)
    assert.equal(
      all.length,
      out.table.window.total,
      `${name}: rows() length equals total`,
    );
  // The first distribution is the one the group-by chose.
  if (filters.groupBy)
    assert.equal(
      out.distributions[0].key,
      filters.groupBy,
      `${name}: group-by first`,
    );
  console.log(
    `\n${name}: total ${out.table.window.total}, page ${out.table.window.page}/${out.table.window.totalPages}, grain ${filters.grain}`,
  );
  for (const t of out.tiles)
    console.log(
      `  ${t.label}: ${t.value ?? "—"} (${t.format})${t.hint ? ` · ${t.hint}` : ""}`,
    );
  for (const d of out.distributions)
    console.log(
      `  ${d.title}: ${d.data.map((e) => `${e.name} ${e.value}`).join(", ") || "(none)"}`,
    );
  for (const s of out.series)
    console.log(`  series ${s.key}: ${s.data.length} points`);
  return out;
}

await run(requests);
await run(
  requests,
  { range: "30d", status: "approved", by: "country", sort: "name", dir: "asc" },
  "30d approved by country",
);
await run(requests, { by: "organization", page: "99" }, "org, page 99");
await run(certificates);
await run(
  certificates,
  { status: "expired,revoked", by: "status" },
  "expired/revoked",
);
await run(certificates, { by: "organization", q: "a" }, "org, q=a");
await run(exams);
await run(
  exams,
  { status: "passed", by: "examSet", sort: "percentage", dir: "asc" },
  "passed by set",
);
await run(
  exams,
  { by: "organization", range: "90d", grain: "week" },
  "org weekly",
);

// Paging past the end clamps to the last page.
const clamped = await requests.report(
  parseReportFilters(
    { range: "all", page: "99" },
    filterOptions(requests.definition),
  ),
);
assert.equal(
  clamped.table.window.page,
  clamped.table.window.totalPages,
  "page clamped",
);
assert.ok(
  clamped.table.rows.length > 0 || clamped.table.window.total === 0,
  "clamped page has rows",
);

console.log("\nreport data A ok");
