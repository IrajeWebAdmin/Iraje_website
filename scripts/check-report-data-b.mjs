// Runs the learners, organisations and overview reports against the dev
// database under plain Node and checks their shapes:
//   node --env-file=.env --import ./scripts/report-loader.mjs scripts/check-report-data-b.mjs
import assert from "node:assert/strict";
import { parseReportFilters } from "../src/lib/reports/filters.js";
import * as learners from "../src/lib/reports/learners.js";
import * as organisations from "../src/lib/reports/organisations.js";
import * as overview from "../src/lib/reports/overview.js";

// Mirrors filterOptions() in src/lib/reports/index.js.
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

function checkTiles(tiles, label) {
  assert.ok(Array.isArray(tiles) && tiles.length > 0, `${label}: tiles`);
  for (const t of tiles) {
    assert.ok(t.key && t.label, `${label}: tile key/label`);
    assert.ok("value" in t, `${label}: tile value`);
    assert.ok(FORMATS.has(t.format), `${label}: tile format ${t.format}`);
  }
  console.log(
    `  ${label} tiles:`,
    tiles
      .map(
        (t) =>
          `${t.label} = ${t.value ?? "—"}${t.format === "percent" && t.value != null ? "%" : ""}`,
      )
      .join(" | "),
  );
}

function checkSeries(series, label) {
  assert.ok(Array.isArray(series) && series.length > 0, `${label}: series`);
  for (const s of series) {
    assert.ok(
      s.key && s.title && s.grain && Array.isArray(s.fields),
      `${label}: series ${s.key}`,
    );
    assert.ok(["area", "bar"].includes(s.kind), `${label}: series kind`);
    assert.ok(s.data.length > 0, `${label}: series ${s.key} has points`);
    for (const p of s.data) {
      assert.ok(p.date && p.label, `${label}: point date/label`);
      for (const f of s.fields)
        assert.equal(typeof p[f.key], "number", `${label}: point ${f.key}`);
    }
  }
}

function checkDistributions(distributions, label) {
  assert.ok(
    Array.isArray(distributions) && distributions.length > 0,
    `${label}: distributions`,
  );
  for (const d of distributions) {
    assert.ok(
      d.key && d.title && Array.isArray(d.data),
      `${label}: distribution ${d.key}`,
    );
    for (const row of d.data) {
      assert.equal(typeof row.name, "string", `${label}: distribution name`);
      assert.equal(typeof row.value, "number", `${label}: distribution value`);
    }
  }
}

function checkTable(table, label) {
  const w = table.window;
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
    assert.equal(typeof w[k], "number", `${label}: window.${k}`);
  assert.ok(Array.isArray(table.rows), `${label}: rows`);
  assert.ok(table.rows.length <= w.pageSize, `${label}: page size respected`);
  const ids = new Set(table.rows.map((r) => r.id));
  assert.equal(ids.size, table.rows.length, `${label}: unique row ids`);
  for (const r of table.rows)
    assert.ok(r.id !== undefined && r.id !== null, `${label}: row id`);
}

function checkReport(result, label) {
  checkTiles(result.tiles, label);
  checkSeries(result.series, label);
  checkDistributions(result.distributions, label);
  checkTable(result.table, label);
  assert.ok(
    Array.isArray(result.options?.certifications),
    `${label}: options.certifications`,
  );
}

const all = { range: "all" };

console.log("learners");
const lf = parseReportFilters(all, filterOptions(learners.definition));
const lr = await learners.report(lf);
checkReport(lr, "learners");
const lrows = await learners.rows(lf);
assert.equal(lrows.length, lr.table.window.total, "learners: rows === total");
assert.equal(
  new Set(lrows.map((r) => r.id)).size,
  lrows.length,
  "learners: unique export ids",
);
for (const col of learners.definition.columns)
  if (col.sortable)
    assert.ok(
      col.key in learners.definition.sorts,
      `learners: sortable ${col.key}`,
    );
// Sorting by each key and paging must not throw.
for (const sort of Object.keys(learners.definition.sorts)) {
  const f = parseReportFilters(
    { range: "all", sort, dir: "asc", pageSize: "25" },
    filterOptions(learners.definition),
  );
  const r = await learners.report(f);
  checkTable(r.table, `learners sort ${sort}`);
}
// Every groupBy produces the matching first distribution.
for (const g of learners.definition.groupBys) {
  const f = parseReportFilters(
    { range: "all", by: g.value },
    filterOptions(learners.definition),
  );
  const r = await learners.report(f);
  assert.equal(r.distributions[0].key, g.value, `learners: groupBy ${g.value}`);
}
// A 30-day window and a custom one still produce a full axis.
const l30 = await learners.report(
  parseReportFilters({}, filterOptions(learners.definition)),
);
assert.equal(l30.series[0].data.length, 30, "learners: 30-day axis");

console.log("organisations");
const of = parseReportFilters(all, filterOptions(organisations.definition));
const orep = await organisations.report(of);
checkReport(orep, "organisations");
const orows = await organisations.rows(of);
assert.equal(
  orows.length,
  orep.table.window.total,
  "organisations: rows === total",
);
for (const col of organisations.definition.columns)
  if (col.sortable)
    assert.ok(
      col.key in organisations.definition.sorts,
      `organisations: sortable ${col.key}`,
    );
for (const g of organisations.definition.groupBys) {
  const f = parseReportFilters(
    { range: "all", by: g.value },
    filterOptions(organisations.definition),
  );
  const r = await organisations.report(f);
  assert.equal(
    r.distributions[0].key,
    g.value,
    `organisations: groupBy ${g.value}`,
  );
}
for (const sort of Object.keys(organisations.definition.sorts)) {
  const f = parseReportFilters(
    { range: "all", sort, dir: "asc" },
    filterOptions(organisations.definition),
  );
  checkTable(
    (await organisations.report(f)).table,
    `organisations sort ${sort}`,
  );
}
console.log(
  "  top organisations:",
  orows
    .slice(0, 5)
    .map((o) => `${o.name} (${o.people} people, ${o.requests} requests)`)
    .join(" | "),
);

console.log("organisation detail");
const df = parseReportFilters(
  all,
  filterOptions(organisations.detailDefinition),
);
const firstKey = orows[0]?.key;
assert.ok(firstKey, "organisations: at least one organisation in the dev data");
const det = await organisations.detail(firstKey, df);
assert.ok(det, "detail: found");
assert.ok(
  det.organisation.key === firstKey && det.organisation.name,
  "detail: organisation",
);
assert.ok(
  Array.isArray(det.organisation.spellings) &&
    Array.isArray(det.organisation.countries),
  "detail: meta",
);
checkReport(det, "detail");
const drows = await organisations.detailRows(firstKey, df);
assert.equal(drows.length, det.table.window.total, "detail: rows === total");
for (const r of drows)
  assert.ok(/^.+\|.+$/.test(r.id), "detail: row id email|code");
for (const col of organisations.detailDefinition.columns)
  if (col.sortable)
    assert.ok(
      col.key in organisations.detailDefinition.sorts,
      `detail: sortable ${col.key}`,
    );
assert.equal(
  await organisations.detail("no-such-organisation-xyz", df),
  null,
  "detail: unknown key is null",
);
assert.deepEqual(
  await organisations.detailRows("no-such-organisation-xyz", df),
  [],
  "detail: unknown key rows",
);
console.log(
  `  ${det.organisation.name}: ${drows.length} person×certification rows`,
);

console.log("overview");
const ov = await overview.report(parseReportFilters(all));
checkTiles(ov.tiles, "overview");
assert.equal(ov.tiles.length, 8, "overview: eight tiles");
for (const t of ov.tiles)
  assert.ok(
    t.href?.startsWith("/admin/reports/"),
    `overview: tile href ${t.key}`,
  );
checkSeries(ov.series, "overview");
const ov30 = await overview.report(parseReportFilters({}));
assert.equal(ov30.series[0].data.length, 30, "overview: 30-day axis");

console.log("report data B ok");
