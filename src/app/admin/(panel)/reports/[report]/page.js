import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import { REPORTS, filterOptions } from "@/lib/reports";
import { buildHref, parseReportFilters } from "@/lib/reports/filters";
import { COUNTRY_OPTIONS } from "@/lib/reports/common";
import {
  formatNumber,
  formatTiles,
  hasActiveFilters,
} from "@/lib/reports/format";
import ReportTabs, { REPORT_TABS } from "@/components/Admin/ReportTabs";
import FilterBar from "@/components/Admin/FilterBar";
import StatTiles from "@/components/Admin/StatTiles";
import DataTable from "@/components/Admin/DataTable";
import Pagination from "@/components/Admin/Pagination";
import ExportMenu from "@/components/Admin/ExportMenu";
import EmptyState from "@/components/Admin/EmptyState";
import SearchBox from "@/components/Admin/SearchBox";
import ReportCharts from "../_lib/ReportCharts";

export async function generateMetadata({ params }) {
  const { report } = await params;
  const title = REPORTS[report]?.definition.title ?? "Reports";
  return { title: `${title} · Iraje Admin` };
}

/** "Sorted by submission date, newest first", from the active sort column. */
function describeSort(columns, filters) {
  const column = columns.find((c) => c.key === filters.sort);
  if (!column) return null;
  const byDate = column.kind === "date" || column.kind === "datetime";
  const direction = byDate
    ? filters.dir === "asc"
      ? "oldest first"
      : "newest first"
    : filters.dir === "asc"
      ? "ascending"
      : "descending";
  return `sorted by ${column.sortLabel ?? column.label.toLowerCase()}, ${direction}`;
}

// Quick status tabs above a table ("All · 12", "Passed · 8"): each is the
// status filter set to that one value, so they stay in step with the panel.
function StatusTabs({ counts, pathname, filters }) {
  const selected = filters.statuses ?? [];
  return (
    <nav aria-label="Status" className="flex flex-wrap gap-1.5">
      {counts.map((s) => {
        const active = s.value
          ? selected.length === 1 && selected[0] === s.value
          : selected.length === 0;
        return (
          <Link
            key={s.value || "all"}
            href={buildHref(pathname, filters, {
              statuses: s.value ? [s.value] : [],
              page: 1,
            })}
            aria-current={active ? "true" : undefined}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap transition ${
              active
                ? "border-brand bg-periwinkle/40 text-brand"
                : "border-mist text-ink hover:border-brand hover:text-brand bg-white"
            }`}
          >
            {s.label} · {formatNumber(s.count)}
          </Link>
        );
      })}
    </nav>
  );
}

// /admin/reports/requests, /learners, /exams, /certificates, /organisations.
// One page for all five: the registry supplies the definition (filters, sort
// keys, columns) and the report function supplies finished numbers. Nothing
// is calculated here; the page lays out what the server computed, top to
// bottom: title and export, tabs, filter toolbar, key figures, one trend and
// one breakdown (more behind a toggle), then the table with its own search.
export default async function ReportPage({ params, searchParams }) {
  await requireAdmin();
  const { report: slug } = await params;
  const family = REPORTS[slug];
  if (!family) notFound();

  const { definition } = family;
  const filters = parseReportFilters(
    await searchParams,
    filterOptions(definition),
  );
  const data = await family.report(filters);
  const pathname = `/admin/reports/${slug}`;
  const { window } = data.table;
  const shortTitle =
    REPORT_TABS.find((t) => t.key === slug)?.label ?? definition.title;
  const searchable = definition.fields.includes("q");
  const sortNote = describeSort(definition.columns, filters);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-brand text-sm font-medium">Reports</p>
          <h1 className="font-display text-ink mt-1 text-3xl font-bold tracking-tight">
            {shortTitle}
          </h1>
          <p className="text-shuttle mt-2 text-sm">{definition.subtitle}</p>
        </div>
        <ExportMenu report={slug} filters={filters} />
      </header>

      <ReportTabs active={slug} filters={filters} />

      {/* The search box lives on the table, so it is left out of the panel. */}
      <FilterBar
        pathname={pathname}
        filters={filters}
        fields={definition.fields.filter((f) => f !== "q")}
        options={{
          certifications: data.options?.certifications ?? [],
          statuses: definition.statuses,
          countries: COUNTRY_OPTIONS,
          qPlaceholder: definition.qPlaceholder,
        }}
      />

      <StatTiles tiles={formatTiles(data.tiles)} />

      <ReportCharts
        series={data.series}
        distributions={data.distributions}
        groupBy={{
          options: definition.groupBys ?? [],
          active: filters.groupBy,
          pathname,
          filters,
        }}
      />

      <section
        aria-label="Rows"
        className="border-mist rounded-2xl border bg-white"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-ink text-base font-semibold">
              {definition.tableTitle ?? "All rows in this period"}
            </h2>
            {data.statusCounts?.length ? (
              <StatusTabs
                counts={data.statusCounts}
                pathname={pathname}
                filters={filters}
              />
            ) : null}
          </div>
          {searchable ? (
            <SearchBox
              placeholder={definition.qPlaceholder ?? "Search"}
              label={`Search ${shortTitle.toLowerCase()}`}
            />
          ) : null}
        </div>
        {window.total === 0 ? (
          <div className="px-5 pb-5">
            <EmptyState
              title="No rows match"
              message="Nothing matches these filters in this period."
              resetHref={hasActiveFilters(filters) ? pathname : null}
            />
          </div>
        ) : (
          <DataTable
            columns={definition.columns}
            rows={data.table.rows}
            pathname={pathname}
            filters={filters}
            flush
          >
            <Pagination
              pathname={pathname}
              filters={filters}
              window={window}
              note={sortNote}
            />
          </DataTable>
        )}
      </section>
    </div>
  );
}
