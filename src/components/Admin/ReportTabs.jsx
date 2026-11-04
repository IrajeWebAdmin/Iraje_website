import Link from "next/link";
import {
  buildHref,
  DEFAULT_PAGE_SIZE,
  DEFAULT_RANGE,
} from "@/lib/reports/filters";

// Overview · Requests · Learners · Exams · Certificates · Organisations.
// Switching keeps only the period, so the same window follows you between
// reports while report-specific filters start fresh.
export const REPORT_TABS = [
  { key: "overview", label: "Overview", href: "/admin/reports" },
  { key: "requests", label: "Requests" },
  { key: "learners", label: "Learners" },
  { key: "exams", label: "Exams" },
  { key: "certificates", label: "Certificates" },
  { key: "organisations", label: "Organisations" },
];

export default function ReportTabs({ active, filters }) {
  const period = {
    range: filters?.range ?? DEFAULT_RANGE,
    from: filters?.from ?? null,
    to: filters?.to ?? null,
    grainParam: "auto",
    certs: [],
    statuses: [],
    org: "",
    country: "",
    q: "",
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  };

  return (
    <nav
      aria-label="Reports"
      className="border-mist flex gap-2 overflow-x-auto border-b"
    >
      {REPORT_TABS.map((tab) => {
        const current = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={buildHref(tab.href ?? `/admin/reports/${tab.key}`, period)}
            aria-current={current ? "page" : undefined}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium whitespace-nowrap ${
              current
                ? "border-brand text-brand"
                : "text-shuttle hover:text-ink border-transparent"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
