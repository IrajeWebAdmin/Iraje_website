import { getCurrentUser } from "@/lib/dal";
import { REPORTS, filterOptions } from "@/lib/reports";
import { parseReportFilters, rangeSlug } from "@/lib/reports/filters";
import { toCsv, toXlsx, EXPORT_ROW_CAP } from "@/lib/reports/export";

// GET /api/admin/reports/<report>/export?format=csv|xlsx&...filters
// The download for a report: the same rows as its table under the same
// filters, all pages at once. The proxy only guards /admin pages, so this
// route checks the signed-in user itself: 401 when nobody is signed in, 403
// for anyone who is not an admin with a settled password.
export async function GET(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Sign in first.", { status: 401 });
  if (user.role !== "admin" || user.mustChangePassword)
    return new Response("Not allowed.", { status: 403 });

  const { report: slug } = await params;
  const family = REPORTS[slug];
  if (!family) return new Response("Unknown report.", { status: 404 });

  const { searchParams } = request.nextUrl;
  const format = searchParams.get("format");
  if (format !== "csv" && format !== "xlsx")
    return new Response("format must be csv or xlsx.", { status: 400 });

  // Repeated keys (cert=A&cert=B) must survive, so not Object.fromEntries.
  const raw = {};
  for (const key of new Set(searchParams.keys())) {
    const all = searchParams.getAll(key);
    raw[key] = all.length > 1 ? all : all[0];
  }

  const orgKey = searchParams.get("orgKey");
  const detail = slug === "organisations" && orgKey && family.detailDefinition;
  const definition = detail ? family.detailDefinition : family.definition;
  const filters = parseReportFilters(raw, filterOptions(definition));
  const rows = detail
    ? await family.detailRows(orgKey, filters)
    : await family.rows(filters);

  if (rows.length > EXPORT_ROW_CAP)
    return new Response(
      `This report has more than ${EXPORT_ROW_CAP.toLocaleString("en-IN")} rows. Narrow the date range and try again.`,
      { status: 400 },
    );

  const columns = definition.exportColumns ?? definition.columns;
  const orgPart = orgKey ? `-${orgKey.replace(/[^a-z0-9]+/gi, "-")}` : "";
  const filename = `iraje-${slug}${orgPart}-${rangeSlug(filters)}.${format}`;
  const headers = {
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "private, no-store",
  };

  if (format === "csv") {
    return new Response(toCsv(columns, rows), {
      headers: { ...headers, "Content-Type": "text/csv; charset=utf-8" },
    });
  }
  const workbook = await toXlsx(columns, rows, {
    sheetName: definition.title ?? slug,
  });
  return new Response(workbook, {
    headers: {
      ...headers,
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
