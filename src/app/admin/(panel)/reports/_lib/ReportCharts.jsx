import ChartCard from "@/components/Admin/ChartCard";
import LinkSelect from "@/components/Admin/LinkSelect";
import TimeSeriesChart from "@/components/Admin/charts/TimeSeriesChart";
import DistributionChart from "@/components/Admin/charts/DistributionChart";
import { buildHref } from "@/lib/reports/filters";
import {
  seriesIsEmpty,
  distributionIsEmpty,
  seriesFallback,
  distributionFallback,
} from "@/lib/reports/format";
// The charts block of a report page: a two-column grid of cards, the first
// trend and the first breakdown (with its "break down by" picker in the card
// header) first, then every other chart in order. Everything arrives
// computed; these components only draw.

export function TrendCard({ series, action }) {
  return (
    <ChartCard
      title={series.title}
      subtitle={series.subtitle}
      action={action}
      empty={seriesIsEmpty(series)}
      emptyMessage="Nothing in this period yet."
      fallbackTable={seriesFallback(series)}
    >
      <TimeSeriesChart
        title={series.title}
        data={series.data}
        series={series.fields ?? [{ key: "value", label: series.title }]}
        kind={series.kind ?? "area"}
        stacked={Boolean(series.stacked)}
        valueSuffix={series.valueSuffix}
      />
    </ChartCard>
  );
}

// `groupBy` ({ options, active, pathname, filters }) adds the picker; the
// chosen option is part of the page address, like every other setting.
// `action` ({ href, label }) is the "View report" link used on the overview.
// `height` fixes the chart height so a card beside a trend matches it.
export function BreakdownCard({ distribution, groupBy, action, height }) {
  const options = groupBy?.options ?? [];
  const hrefFor = (value) =>
    buildHref(groupBy.pathname, groupBy.filters, { groupBy: value, page: 1 });
  const picker =
    options.length > 1 ? (
      <LinkSelect
        options={options.map((o) => ({
          href: hrefFor(o.value),
          label: `By ${o.label.toLowerCase()}`,
        }))}
        value={hrefFor(groupBy.active ?? options[0].value)}
      />
    ) : null;

  return (
    <ChartCard
      title={distribution.title}
      subtitle={distribution.subtitle}
      tools={picker}
      action={action}
      empty={distributionIsEmpty(distribution)}
      emptyMessage="Nothing to break down yet."
      fallbackTable={distributionFallback(distribution)}
    >
      <DistributionChart
        title={distribution.title}
        data={distribution.data}
        height={height}
        valueSuffix={distribution.valueSuffix}
      />
    </ChartCard>
  );
}

export default function ReportCharts({
  series = [],
  distributions = [],
  groupBy,
}) {
  // One grid, two cards per row: the first trend, the first breakdown (with
  // its picker), then every other chart in order. A lone card spans the row.
  const [trend, ...moreTrends] = series;
  const [breakdown, ...moreBreakdowns] = distributions;
  const cards = [
    trend
      ? { key: `trend-${trend.key}`, node: <TrendCard series={trend} /> }
      : null,
    breakdown
      ? {
          key: `breakdown-${breakdown.key}`,
          node: (
            <BreakdownCard
              distribution={breakdown}
              groupBy={groupBy}
              height={260}
            />
          ),
        }
      : null,
    ...moreTrends.map((s) => ({
      key: `trend-${s.key}`,
      node: <TrendCard series={s} />,
    })),
    ...moreBreakdowns.map((d) => ({
      key: `breakdown-${d.key}`,
      node: <BreakdownCard distribution={d} height={260} />,
    })),
  ].filter(Boolean);
  if (cards.length === 0) return null;

  return (
    <section aria-label="Charts" className="grid gap-4 lg:grid-cols-2">
      {cards.map((card) => (
        <div
          key={card.key}
          className={cards.length === 1 ? "lg:col-span-2" : ""}
        >
          {card.node}
        </div>
      ))}
    </section>
  );
}
