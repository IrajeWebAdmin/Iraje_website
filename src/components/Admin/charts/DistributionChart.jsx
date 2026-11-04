// A breakdown ("by certification", "by country") as a list of bars: the name
// on the left, a full-width track with the filled part in proportion to the
// largest value, and the value in a column on the right. Plain HTML, so it
// needs no chart library and lines up with the left edge of the card. `data`
// ([{ name, value }]) comes counted and ordered from the server; this only
// divides by the largest value to size the fills. With `height` the rows
// spread out to fill a card that sits beside a trend chart.
const number = new Intl.NumberFormat("en-IN");

export default function DistributionChart({
  title,
  data = [],
  height,
  valueSuffix = "",
}) {
  const max = Math.max(0, ...data.map((d) => Number(d.value) || 0));

  return (
    <div
      role="img"
      aria-label={title}
      style={height ? { minHeight: height } : undefined}
      className="flex flex-col justify-evenly gap-y-3"
    >
      {data.map((d) => {
        const value = Number(d.value) || 0;
        const pct = max > 0 ? Math.round((value / max) * 1000) / 10 : 0;
        return (
          <div
            key={d.name}
            className="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-4 text-sm"
          >
            <span className="text-ink truncate font-medium" title={d.name}>
              {d.name}
            </span>
            <span className="bg-mist/50 block h-2 overflow-hidden rounded-full">
              <span
                className="bg-brand block h-full rounded-full"
                style={{ width: `${pct}%` }}
              />
            </span>
            <span className="text-ink text-right font-bold tabular-nums">
              {number.format(value)}
              {valueSuffix}
            </span>
          </div>
        );
      })}
    </div>
  );
}
