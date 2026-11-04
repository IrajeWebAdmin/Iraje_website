import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { requireAdmin } from "@/lib/dal";
import * as organisations from "@/lib/reports/organisations";
import { filterOptions } from "@/lib/reports";
import { parseReportFilters, buildHref } from "@/lib/reports/filters";
import {
  formatNumber,
  formatTiles,
  hasActiveFilters,
} from "@/lib/reports/format";
import { formatDate } from "@/lib/formatDate";
import FilterBar from "@/components/Admin/FilterBar";
import StatTiles from "@/components/Admin/StatTiles";
import DataTable from "@/components/Admin/DataTable";
import Pagination from "@/components/Admin/Pagination";
import ExportMenu from "@/components/Admin/ExportMenu";
import EmptyState from "@/components/Admin/EmptyState";
import ReportCharts from "../../_lib/ReportCharts";

export async function generateMetadata({ params }) {
  const { orgKey } = await params;
  return {
    title: `${decodeURIComponent(orgKey)} · Organisations · Iraje Admin`,
  };
}

// /admin/reports/organisations/<key> — one organisation: who came from it,
// what they asked for and how far they got. Reached from any organisation
// link in the reports; stays inside the admin panel.
export default async function OrganisationPage({ params, searchParams }) {
  await requireAdmin();
  const { orgKey } = await params;
  const key = decodeURIComponent(orgKey);
  const definition = organisations.detailDefinition;
  const filters = parseReportFilters(
    await searchParams,
    filterOptions(definition),
  );
  const data = await organisations.detail(key, filters);
  if (!data) notFound();

  const pathname = `/admin/reports/organisations/${encodeURIComponent(key)}`;
  const { organisation } = data;
  const { window } = data.table;
  const listHref = buildHref("/admin/reports/organisations", {
    ...filters,
    certs: [],
    statuses: [],
    org: "",
    country: "",
    q: "",
    page: 1,
    sort: null,
  });
  const facts = [
    organisation.countries?.length ? organisation.countries.join(", ") : null,
    organisation.firstSeen
      ? `first request ${formatDate(organisation.firstSeen)}`
      : null,
    organisation.lastSeen
      ? `latest ${formatDate(organisation.lastSeen)}`
      : null,
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      <Link
        href={listHref}
        className="text-shuttle hover:text-brand inline-flex items-center gap-1.5 text-sm"
      >
        <FiArrowLeft className="h-4 w-4" />
        All organisations
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{organisation.name}</h1>
          <p className="text-shuttle mt-1 text-sm">
            People who requested or hold Iraje certifications
            {facts.length ? ` · ${facts.join(" · ")}` : ""}
          </p>
          {organisation.spellings?.length > 1 && (
            <p className="text-slate-soft mt-1 text-xs">
              Also written as: {organisation.spellings.join(" · ")}
            </p>
          )}
        </div>
        <ExportMenu
          report="organisations"
          filters={filters}
          extra={{ orgKey: key }}
        />
      </header>

      <FilterBar
        pathname={pathname}
        filters={filters}
        fields={definition.fields}
        options={{
          certifications: data.options?.certifications ?? [],
          statuses: definition.statuses,
          countries: [],
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

      <section aria-label="People">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-ink text-sm font-semibold">People</h2>
          <p className="text-shuttle text-xs">
            {window.total
              ? `${formatNumber(window.total)} row${window.total === 1 ? "" : "s"} · one per person per certification`
              : "No rows"}
          </p>
        </div>
        {window.total === 0 ? (
          <EmptyState
            title="No people match"
            message="Nobody from this organisation matches these filters in this period."
            resetHref={hasActiveFilters(filters) ? pathname : null}
          />
        ) : (
          <DataTable
            columns={definition.columns}
            rows={data.table.rows}
            pathname={pathname}
            filters={filters}
          >
            <Pagination pathname={pathname} filters={filters} window={window} />
          </DataTable>
        )}
      </section>
    </div>
  );
}
