import Link from "next/link";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { formatDate, formatDay } from "@/lib/formatDate";
import { buildHref } from "@/lib/reports/filters";
import StatusPill from "./StatusPill";
import EmptyState from "./EmptyState";
import { InitialsAvatar } from "./RequestBits";

// The report table. Columns are plain data ({ key, label, kind, align,
// sortable, width }) so a server page can describe a table without passing
// functions; every value in `rows` is already computed by the server and this
// only formats it for display. Sortable headings are links that patch the
// page address, so sorting works without JavaScript and survives paging.
const number = new Intl.NumberFormat("en-IN");
const DASH = <span className="text-slate-soft">—</span>;
const LINK = "text-brand font-medium hover:underline";

function Cell({ column, row }) {
  const value = row[column.key];
  switch (column.kind) {
    case "number":
      return value == null ? DASH : number.format(value);
    case "percent":
      return value == null ? DASH : `${number.format(value)}%`;
    case "date":
      return value ? formatDate(value) : DASH;
    case "datetime":
      return value ? formatDate(value, { withTime: true }) : DASH;
    case "day":
      return value ? formatDay(value) : DASH;
    case "status":
      return <StatusPill status={value} />;
    case "list":
      return Array.isArray(value) && value.length ? value.join(", ") : DASH;
    case "person":
      // Initials, the name in bold and the row's email underneath.
      return (
        <div className="flex items-center gap-3">
          <InitialsAvatar name={value} className="h-8 w-8 text-[11px]" />
          <span className="min-w-0">
            <span className="text-ink block truncate font-semibold">
              {value == null || value === "" ? "—" : String(value)}
            </span>
            {row.email ? (
              <span className="text-shuttle block truncate text-xs">
                {row.email}
              </span>
            ) : null}
          </span>
        </div>
      );
    case "progress": {
      // A bar with the percentage beside it; "3 of 15 modules" on hover.
      if (!value) return DASH;
      const pct = Math.min(100, Math.max(0, Number(value.percent) || 0));
      return (
        <div
          className="flex min-w-[150px] items-center gap-2"
          title={`${number.format(value.done ?? 0)} of ${number.format(value.total ?? 0)} modules`}
        >
          <div className="bg-mist/60 h-1.5 flex-1 overflow-hidden rounded-full">
            <div
              className="bg-brand h-full rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-shuttle w-10 text-right text-xs tabular-nums">
            {number.format(pct)}%
          </span>
        </div>
      );
    }
    case "link":
      return value?.href ? (
        <Link href={value.href} className={LINK}>
          {value.label ?? value.href}
        </Link>
      ) : (
        DASH
      );
    case "enrollmentLink": {
      const id = row.enrollmentId ?? row.id;
      const text = value == null || value === "" ? "—" : String(value);
      return (
        <>
          {id ? (
            <Link href={`/admin/enrollments/${id}`} className={LINK}>
              {text}
            </Link>
          ) : (
            <span className="text-ink font-medium">{text}</span>
          )}
          {row.email ? (
            <span className="text-shuttle block text-xs">{row.email}</span>
          ) : null}
        </>
      );
    }
    case "orgLink":
      if (value == null || value === "") return DASH;
      return row.orgKey ? (
        <Link
          href={`/admin/reports/organisations/${encodeURIComponent(row.orgKey)}`}
          className={LINK}
        >
          {String(value)}
        </Link>
      ) : (
        String(value)
      );
    case "id":
      return value == null || value === "" ? (
        DASH
      ) : (
        <span className="text-shuttle">#{String(value)}</span>
      );
    case "enrollmentView": {
      const id = row.enrollmentId ?? row.id;
      return id ? (
        <Link href={`/admin/enrollments/${id}`} className={LINK}>
          View
        </Link>
      ) : (
        DASH
      );
    }
    case "multiline":
      if (value == null || value === "") return DASH;
      return String(value)
        .split("\n")
        .map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ));
    default:
      return value == null || value === "" ? DASH : String(value);
  }
}

function Heading({ column, pathname, filters }) {
  const align = column.align === "right" ? "text-right" : "";
  const style = column.width ? { width: column.width } : undefined;
  const sortable = column.sortable && pathname && filters;

  if (!sortable) {
    return (
      <th className={`px-4 py-3 font-medium ${align}`} style={style}>
        {column.label}
      </th>
    );
  }

  const active = filters.sort === column.key;
  const dir = active ? filters.dir : null;
  const next = active && dir === "desc" ? "asc" : "desc";
  const Arrow = dir === "asc" ? FiChevronUp : FiChevronDown;

  return (
    <th
      className={`px-4 py-3 font-medium ${align}`}
      style={style}
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <Link
        href={buildHref(pathname, filters, {
          sort: column.key,
          dir: next,
          page: 1,
        })}
        className={`inline-flex items-center gap-1 ${active ? "text-brand" : "hover:text-ink"}`}
      >
        {column.label}
        {active ? <Arrow className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      </Link>
    </th>
  );
}

export default function DataTable({
  columns = [],
  rows = [],
  rowKey = "id",
  pathname,
  filters,
  emptyMessage = "No rows match these filters.",
  resetHref,
  // `flush`: no card of its own, for a table that sits inside another card.
  flush = false,
  children,
}) {
  if (!rows.length) {
    return <EmptyState message={emptyMessage} resetHref={resetHref} />;
  }

  return (
    <div
      className={
        flush
          ? "overflow-x-auto"
          : "border-mist overflow-x-auto rounded-xl border bg-white"
      }
    >
      <table className="w-full text-left text-sm">
        <thead className="bg-catskill text-shuttle text-xs font-semibold">
          <tr>
            {columns.map((c) => (
              <Heading
                key={c.key}
                column={c}
                pathname={pathname}
                filters={filters}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row[rowKey] ?? i}
              className="border-mist hover:bg-catskill/60 border-t"
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`px-4 py-3 align-top ${
                    c.align === "right" ? "text-right tabular-nums" : ""
                  }`}
                >
                  <Cell column={c} row={row} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination, rendered by the page, sits inside the same card. */}
      {children}
    </div>
  );
}
