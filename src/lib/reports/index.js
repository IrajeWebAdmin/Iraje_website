import "server-only";
import * as requests from "./requests";
import * as learners from "./learners";
import * as exams from "./exams";
import * as certificates from "./certificates";
import * as organisations from "./organisations";

// The report registry: one module per family, each exporting the same three
// things — `definition` (filters, sort keys, columns), `report(filters)` (the
// finished numbers for a page) and `rows(filters)` (every row for a download).
// Pages and the export route look reports up here by their address slug.
export const REPORTS = {
  requests,
  learners,
  exams,
  certificates,
  organisations,
};
export const REPORT_SLUGS = Object.keys(REPORTS);

/** The whitelists parseReportFilters() needs, taken from a definition. */
export function filterOptions(definition) {
  return {
    statuses: definition.statuses.map((s) => s.value),
    sorts: Object.keys(definition.sorts),
    defaultSort: definition.defaultSort,
    defaultDir: definition.defaultDir ?? "desc",
    groupBys: definition.groupBys.map((g) => g.value),
    defaultGroupBy: definition.defaultGroupBy,
  };
}
