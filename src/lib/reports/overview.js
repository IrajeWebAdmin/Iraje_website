import "server-only";
import { prisma } from "@/lib/prisma";
import { buildHref } from "./filters";
import { periodWhere, tile } from "./common";
import { bucketKey, fillSeries, rate, tally } from "./buckets";
import { periodKeys } from "./periodKeys";

// The overview page: one card per report with its headline numbers for the
// period, each linking into the report that explains it, plus two small
// trends. Only the period filter applies here. Everything is computed here;
// the page only draws.

const REPORTS = "/admin/reports";
const GRAIN_WORD = { day: "day", week: "week", month: "month" };

/** The period as a Prisma date range, or null for "all time". */
function dateRange(filters) {
  const range = periodWhere("at", filters).at;
  return range ?? null;
}

export async function report(filters) {
  const now = new Date();
  const range = dateRange(filters);
  const activity = range
    ? {
        OR: [
          { lastLoginAt: range },
          {
            certifications: {
              some: {
                OR: [
                  {
                    progress: {
                      some: {
                        OR: [{ readAt: range }, { checkPassedAt: range }],
                      },
                    },
                  },
                  { examAttempts: { some: { startedAt: range } } },
                ],
              },
            },
          },
        ],
      }
    : {};

  const [
    requests,
    pending,
    activeLearners,
    certifiedLearners,
    attempts,
    submitted,
    passed,
    certificates,
    certificatesAllTime,
    orgGroups,
    orgsWithCertified,
    requestDates,
    certificateDates,
  ] = await Promise.all([
    prisma.enrollment.count({ where: periodWhere("createdAt", filters) }),
    prisma.enrollment.count({ where: { status: "new" } }),
    prisma.user.count({
      where: { role: "student", status: "active", ...activity },
    }),
    prisma.userCertification.findMany({
      where: { status: "passed", ...periodWhere("completedAt", filters) },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.examAttempt.count({ where: periodWhere("startedAt", filters) }),
    prisma.examAttempt.count({
      where: {
        ...periodWhere("startedAt", filters),
        submittedAt: { not: null },
      },
    }),
    prisma.examAttempt.count({
      where: { ...periodWhere("startedAt", filters), passed: true },
    }),
    prisma.certificate.count({ where: periodWhere("issuedAt", filters) }),
    prisma.certificate.count(),
    prisma.enrollment.groupBy({
      by: ["organizationKey"],
      where: {
        ...periodWhere("createdAt", filters),
        organizationKey: { not: "" },
      },
    }),
    // Organisations in the period with at least one learner who has passed
    // any certification (ever).
    prisma.enrollment.groupBy({
      by: ["organizationKey"],
      where: {
        ...periodWhere("createdAt", filters),
        organizationKey: { not: "" },
        user: { certifications: { some: { status: "passed" } } },
      },
    }),
    prisma.enrollment.findMany({
      where: periodWhere("createdAt", filters),
      select: { createdAt: true },
    }),
    prisma.certificate.findMany({
      where: periodWhere("issuedAt", filters),
      select: { issuedAt: true },
    }),
  ]);

  const link = (slug, patch = {}) =>
    buildHref(`${REPORTS}/${slug}`, filters, patch);
  const tiles = [
    {
      ...tile("requests", "Requests received", requests),
      href: link("requests"),
    },
    {
      ...tile("pending", "Pending", pending, "number", "all time"),
      href: link("requests", { statuses: ["new"], range: "all" }),
    },
    {
      ...tile("active", "Active learners", activeLearners),
      href: link("learners"),
    },
    {
      ...tile("certified", "Learners certified", certifiedLearners.length),
      href: link("learners", { statuses: ["passed"] }),
    },
    { ...tile("attempts", "Exams started", attempts), href: link("exams") },
    {
      ...tile(
        "passRate",
        "Pass rate",
        rate(passed, submitted),
        "percent",
        submitted ? `${passed} of ${submitted}` : null,
      ),
      href: link("exams"),
    },
    {
      ...tile("certificates", "Certificates issued", certificates),
      href: link("certificates"),
    },
    {
      ...tile(
        "certificatesAll",
        "Issued",
        certificatesAllTime,
        "number",
        "all time",
      ),
      href: link("certificates", { range: "all" }),
    },
    {
      ...tile("organisations", "Organisations represented", orgGroups.length),
      href: link("organisations"),
    },
    {
      ...tile(
        "orgsCertified",
        "With certified learners",
        orgsWithCertified.length,
      ),
      href: link("organisations"),
    },
  ];

  const grain = filters.grain;
  const per = GRAIN_WORD[grain] ?? "period";
  const series = [
    {
      key: "requests",
      title: "Requests over time",
      subtitle: `Requests received per ${per}`,
      kind: "bar",
      grain,
      fields: [{ key: "value", label: "Requests" }],
      href: link("requests"),
      data: fillSeries(
        periodKeys(
          filters,
          requestDates.map((r) => r.createdAt),
          now,
        ),
        grain,
        tally(requestDates, (r) => bucketKey(r.createdAt, grain)),
      ),
    },
    {
      key: "certificates",
      title: "Certificates issued",
      subtitle: `Certificates issued per ${per}`,
      kind: "bar",
      grain,
      fields: [{ key: "value", label: "Certificates" }],
      href: link("certificates"),
      data: fillSeries(
        periodKeys(
          filters,
          certificateDates.map((c) => c.issuedAt),
          now,
        ),
        grain,
        tally(certificateDates, (c) => bucketKey(c.issuedAt, grain)),
      ),
    },
  ];

  // One card per report for the overview: its headline tile first, then the
  // supporting ones. The flat `tiles` list stays for anything that wants it.
  const byKey = Object.fromEntries(tiles.map((t) => [t.key, t]));
  const cards = [
    {
      key: "requests",
      title: "Requests",
      href: link("requests"),
      tiles: [byKey.requests, byKey.pending],
    },
    {
      key: "learners",
      title: "Learners",
      href: link("learners"),
      tiles: [byKey.active, byKey.certified],
    },
    {
      key: "exams",
      title: "Exams",
      href: link("exams"),
      tiles: [byKey.passRate, byKey.attempts],
    },
    {
      key: "certificates",
      title: "Certificates",
      href: link("certificates"),
      tiles: [byKey.certificates, byKey.certificatesAll],
    },
    {
      key: "organisations",
      title: "Organisations",
      href: link("organisations"),
      tiles: [byKey.organisations, byKey.orgsCertified],
    },
  ];

  return { tiles, cards, series };
}
