// Turns finished report numbers into display strings for the page. Pure and
// used by Server Components only: the browser receives the strings.

const numberFmt = new Intl.NumberFormat("en-IN");

/** 1234 -> "1,234"; null -> "—". */
export function formatNumber(value) {
  return value === null || value === undefined ? "—" : numberFmt.format(value);
}

/** A tile's value as text according to its `format`. */
export function formatTileValue(value, format) {
  if (value === null || value === undefined || value === "") return "—";
  switch (format) {
    case "percent":
      return `${numberFmt.format(value)}%`;
    case "minutes":
      return `${numberFmt.format(value)} min`;
    case "hours":
      return `${numberFmt.format(value)} h`;
    case "days":
      return `${numberFmt.format(value)} d`;
    case "text":
      return String(value);
    default:
      return typeof value === "number"
        ? numberFmt.format(value)
        : String(value);
  }
}

/** Report tiles -> StatTile props. `secondary` tiles sit behind "more figures". */
export function formatTiles(tiles) {
  return (tiles ?? []).map((t) => ({
    key: t.key,
    label: t.label,
    value: formatTileValue(t.value, t.format),
    hint: t.hint ?? null,
    href: t.href ?? null,
    secondary: Boolean(t.secondary),
  }));
}

/** True when a trend has nothing but zeros to show. */
export function seriesIsEmpty(series) {
  const fields = series.fields ?? [{ key: "value" }];
  return !series.data?.some((row) =>
    fields.some((f) => Number(row[f.key]) > 0),
  );
}

/** True when a breakdown has no bars worth drawing. */
export function distributionIsEmpty(distribution) {
  return !distribution.data?.some((d) => Number(d.value) > 0);
}

/** The screen-reader table behind a trend chart. */
export function seriesFallback(series) {
  const fields = series.fields ?? [{ key: "value", label: series.title }];
  return {
    columns: ["Period", ...fields.map((f) => f.label)],
    rows: (series.data ?? []).map((row) => [
      row.label,
      ...fields.map((f) => formatNumber(row[f.key] ?? 0)),
    ]),
  };
}

/** The screen-reader table behind a breakdown chart. */
export function distributionFallback(distribution) {
  return {
    columns: ["Name", "Value"],
    rows: (distribution.data ?? []).map((d) => [d.name, formatNumber(d.value)]),
  };
}

/** True when any filter differs from its default, so a Reset link is worth showing. */
export function hasActiveFilters(filters) {
  return Boolean(
    filters.range !== "30d" ||
    filters.certs.length ||
    filters.statuses.length ||
    filters.org ||
    filters.country ||
    filters.q ||
    (filters.groupBy && filters.groupBy !== filters.defaults?.groupBy) ||
    filters.grainParam !== "auto",
  );
}
