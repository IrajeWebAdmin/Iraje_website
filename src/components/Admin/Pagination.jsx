import Link from "next/link";
import { buildHref, PAGE_SIZES } from "@/lib/reports/filters";

// Table footer: "Showing 26–50 of 312", page-size choice, Previous / Next.
// `window` ({ page, pageSize, total, totalPages, start, end }) is computed by
// the server; every control is a plain link that patches the page address.
// Report pages pass `pathname` + `filters`; any other table passes `hrefFor`,
// a function from a patch ({ page } or { pageSize, page }) to a link. `note`
// is extra text after the "Showing" line (the sort order, a search term).
const number = new Intl.NumberFormat("en-IN");
const BTN =
  "border-mist text-ink hover:border-brand hover:text-brand rounded-lg border bg-white px-3 py-1.5 text-sm font-medium transition";
const OFF =
  "border-mist bg-catskill text-slate-soft rounded-lg border px-3 py-1.5 text-sm font-medium";

export default function Pagination({
  pathname,
  filters,
  window: win,
  hrefFor,
  note,
}) {
  if (!win || !win.total) return null;
  const { page, pageSize, total, totalPages, start, end } = win;
  const href = hrefFor ?? ((patch) => buildHref(pathname, filters, patch));

  return (
    <div className="border-mist text-shuttle flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm">
      <p>
        Showing {number.format(start)}–{number.format(end)} of{" "}
        {number.format(total)}
        {note ? <span> · {note}</span> : null}
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <p className="flex items-center gap-2">
          <span>Rows per page:</span>
          {PAGE_SIZES.map((size) =>
            size === pageSize ? (
              <span key={size} className="text-brand font-semibold">
                {size}
              </span>
            ) : (
              <Link
                key={size}
                href={href({ pageSize: size, page: 1 })}
                className="hover:text-brand"
              >
                {size}
              </Link>
            ),
          )}
        </p>

        <nav aria-label="Pages" className="flex items-center gap-2">
          {page > 1 ? (
            <Link href={href({ page: page - 1 })} className={BTN}>
              Previous
            </Link>
          ) : (
            <span className={OFF} aria-disabled="true">
              Previous
            </span>
          )}
          <span className="px-1">
            Page {number.format(page)} of {number.format(totalPages)}
          </span>
          {page < totalPages ? (
            <Link href={href({ page: page + 1 })} className={BTN}>
              Next
            </Link>
          ) : (
            <span className={OFF} aria-disabled="true">
              Next
            </span>
          )}
        </nav>
      </div>
    </div>
  );
}
