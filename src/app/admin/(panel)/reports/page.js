import { requireAdmin } from "@/lib/dal";
import * as overview from "@/lib/reports/overview";
import { parseReportFilters } from "@/lib/reports/filters";
import ReportTabs from "@/components/Admin/ReportTabs";
import FilterBar from "@/components/Admin/FilterBar";
import OverviewCards from "./_lib/OverviewCards";
import { TrendCard } from "./_lib/ReportCharts";

export const metadata = { title: "Reports · Iraje Admin" };

// /admin/reports — the overview: one card per report with its headline
// numbers for the period, each opening the full report, and two small trends.
// Period is the only filter here.
export default async function ReportsOverviewPage({ searchParams }) {
  await requireAdmin();
  const filters = parseReportFilters(await searchParams);
  const data = await overview.report(filters);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-brand text-sm font-medium">Admin Dashboard</p>
        <h1 className="font-display text-ink mt-1 text-3xl font-bold tracking-tight">
          Reports
        </h1>
        <p className="text-shuttle mt-2 text-sm">
          Requests, learners, exams, certificates and organisations at a glance.
          Open a card for the full report, its filters and downloads.
        </p>
      </header>

      <ReportTabs active="overview" filters={filters} />

      <FilterBar
        pathname="/admin/reports"
        filters={filters}
        fields={["range", "grain"]}
        options={{}}
      />

      <OverviewCards cards={data.cards} />

      {data.series?.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.series.map((s) => (
            <TrendCard
              key={s.key}
              series={s}
              action={
                s.href ? { href: s.href, label: "View report" } : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
