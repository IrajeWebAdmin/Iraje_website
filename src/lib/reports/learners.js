import "server-only";
import { prisma } from "@/lib/prisma";
import { buildOutline } from "@/lib/learning";
import { courseState } from "@/lib/dashboard";
import { getReportCatalog } from "./catalog";
import {
  certWhere,
  iso,
  learnerOrganizations,
  learnerScopeWhere,
  orderByFor,
  orgDisplayNames,
  periodWhere,
  statusWhere,
  tile,
} from "./common";
import { average, bucketKey, fillSeries, rate, tally, topN } from "./buckets";
import { pageWindow } from "./paginate";
import { EXPORT_ROW_CAP } from "./export";
import { periodKeys } from "./periodKeys";

// Learner progress: one row per learner per certification (a
// user_certifications row), with completion worked out by buildOutline() so
// the percentages match what the learner sees on their dashboard. Every
// number here is computed on the server; the page only prints it.

const STATE_LABEL = {
  certified: "Certified",
  examReady: "Exam ready",
  inProgress: "In progress",
  notStarted: "Not started",
  noContent: "No content yet",
  locked: "Locked",
};
const STATE_STATUS = {
  certified: "certified",
  examReady: "exam_ready",
  inProgress: "in_progress",
  notStarted: "not_started",
  noContent: "no_content",
  locked: "locked",
};
const RECENCY = [
  { label: "Last 7 days", max: 7 },
  { label: "8–30 days", max: 30 },
  { label: "31–90 days", max: 90 },
  { label: "Over 90 days", max: Infinity },
];
const DAY_MS = 86_400_000;

export const definition = {
  slug: "learners",
  title: "Learner progress",
  subtitle:
    "How far each learner has got with each certification, and who has stalled.",
  statuses: [
    { value: "in_progress", label: "In progress" },
    { value: "passed", label: "Passed" },
  ],
  sorts: {
    started: "startedAt",
    completed: "completedAt",
    name: "user.name",
    lastLogin: "user.lastLoginAt",
  },
  defaultSort: "started",
  defaultDir: "desc",
  groupBys: [
    { value: "certification", label: "Certification" },
    { value: "recency", label: "Last login" },
    { value: "country", label: "Country" },
    { value: "organisation", label: "Organisation" },
  ],
  defaultGroupBy: "certification",
  fields: ["range", "grain", "cert", "status", "country", "org", "q", "by"],
  qPlaceholder: "Search name or organisation",
  tableTitle: "Learners",
  // The learner cell shows the email under the name, so there is no email column.
  columns: [
    { key: "name", label: "Learner", kind: "person", sortable: true },
    { key: "organization", label: "Organisation", kind: "orgLink" },
    { key: "certification", label: "Certification", kind: "text" },
    { key: "modules", label: "Module Progress", kind: "progress" },
    { key: "lastActivity", label: "Last Active", kind: "day" },
    { key: "state", label: "Status", kind: "status" },
    {
      key: "started",
      label: "Started",
      sortLabel: "start date",
      kind: "date",
      sortable: true,
    },
    {
      key: "completed",
      label: "Completed",
      sortLabel: "completion date",
      kind: "date",
      sortable: true,
    },
    { key: "lastLogin", label: "Last Login", kind: "day", sortable: true },
    { key: "attempts", label: "Exam Attempts", kind: "number", align: "right" },
  ],
  exportColumns: [
    { key: "name", header: "Learner", width: 24 },
    { key: "email", header: "Email", width: 30 },
    { key: "organization", header: "Organisation", width: 24 },
    { key: "country", header: "Country", width: 16 },
    { key: "code", header: "Code", width: 10 },
    { key: "certification", header: "Certification", width: 32 },
    { key: "modulesDone", header: "Modules done", width: 14 },
    { key: "modulesTotal", header: "Modules total", width: 14 },
    { key: "percent", header: "Completion %", width: 14 },
    { key: "stateLabel", header: "Course state", width: 16 },
    { key: "status", header: "Learning status", width: 16 },
    { key: "started", header: "Started", kind: "date", width: 14 },
    { key: "completed", header: "Completed", kind: "date", width: 14 },
    {
      key: "lastActivity",
      header: "Last activity",
      kind: "datetime",
      width: 20,
    },
    { key: "lastLogin", header: "Last login", kind: "datetime", width: 20 },
    { key: "attempts", header: "Exam attempts", width: 14 },
    { key: "account", header: "Account", width: 12 },
  ],
};

const PAGE_SELECT = {
  id: true,
  userId: true,
  certificationCode: true,
  status: true,
  startedAt: true,
  completedAt: true,
  progress: { select: { moduleId: true, readAt: true, checkPassedAt: true } },
  user: {
    select: { name: true, email: true, status: true, lastLoginAt: true },
  },
  examAttempts: {
    select: { startedAt: true },
    orderBy: { startedAt: "desc" },
    take: 1,
  },
  _count: { select: { examAttempts: true } },
};

const AGGREGATE_SELECT = {
  id: true,
  userId: true,
  certificationCode: true,
  status: true,
  startedAt: true,
  completedAt: true,
  progress: { select: { moduleId: true, readAt: true, checkPassedAt: true } },
  user: { select: { lastLoginAt: true, status: true } },
};

/** Prisma `where` for the chosen filters, period applied to startedAt. */
function whereFor(filters, { withPeriod = true } = {}) {
  const scope = learnerScopeWhere(filters);
  const user = { role: "student", ...(scope.user ?? {}) };
  if (filters.q) {
    user.OR = [
      { name: { contains: filters.q } },
      { email: { contains: filters.q } },
    ];
  }
  return {
    ...(withPeriod ? periodWhere("startedAt", filters) : {}),
    ...certWhere("certificationCode", filters),
    ...statusWhere("status", filters),
    user,
  };
}

/** Outline and course state for one enrolment, from Sanity modules + progress. */
function assess(uc, catalog) {
  const modules = catalog.modulesFor(uc.certificationCode);
  const outline = modules.length ? buildOutline(modules, uc.progress) : null;
  return { outline, state: courseState(uc, outline) };
}

function latest(dates) {
  const times = dates
    .filter(Boolean)
    .map((d) => new Date(d).getTime())
    .filter(Number.isFinite);
  return times.length ? new Date(Math.max(...times)) : null;
}

function buildRow(uc, catalog, orgs) {
  const { outline, state } = assess(uc, catalog);
  const org = orgs.get(uc.userId);
  const lastActivity = latest([
    ...uc.progress.flatMap((p) => [p.readAt, p.checkPassedAt]),
    uc.examAttempts[0]?.startedAt,
    uc.user.lastLoginAt,
  ]);
  return {
    id: uc.id,
    name: uc.user.name,
    email: uc.user.email,
    orgKey: org?.orgKey ?? null,
    organization: org?.organization ?? null,
    country: org?.country ?? null,
    code: uc.certificationCode,
    certification: catalog.certName(uc.certificationCode),
    modules: {
      done: outline?.completed ?? 0,
      total: outline?.total ?? 0,
      percent: outline?.percent ?? 0,
    },
    modulesDone: outline?.completed ?? 0,
    modulesTotal: outline?.total ?? 0,
    percent: outline ? outline.percent : null,
    state: STATE_STATUS[state] ?? state,
    stateLabel: STATE_LABEL[state] ?? state,
    status: uc.status,
    started: iso(uc.startedAt),
    completed: iso(uc.completedAt),
    lastActivity: iso(lastActivity),
    lastLogin: iso(uc.user.lastLoginAt),
    attempts: uc._count.examAttempts,
    account: uc.user.status,
  };
}

const daysSince = (date, now) =>
  date ? Math.floor((now - new Date(date).getTime()) / DAY_MS) : null;

function countBy(rows, nameOf) {
  const counts = new Map();
  for (const row of rows) {
    const name = nameOf(row);
    if (name == null) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export async function report(filters) {
  const now = new Date();
  const where = whereFor(filters);
  const orderBy = orderByFor(definition.sorts[filters.sort], filters.dir);

  const [
    catalog,
    total,
    all,
    passedInPeriod,
    activeAccounts,
    neverSignedIn,
    statusGroups,
  ] = await Promise.all([
    getReportCatalog(),
    prisma.userCertification.count({ where }),
    prisma.userCertification.findMany({ where, select: AGGREGATE_SELECT }),
    prisma.userCertification.findMany({
      where: {
        ...whereFor(filters, { withPeriod: false }),
        status: "passed",
        ...periodWhere("completedAt", filters),
      },
      select: { completedAt: true },
    }),
    prisma.user.count({ where: { role: "student", status: "active" } }),
    prisma.user.count({ where: { role: "student", lastLoginAt: null } }),
    // Rows per learning status under the other filters, for the quick tabs
    // above the table ("All · 12", "In progress · 4", "Passed · 8").
    prisma.userCertification.groupBy({
      by: ["status"],
      where: whereFor({ ...filters, statuses: [] }),
      _count: { _all: true },
    }),
  ]);

  const window = pageWindow({
    page: filters.page,
    pageSize: filters.pageSize,
    total,
  });
  const [pageRows, orgs] = await Promise.all([
    prisma.userCertification.findMany({
      where,
      orderBy,
      skip: window.skip,
      take: window.take,
      select: PAGE_SELECT,
    }),
    learnerOrganizations(all.map((r) => r.userId)),
  ]);
  const orgNames = await orgDisplayNames(
    [...orgs.values()].map((o) => o.orgKey),
  );

  // Assess every enrolment in the period once; tiles and charts share it.
  const assessed = all.map((uc) => {
    const { outline, state } = assess(uc, catalog);
    const org = orgs.get(uc.userId);
    return {
      code: uc.certificationCode,
      state,
      percent: outline ? outline.percent : null,
      lastLoginAt: uc.user.lastLoginAt,
      country: org?.country ?? null,
      orgKey: org?.orgKey ?? null,
    };
  });
  const withModules = assessed.filter((a) => a.percent !== null);

  const grain = filters.grain;
  const keys = periodKeys(
    filters,
    [
      ...all.map((r) => r.startedAt),
      ...passedInPeriod.map((r) => r.completedAt),
    ],
    now,
  );
  const events = [
    ...all.map((r) => ({ at: r.startedAt, field: "started" })),
    ...passedInPeriod.map((r) => ({ at: r.completedAt, field: "completed" })),
  ];
  const series = [
    {
      key: "enrolments",
      title: "Courses started and completed",
      kind: "area",
      grain,
      fields: [
        { key: "started", label: "Started" },
        { key: "completed", label: "Completed" },
      ],
      data: fillSeries(
        keys,
        grain,
        tally(
          events,
          (e) => bucketKey(e.at, grain),
          (e) => e.field,
        ),
        ["started", "completed"],
      ),
    },
  ];

  const breakdowns = {
    certification: {
      key: "certification",
      title: "By certification",
      data: countBy(assessed, (a) => catalog.shortName(a.code)),
    },
    recency: {
      key: "recency",
      title: "Last login",
      data: [
        ...RECENCY.map((band, i) => ({
          name: band.label,
          value: assessed.filter((a) => {
            const d = daysSince(a.lastLoginAt, now.getTime());
            if (d === null) return false;
            const prev = i === 0 ? -1 : RECENCY[i - 1].max;
            return d > prev && d <= band.max;
          }).length,
        })),
        {
          name: "Never signed in",
          value: assessed.filter((a) => !a.lastLoginAt).length,
        },
      ],
    },
    country: {
      key: "country",
      title: "By country",
      data: topN(
        countBy(assessed, (a) => a.country ?? "Unknown"),
        10,
      ),
    },
    organisation: {
      key: "organisation",
      title: "By organisation",
      data: topN(
        countBy(assessed, (a) =>
          a.orgKey ? (orgNames.get(a.orgKey) ?? a.orgKey) : "Unknown",
        ),
        10,
      ),
    },
  };
  const selected = breakdowns[filters.groupBy] ?? breakdowns.certification;
  const distributions = [selected];

  const tiles = [
    tile(
      "accounts",
      "Active learner accounts",
      activeAccounts,
      "number",
      "all time",
    ),
    tile("started", "Enrolments started", total, "number"),
    tile("passed", "Passed", passedInPeriod.length, "number"),
    tile("never", "Never signed in", neverSignedIn, "number", "all time"),
    tile(
      "completion",
      "Average completion",
      average(withModules.map((a) => a.percent)),
      "percent",
      withModules.length
        ? `${withModules.length} enrolment${withModules.length === 1 ? "" : "s"} with content`
        : null,
    ),
  ];

  const countOf = (status) =>
    statusGroups.find((g) => g.status === status)?._count._all ?? 0;
  const statusCounts = [
    {
      value: "",
      label: "All",
      count: statusGroups.reduce((n, g) => n + g._count._all, 0),
    },
    ...definition.statuses.map((s) => ({
      value: s.value,
      label: s.label,
      count: countOf(s.value),
    })),
  ];

  return {
    tiles,
    series,
    distributions,
    statusCounts,
    table: { rows: pageRows.map((uc) => buildRow(uc, catalog, orgs)), window },
    options: { certifications: catalog.options },
  };
}

export async function rows(filters) {
  const where = whereFor(filters);
  const [catalog, list] = await Promise.all([
    getReportCatalog(),
    prisma.userCertification.findMany({
      where,
      orderBy: orderByFor(definition.sorts[filters.sort], filters.dir),
      take: EXPORT_ROW_CAP + 1,
      select: PAGE_SELECT,
    }),
  ]);
  const orgs = await learnerOrganizations(list.map((r) => r.userId));
  return list.map((uc) => buildRow(uc, catalog, orgs));
}

export { rate };
