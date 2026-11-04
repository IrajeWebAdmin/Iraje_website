"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS, FILL_OPACITY, GRID, SERIES } from "./palette";
import ChartTooltip from "./ChartTooltip";
import useMounted from "./useMounted";

// One segment of a stacked bar: a plain rectangle, with the two top corners
// rounded when `radius` is set (the topmost segment of its bar).
function StackSegment({ x, y, width, height, fill, radius = 0 }) {
  if (!(width > 0) || !(height > 0)) return null;
  const r = Math.min(radius, width / 2, height);
  const d = r
    ? `M${x},${y + height} V${y + r} Q${x},${y} ${x + r},${y} H${x + width - r} Q${x + width},${y} ${x + width},${y + r} V${y + height} Z`
    : `M${x},${y} h${width} v${height} h${-width} Z`;
  return <path d={d} fill={fill} />;
}

// A trend over time. `data` rows ({ date, label, ...values }) are already
// bucketed and counted on the server; `series` names which keys to draw (at
// most three). A series may carry its own `color` (a status colour); the rest
// take the palette in order. `stacked` piles the series on top of each other,
// for a split such as requests by status. Draws nothing until mounted,
// keeping a fixed-height placeholder so the layout never shifts.
export default function TimeSeriesChart({
  title,
  data = [],
  series = [],
  kind = "area",
  stacked = false,
  height = 260,
  valueSuffix = "",
}) {
  const mounted = useMounted();
  const lines = series.slice(0, SERIES.length);
  const colorOf = (s, i) => s.color ?? SERIES[i];

  if (!mounted) {
    return (
      <div
        style={{ height }}
        className="bg-catskill animate-pulse rounded-lg"
        aria-hidden="true"
      />
    );
  }

  const Chart = kind === "bar" ? BarChart : AreaChart;
  const tick = { fill: AXIS, fontSize: 11 };
  const stackId = stacked ? "stack" : undefined;
  // In a stack only the topmost non-empty segment gets rounded corners.
  const isTop = (payload, i) =>
    lines.slice(i + 1).every((s) => !(Number(payload?.[s.key]) > 0));

  return (
    <div role="img" aria-label={title} style={{ height }}>
      <ResponsiveContainer width="100%" height={height}>
        <Chart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={GRID} />
          {/* preserveStartEnd keeps the first and last labels, so the axis
              reads from the period's first day; the default drops the first
              ones and the chart looks as if it begins part-way along. */}
          <XAxis
            dataKey="label"
            tick={tick}
            axisLine={false}
            tickLine={false}
            minTickGap={28}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            width={32}
            tick={tick}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<ChartTooltip valueSuffix={valueSuffix} />}
            cursor={{ stroke: GRID, fill: GRID, fillOpacity: 0.5 }}
          />
          {lines.length >= 2 ? (
            <Legend
              verticalAlign="top"
              align="right"
              height={28}
              iconType="square"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: AXIS }}
            />
          ) : null}
          {lines.map((s, i) =>
            kind === "bar" ? (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                fill={colorOf(s, i)}
                stackId={stackId}
                radius={stacked ? undefined : [4, 4, 0, 0]}
                shape={
                  stacked
                    ? (props) => (
                        <StackSegment
                          {...props}
                          radius={isTop(props.payload, i) ? 4 : 0}
                        />
                      )
                    : undefined
                }
                maxBarSize={48}
                isAnimationActive={false}
              />
            ) : (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stackId={stackId}
                stroke={colorOf(s, i)}
                strokeWidth={2}
                fill={colorOf(s, i)}
                fillOpacity={FILL_OPACITY}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
                isAnimationActive={false}
              />
            ),
          )}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}
