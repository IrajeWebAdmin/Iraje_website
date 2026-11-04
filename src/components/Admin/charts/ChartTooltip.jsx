"use client";

// Hover card for both chart types: the bucket label on top, then one line per
// series with its colour square and the value as the server computed it.
const number = new Intl.NumberFormat("en-IN");

export default function ChartTooltip({
  active,
  payload,
  label,
  valueSuffix = "",
}) {
  if (!active || !payload?.length) return null;
  const heading = payload[0]?.payload?.tooltipLabel ?? label;

  return (
    <div className="border-mist rounded-lg border bg-white px-3 py-2 text-xs shadow-sm">
      {heading != null ? (
        <p className="text-ink font-semibold">{heading}</p>
      ) : null}
      <ul className="mt-1 space-y-0.5">
        {payload.map((p) => (
          <li key={p.dataKey} className="text-shuttle flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-sm"
              style={{ background: p.color ?? p.fill }}
              aria-hidden="true"
            />
            <span>{p.name ?? p.dataKey}</span>
            <span className="text-ink ml-auto pl-3 font-semibold tabular-nums">
              {number.format(p.value ?? 0)}
              {valueSuffix}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
