import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { formatDate } from "@/lib/formatDate";

const TABS = [
  { key: "new", label: "New" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

// /admin/enrollments?status=new — the queue of certification requests.
export default async function EnrollmentsPage({ searchParams }) {
  await requireAdmin();

  // In this Next.js version searchParams is a Promise and must be awaited.
  const { status } = await searchParams;
  const active = TABS.some((t) => t.key === status) ? status : "new";

  const [enrollments, grouped] = await Promise.all([
    prisma.enrollment.findMany({
      where: { status: active },
      // New requests oldest-first (a queue); decided ones newest-first.
      orderBy: { createdAt: active === "new" ? "asc" : "desc" },
      take: 200,
      select: {
        id: true,
        name: true,
        email: true,
        organization: true,
        certifications: true,
        createdAt: true,
        reviewedAt: true,
      },
    }),
    prisma.enrollment.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const counts = Object.fromEntries(grouped.map((g) => [g.status, g._count._all]));

  return (
    <div>
      <h1 className="text-2xl font-semibold">Certification requests</h1>

      <div className="mt-6 flex gap-2 border-b border-mist">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/enrollments?status=${tab.key}`}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              tab.key === active
                ? "border-brand text-brand"
                : "border-transparent text-shuttle hover:text-ink"
            }`}
          >
            {tab.label} ({counts[tab.key] ?? 0})
          </Link>
        ))}
      </div>

      {enrollments.length === 0 ? (
        <p className="mt-8 text-sm text-shuttle">No {active} requests.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-mist bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-catskill text-xs text-shuttle uppercase">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Certifications</th>
                <th className="px-4 py-3">{active === "new" ? "Submitted" : "Decided"}</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id} className="border-t border-mist hover:bg-catskill/60">
                  <td className="px-4 py-3 text-shuttle">{e.id}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/enrollments/${e.id}`} className="font-medium text-brand hover:underline">
                      {e.name}
                    </Link>
                    <div className="text-xs text-shuttle">{e.email}</div>
                  </td>
                  <td className="px-4 py-3">{e.organization}</td>
                  <td className="px-4 py-3">{e.certifications}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(active === "new" ? e.createdAt : e.reviewedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
