import Link from "next/link";
import {
  FiAlertCircle,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiGrid,
  FiX,
} from "react-icons/fi";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { formatDate } from "@/lib/formatDate";
import { CertChips, InitialsAvatar } from "@/components/Admin/RequestBits";
import SearchBox from "@/components/Admin/SearchBox";
import Pagination from "@/components/Admin/Pagination";
import { pageWindow } from "@/lib/reports/paginate";
import { PAGE_SIZES, DEFAULT_PAGE_SIZE } from "@/lib/reports/filters";
import { approveFromList } from "./actions";
import RowActions from "./RowActions";

export const metadata = {
  title: "Certification requests | Iraje Admin",
};

const TABS = [
  { key: "new", label: "New", noun: "new" },
  { key: "approved", label: "Approved", noun: "approved" },
  { key: "rejected", label: "Rejected", noun: "rejected" },
];
const PATH = "/admin/enrollments";

// Links on this page carry the tab, the search, the page number and the rows
// per page; defaults are left out so the address stays short.
function pageHref({ status, q = "", page = 1, pageSize = DEFAULT_PAGE_SIZE }) {
  const params = new URLSearchParams({ status });
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  if (pageSize !== DEFAULT_PAGE_SIZE) params.set("pageSize", String(pageSize));
  return `${PATH}?${params}`;
}

/** A tab's first page, keeping the search and the rows-per-page choice. */
function tabHref(status, q = "", pageSize = DEFAULT_PAGE_SIZE) {
  return pageHref({ status, q, pageSize });
}

function StatCard({ label, value, icon: Icon, tone, href }) {
  const body = (
    <>
      <span
        aria-hidden="true"
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span>
        <span className="text-ink block text-2xl leading-none font-semibold">
          {value}
        </span>
        <span className="text-shuttle mt-1.5 block text-xs">{label}</span>
      </span>
    </>
  );
  const base =
    "border-mist flex items-center gap-4 rounded-2xl border bg-white px-5 py-4";
  return href ? (
    <Link href={href} className={`${base} hover:border-brand transition`}>
      {body}
    </Link>
  ) : (
    <div className={base}>{body}</div>
  );
}

// /admin/enrollments?status=new — the queue of certification requests.
export default async function EnrollmentsPage({ searchParams }) {
  await requireAdmin();

  // In this Next.js version searchParams is a Promise and must be awaited.
  const sp = await searchParams;
  const str = (v) => (typeof v === "string" ? v : "");
  const active = TABS.some((t) => t.key === sp.status) ? sp.status : "new";
  const tab = TABS.find((t) => t.key === active);
  const q = str(sp.q).trim().slice(0, 80);
  const notice = str(sp.notice);
  const error = str(sp.error);
  const decided = active !== "new";
  const wantedPage = Number.parseInt(str(sp.page), 10);
  const wantedSize = Number.parseInt(str(sp.pageSize), 10);
  const pageSize = PAGE_SIZES.includes(wantedSize)
    ? wantedSize
    : DEFAULT_PAGE_SIZE;

  const where = {
    status: active,
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
            { organization: { contains: q } },
          ],
        }
      : {}),
  };

  const [matching, grouped] = await Promise.all([
    prisma.enrollment.count({ where }),
    prisma.enrollment.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  // A page past the end is clamped to the last one.
  const window = pageWindow({ page: wantedPage, pageSize, total: matching });
  const enrollments = await prisma.enrollment.findMany({
    where,
    // Newest first; decided requests by the date of the decision.
    orderBy: decided
      ? [{ reviewedAt: "desc" }, { id: "desc" }]
      : [{ createdAt: "desc" }, { id: "desc" }],
    skip: window.skip,
    take: window.take,
    select: {
      id: true,
      name: true,
      email: true,
      organization: true,
      certifications: true,
      createdAt: true,
      reviewedAt: true,
    },
  });

  const counts = Object.fromEntries(
    grouped.map((g) => [g.status, g._count._all]),
  );
  const total = grouped.reduce((sum, g) => sum + g._count._all, 0);

  const stats = [
    {
      key: "new",
      label: "New · awaiting review",
      value: counts.new ?? 0,
      icon: FiClock,
      tone: "bg-amber-50 text-amber-600",
      href: tabHref("new"),
    },
    {
      key: "approved",
      label: "Approved",
      value: counts.approved ?? 0,
      icon: FiCheck,
      tone: "bg-green-50 text-green-600",
      href: tabHref("approved"),
    },
    {
      key: "rejected",
      label: "Rejected",
      value: counts.rejected ?? 0,
      icon: FiX,
      tone: "bg-red-50 text-red-500",
      href: tabHref("rejected"),
    },
    {
      key: "total",
      label: "Total requests",
      value: total,
      icon: FiGrid,
      tone: "bg-periwinkle text-brand",
    },
  ];

  const shown = enrollments.length;
  const current = {
    status: active,
    q,
    page: window.page,
    pageSize: window.pageSize,
  };
  const footerNote = [
    `${tab.noun} request${matching === 1 ? "" : "s"}`,
    q ? `matching “${q}”` : null,
    decided ? "newest decision first" : "newest submission first",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-6">
      <header>
        <p className="text-brand text-sm font-medium">Admin Dashboard</p>
        <h1 className="font-display text-ink mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          Certification{" "}
          <span className="text-brand font-medium italic">requests</span>
        </h1>
        <p className="text-shuttle mt-2 text-sm">
          Review each registration, then approve or reject it. Learners are
          notified by email.
        </p>
      </header>

      {notice || error ? (
        <div
          role="status"
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-green-200 bg-green-50 text-green-800"
          }`}
        >
          {error ? (
            <FiAlertCircle
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
          ) : (
            <FiCheckCircle
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
          )}
          <p className="flex-1">{error || notice}</p>
          <Link
            href={pageHref(current)}
            className="shrink-0 text-xs font-semibold underline-offset-2 hover:underline"
          >
            Dismiss
          </Link>
        </div>
      ) : null}

      <section
        aria-label="Totals"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {stats.map(({ key, ...s }) => (
          <StatCard key={key} {...s} />
        ))}
      </section>

      <section className="border-mist rounded-2xl border bg-white">
        <div className="border-mist flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b px-5 pt-1">
          <nav aria-label="Request status" className="-mb-px flex gap-1">
            {TABS.map((t) => {
              const selected = t.key === active;
              return (
                <Link
                  key={t.key}
                  href={tabHref(t.key, q, window.pageSize)}
                  aria-current={selected ? "page" : undefined}
                  className={`inline-flex items-center gap-2 border-b-2 px-3 py-3.5 text-sm font-semibold whitespace-nowrap ${
                    selected
                      ? "border-brand text-brand"
                      : "text-shuttle hover:text-ink border-transparent"
                  }`}
                >
                  {t.label}
                  <span
                    className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] ${
                      selected ? "bg-brand text-white" : "bg-mist text-shuttle"
                    }`}
                  >
                    {counts[t.key] ?? 0}
                  </span>
                </Link>
              );
            })}
          </nav>
          <SearchBox
            placeholder="Search name, email or organisation"
            label="Search requests"
            className="py-2"
          />
        </div>

        {shown === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-ink text-sm font-semibold">
              {q
                ? `No ${tab.noun} requests match “${q}”`
                : `No ${tab.noun} requests`}
            </p>
            <p className="text-shuttle mt-1 text-sm">
              {q ? (
                <Link
                  href={tabHref(active)}
                  className="text-brand hover:underline"
                >
                  Clear the search
                </Link>
              ) : active === "new" ? (
                "New registrations will appear here."
              ) : (
                "Nothing has been decided this way yet."
              )}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-catskill text-shuttle text-xs font-semibold">
                <tr>
                  <th className="px-5 py-3 font-semibold">Request</th>
                  <th className="px-5 py-3 font-semibold">Learner</th>
                  <th className="px-5 py-3 font-semibold">Organisation</th>
                  <th className="px-5 py-3 font-semibold">Certifications</th>
                  <th className="px-5 py-3 font-semibold">
                    {decided ? "Decided" : "Submitted"}
                  </th>
                  <th className="px-5 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => {
                  const href = `${PATH}/${e.id}`;
                  return (
                    <tr
                      key={e.id}
                      className="border-mist hover:bg-catskill/50 border-t"
                    >
                      <td className="text-shuttle px-5 py-3.5 whitespace-nowrap">
                        #{e.id}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <InitialsAvatar name={e.name} />
                          <span className="min-w-0">
                            <Link
                              href={href}
                              className="text-brand block truncate font-medium hover:underline"
                            >
                              {e.name}
                            </Link>
                            <span className="text-shuttle block truncate text-xs">
                              {e.email}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="text-ink px-5 py-3.5">{e.organization}</td>
                      <td className="px-5 py-3.5">
                        <CertChips value={e.certifications} />
                      </td>
                      <td className="text-ink px-5 py-3.5 whitespace-nowrap">
                        {formatDate(decided ? e.reviewedAt : e.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        {decided ? (
                          <div className="flex justify-end">
                            <Link
                              href={href}
                              className="border-mist text-ink hover:border-brand hover:text-brand inline-flex h-8 items-center rounded-full border bg-white px-3.5 text-xs font-semibold transition"
                            >
                              Review
                            </Link>
                          </div>
                        ) : (
                          <RowActions
                            name={e.name}
                            reviewHref={href}
                            approveAction={approveFromList.bind(null, e.id)}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          window={window}
          note={footerNote}
          hrefFor={(patch) => pageHref({ ...current, ...patch })}
        />
      </section>
    </div>
  );
}
