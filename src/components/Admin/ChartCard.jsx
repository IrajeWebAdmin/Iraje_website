import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

// A white card around one chart. The chart itself is a client component
// passed as `children`; `tools` is an optional control shown in the header
// (a "break down by" picker); `fallbackTable` is the same data as rows,
// rendered visually hidden so screen readers and no-JS visitors still get
// the numbers.
export default function ChartCard({
  title,
  subtitle,
  action,
  tools,
  empty = false,
  emptyMessage = "No data for this period.",
  fallbackTable,
  className = "",
  children,
}) {
  return (
    <figure
      className={`border-mist h-full rounded-xl border bg-white p-5 ${className}`}
    >
      <figcaption className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-ink text-base font-semibold">{title}</p>
          {subtitle ? (
            <p className="text-shuttle mt-0.5 text-xs">{subtitle}</p>
          ) : null}
        </div>
        {tools ? <div className="shrink-0">{tools}</div> : null}
        {action?.href ? (
          <Link
            href={action.href}
            className="text-brand inline-flex shrink-0 items-center gap-1 text-xs font-medium whitespace-nowrap hover:underline"
          >
            {action.label ?? "View report"}
            <FiArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        ) : null}
      </figcaption>

      <div className="mt-4">
        {empty ? (
          <p className="text-shuttle flex h-40 items-center justify-center text-sm">
            {emptyMessage}
          </p>
        ) : (
          children
        )}
      </div>

      {!empty && fallbackTable?.columns?.length ? (
        <table className="sr-only">
          <caption>{title}</caption>
          <thead>
            <tr>
              {fallbackTable.columns.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(fallbackTable.rows ?? []).map((r, i) => (
              <tr key={i}>
                {r.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </figure>
  );
}
