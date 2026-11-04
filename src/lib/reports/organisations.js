import "server-only";
import { prisma } from "@/lib/prisma";
import { buildOutline } from "@/lib/learning";
import { courseState } from "@/lib/dashboard";
import { parseCertList } from "@/lib/certCodes";
import { organizationKey } from "@/lib/organizations";
import { getReportCatalog } from "./catalog";
import {
  certWhere,
  countryWhere,
  iso,
  orgDisplayNames,
  periodWhere,
  statusWhere,
  tile,
} from "./common";
import { bucketKey, fillSeries, median, rate, tally, topN } from "./buckets";
import { paginateArray, sortRows } from "./paginate";
import { EXPORT_ROW_CAP } from "./export";
import { periodKeys } from "./periodKeys";

// Organisation analytics. Requests carry a cleaned organisation key, so the
// rows here are built in memory from one bounded select of requests plus the
// learning records of the people in them. A person is a distinct e-mail
// within an organisation; a learner is a person with an account; someone who
// requested under two spellings that clean to different keys appears under
// both.

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

export const definition = {
  slug: "organisations",
  tableTitle: "Organisations",
  title: "Organisations",
  subtitle:
    "Which organisations send people for certification, and what they do with it.",
  statuses: [],
  sorts: {
    name: "name",
    people: "people",
    requests: "requests",
    approved: "approved",
    pending: "pending",
    learners: "learners",
    certified: "certified",
    lastRequest: "lastRequest",
  },
  defaultSort: "people",
  defaultDir: "desc",
  groupBys: [
    { value: "people", label: "Top organisations by people" },
    { value: "certified", label: "Top organisations by certified people" },
    { value: "certification", label: "Most-requested certifications" },
    { value: "country", label: "Country" },
  ],
  defaultGroupBy: "people",
  fields: ["range", "grain", "cert", "country", "q", "by"],
  qPlaceholder: "Organisation name",
  columns: [
    { key: "name", label: "Organisation", kind: "orgLink", sortable: true },
    {
      key: "people",
      label: "People",
      kind: "number",
      align: "right",
      sortable: true,
    },
    {
      key: "requests",
      label: "Requests",
      kind: "number",
      align: "right",
      sortable: true,
    },
    {
      key: "approved",
      label: "Approved",
      kind: "number",
      align: "right",
      sortable: true,
    },
    {
      key: "pending",
      label: "Pending",
      kind: "number",
      align: "right",
      sortable: true,
    },
    {
      key: "learners",
      label: "Learners",
      kind: "number",
      align: "right",
      sortable: true,
    },
    { key: "inProgress", label: "In Progress", kind: "number", align: "right" },
    {
      key: "certified",
      label: "Certified",
      kind: "number",
      align: "right",
      sortable: true,
    },
    { key: "topCertification", label: "Top Certification", kind: "text" },
    { key: "countries", label: "Countries", kind: "list" },
    { key: "lastRequest", label: "Last Request", kind: "date", sortable: true },
  ],
  exportColumns: [
    { key: "name", header: "Organisation", width: 28 },
    { key: "key", header: "Key", width: 20 },
    { key: "people", header: "People", width: 10 },
    { key: "requests", header: "Requests", width: 10 },
    { key: "approved", header: "Approved", width: 10 },
    { key: "rejected", header: "Rejected", width: 10 },
    { key: "pending", header: "Pending", width: 10 },
    { key: "approvalRate", header: "Approval rate %", width: 16 },
    { key: "learners", header: "Learners", width: 10 },
    { key: "inProgress", header: "In progress", width: 12 },
    { key: "passed", header: "Passed", width: 10 },
    { key: "certified", header: "Certified people", width: 16 },
    { key: "topCertification", header: "Top certification", width: 32 },
    { key: "countries", header: "Countries", width: 24 },
    { key: "firstSeen", header: "First request", kind: "date", width: 14 },
    { key: "lastRequest", header: "Last request", kind: "date", width: 14 },
  ],
};

const REQUEST_SELECT = {
  id: true,
  organizationKey: true,
  organization: true,
  name: true,
  email: true,
  designation: true,
  status: true,
  certificationCode: true,
  certifications: true,
  country: true,
  userId: true,
  createdAt: true,
};

/** Requests in the period, narrowed by certification, country and name search. */
function requestWhere(filters) {
  const where = {
    ...periodWhere("createdAt", filters),
    ...certWhere("certificationCode", filters),
    ...countryWhere(filters),
    organizationKey: { not: "" },
  };
  const terms = [filters.org, filters.q].filter(Boolean).map(organizationKey);
  if (terms.length)
    where.AND = terms.map((t) => ({ organizationKey: { contains: t } }));
  return where;
}

const unique = (xs) => [...new Set(xs.filter((x) => x != null))];

async function learningFor(userIds) {
  if (userIds.length === 0) return new Map();
  const rows = await prisma.userCertification.findMany({
    where: { userId: { in: userIds } },
    select: {
      userId: true,
      certificationCode: true,
      status: true,
      certificate: { select: { status: true } },
    },
  });
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r.userId)) map.set(r.userId, []);
    map.get(r.userId).push(r);
  }
  return map;
}

function mostCommon(counts) {
  let best = null;
  for (const [name, n] of counts)
    if (!best || n > best.n || (n === best.n && name < best.name))
      best = { name, n };
  return best?.name ?? null;
}

/** One finished row per organisation key, from the requests and learning records. */
function aggregate(requests, learning, names, catalog) {
  const orgs = new Map();
  for (const r of requests) {
    const key = r.organizationKey;
    const org =
      orgs.get(key) ??
      orgs
        .set(key, {
          key,
          people: new Set(),
          learnerIds: new Set(),
          requests: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
          codes: new Map(),
          countries: new Map(),
          firstSeen: null,
          lastSeen: null,
          createdAts: [],
        })
        .get(key);
    org.people.add(r.email.trim().toLowerCase());
    if (r.userId != null) org.learnerIds.add(r.userId);
    org.requests += 1;
    if (r.status === "approved") org.approved += 1;
    else if (r.status === "rejected") org.rejected += 1;
    else org.pending += 1;
    for (const code of parseCertList(r.certifications))
      org.codes.set(code, (org.codes.get(code) ?? 0) + 1);
    if (r.country)
      org.countries.set(r.country, (org.countries.get(r.country) ?? 0) + 1);
    if (r.createdAt) {
      org.createdAts.push(r.createdAt);
      if (!org.firstSeen || r.createdAt < org.firstSeen)
        org.firstSeen = r.createdAt;
      if (!org.lastSeen || r.createdAt > org.lastSeen)
        org.lastSeen = r.createdAt;
    }
  }

  return [...orgs.values()].map((org) => {
    let inProgress = 0;
    let passed = 0;
    const certifiedPeople = new Set();
    for (const userId of org.learnerIds) {
      for (const uc of learning.get(userId) ?? []) {
        if (uc.status === "in_progress") inProgress += 1;
        if (uc.status === "passed") passed += 1;
        if (uc.certificate?.status === "valid") certifiedPeople.add(userId);
      }
    }
    const topCode = mostCommon(org.codes);
    return {
      id: org.key,
      key: org.key,
      orgKey: org.key,
      name: names.get(org.key) ?? org.key,
      people: org.people.size,
      requests: org.requests,
      approved: org.approved,
      rejected: org.rejected,
      pending: org.pending,
      approvalRate: rate(org.approved, org.approved + org.rejected),
      learners: org.learnerIds.size,
      inProgress,
      passed,
      certified: certifiedPeople.size,
      topCode,
      topCertification: topCode ? catalog.certName(topCode) : null,
      modalCountry: mostCommon(org.countries),
      countries: [...org.countries.keys()].sort(),
      codes: [...org.codes],
      firstSeen: iso(org.firstSeen),
      lastRequest: iso(org.lastSeen),
    };
  });
}

async function load(filters) {
  const where = requestWhere(filters);
  const [catalog, requests] = await Promise.all([
    getReportCatalog(),
    prisma.enrollment.findMany({
      where,
      select: REQUEST_SELECT,
      orderBy: { id: "asc" },
    }),
  ]);
  const keys = unique(requests.map((r) => r.organizationKey));
  const [learning, names] = await Promise.all([
    learningFor(unique(requests.map((r) => r.userId))),
    orgDisplayNames(keys),
  ]);
  return {
    catalog,
    requests,
    rows: aggregate(requests, learning, names, catalog),
  };
}

export async function report(filters) {
  const now = new Date();
  const { catalog, requests, rows: all } = await load(filters);

  const grain = filters.grain;
  const axis = periodKeys(
    filters,
    requests.map((r) => r.createdAt),
    now,
  );
  const series = [
    {
      key: "requests",
      title: "Requests from organisations",
      kind: "area",
      grain,
      fields: [{ key: "value", label: "Requests" }],
      data: fillSeries(
        axis,
        grain,
        tally(requests, (r) => bucketKey(r.createdAt, grain)),
      ),
    },
  ];

  const codeCounts = new Map();
  for (const org of all)
    for (const [code, n] of org.codes)
      codeCounts.set(code, (codeCounts.get(code) ?? 0) + n);
  const breakdowns = {
    people: {
      key: "people",
      title: "Top organisations by people",
      data: topN(
        all.map((o) => ({ name: o.name, value: o.people })),
        10,
      ),
    },
    certified: {
      key: "certified",
      title: "Top organisations by certified people",
      data: topN(
        all
          .filter((o) => o.certified > 0)
          .map((o) => ({ name: o.name, value: o.certified })),
        10,
      ),
    },
    certification: {
      key: "certification",
      title: "Most-requested certifications",
      data: [...codeCounts]
        .map(([code, value]) => ({ name: catalog.shortName(code), value }))
        .sort((a, b) => b.value - a.value),
    },
    country: {
      key: "country",
      title: "By country",
      data: topN(
        [...tally(all, (o) => o.modalCountry ?? "Unknown")].map(
          ([name, v]) => ({
            name,
            value: v.value,
          }),
        ),
        10,
      ),
    },
  };
  const selected = breakdowns[filters.groupBy] ?? breakdowns.people;
  const distributions = [
    selected,
    ...["certification"]
      .filter((k) => k !== selected.key)
      .map((k) => breakdowns[k]),
  ];

  const totalRequests = all.reduce((s, o) => s + o.requests, 0);
  const top5 = [...all]
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 5)
    .reduce((s, o) => s + o.requests, 0);
  const largest = [...all].sort((a, b) => b.people - a.people)[0];
  const approved = all.reduce((s, o) => s + o.approved, 0);
  const rejected = all.reduce((s, o) => s + o.rejected, 0);
  const tiles = [
    tile("organisations", "Organisations", all.length, "number"),
    tile(
      "multi",
      "With 2+ people",
      all.filter((o) => o.people >= 2).length,
      "number",
    ),
    tile(
      "largest",
      "Largest organisation",
      largest ? `${largest.name} (${largest.people})` : "—",
      "text",
    ),
    tile(
      "median",
      "Median people per organisation",
      median(all.map((o) => o.people)),
      "number",
    ),
    tile("top5", "Requests from top 5", rate(top5, totalRequests), "percent"),
    // Secondary: the requests report already leads with this.
    {
      ...tile(
        "approval",
        "Approval rate",
        rate(approved, approved + rejected),
        "percent",
      ),
      secondary: true,
    },
  ];

  const sorted = sortRows(all, filters.sort, filters.dir, { tieBreak: "id" });
  const { rows: pageRows, ...window } = paginateArray(sorted, {
    page: filters.page,
    pageSize: filters.pageSize,
  });

  return {
    tiles,
    series,
    distributions,
    table: { rows: pageRows, window },
    options: { certifications: catalog.options },
  };
}

export async function rows(filters) {
  const { rows: all } = await load(filters);
  return sortRows(all, filters.sort, filters.dir, { tieBreak: "id" }).slice(
    0,
    EXPORT_ROW_CAP + 1,
  );
}

// ---- One organisation -------------------------------------------------------

export const detailDefinition = {
  slug: "organisation",
  title: "Organisation",
  subtitle: "People who requested or hold Iraje certifications.",
  statuses: [
    { value: "new", label: "New" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ],
  sorts: {
    name: "name",
    certification: "certification",
    requestStatus: "requestStatus",
    learningStatus: "learningStatus",
    lastActivity: "lastActivity",
    lastLogin: "lastLogin",
  },
  defaultSort: "name",
  defaultDir: "asc",
  groupBys: [],
  defaultGroupBy: null,
  fields: ["range", "cert", "status"],
  qPlaceholder: "",
  columns: [
    { key: "name", label: "Person", kind: "text", sortable: true },
    { key: "email", label: "Email", kind: "text" },
    { key: "designation", label: "Designation", kind: "text" },
    { key: "country", label: "Country", kind: "text" },
    {
      key: "certification",
      label: "Certification",
      kind: "text",
      sortable: true,
    },
    { key: "requestStatus", label: "Request", kind: "status", sortable: true },
    {
      key: "learningStatus",
      label: "Learning",
      kind: "status",
      sortable: true,
    },
    { key: "modules", label: "Modules", kind: "progress" },
    {
      key: "lastActivity",
      label: "Last Activity",
      kind: "datetime",
      sortable: true,
    },
    { key: "lastLogin", label: "Last Login", kind: "datetime", sortable: true },
  ],
  exportColumns: [
    { key: "name", header: "Person", width: 24 },
    { key: "email", header: "Email", width: 30 },
    { key: "designation", header: "Designation", width: 20 },
    { key: "country", header: "Country", width: 16 },
    { key: "code", header: "Code", width: 10 },
    { key: "certification", header: "Certification", width: 32 },
    { key: "requestStatus", header: "Request status", width: 16 },
    { key: "learningStatusLabel", header: "Learning status", width: 16 },
    { key: "modulesDone", header: "Modules done", width: 14 },
    { key: "modulesTotal", header: "Modules total", width: 14 },
    {
      key: "lastActivity",
      header: "Last activity",
      kind: "datetime",
      width: 20,
    },
    { key: "lastLogin", header: "Last login", kind: "datetime", width: 20 },
  ],
};

async function loadDetail(key, filters) {
  const [catalog, meta, requests, spellings, countryRows] = await Promise.all([
    getReportCatalog(),
    prisma.enrollment.aggregate({
      where: { organizationKey: key },
      _count: { _all: true },
      _min: { createdAt: true },
      _max: { createdAt: true },
    }),
    prisma.enrollment.findMany({
      where: {
        organizationKey: key,
        ...periodWhere("createdAt", filters),
        ...certWhere("certificationCode", filters),
        ...statusWhere("status", filters),
        ...countryWhere(filters),
      },
      select: { ...REQUEST_SELECT, reviewedAt: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    }),
    prisma.enrollment.groupBy({
      by: ["organization"],
      where: { organizationKey: key },
      _count: { _all: true },
    }),
    prisma.enrollment.findMany({
      where: { organizationKey: key },
      select: { country: true },
      distinct: ["country"],
    }),
  ]);
  if (meta._count._all === 0) return null;

  const userIds = unique(requests.map((r) => r.userId));
  const learning = userIds.length
    ? await prisma.userCertification.findMany({
        where: { userId: { in: userIds } },
        select: {
          id: true,
          userId: true,
          certificationCode: true,
          status: true,
          startedAt: true,
          completedAt: true,
          progress: {
            select: { moduleId: true, readAt: true, checkPassedAt: true },
          },
          examAttempts: {
            select: { startedAt: true },
            orderBy: { startedAt: "desc" },
            take: 1,
          },
          certificate: { select: { status: true } },
          user: {
            select: {
              name: true,
              email: true,
              lastLoginAt: true,
              status: true,
            },
          },
        },
      })
    : [];

  const spellingRows = [...spellings].sort(
    (a, b) =>
      b._count._all - a._count._all ||
      a.organization.length - b.organization.length,
  );
  const organisation = {
    key,
    name: spellingRows[0]?.organization ?? key,
    spellings: spellingRows.map((s) => s.organization),
    countries: countryRows
      .map((c) => c.country)
      .filter(Boolean)
      .sort(),
    firstSeen: iso(meta._min.createdAt),
    lastSeen: iso(meta._max.createdAt),
  };
  return { catalog, requests, learning, organisation };
}

function latest(dates) {
  const times = dates
    .filter(Boolean)
    .map((d) => new Date(d).getTime())
    .filter(Number.isFinite);
  return times.length ? new Date(Math.max(...times)) : null;
}

/** One row per person per certification: their request and their learning. */
function peopleRows({ catalog, requests, learning }) {
  const people = new Map();
  for (const r of requests) {
    const email = r.email.trim().toLowerCase();
    const person =
      people.get(email) ??
      people
        .set(email, {
          email,
          name: r.name,
          designation: r.designation ?? null,
          country: r.country ?? null,
          userId: r.userId ?? null,
          requests: [],
        })
        .get(email);
    // Requests arrive newest first, so the first one wins the person's details.
    person.designation ??= r.designation ?? null;
    person.userId ??= r.userId ?? null;
    person.requests.push({
      status: r.status,
      codes: parseCertList(r.certifications),
    });
  }
  const learningByUser = new Map();
  for (const uc of learning) {
    if (!learningByUser.has(uc.userId))
      learningByUser.set(uc.userId, new Map());
    learningByUser.get(uc.userId).set(uc.certificationCode, uc);
  }

  const rows = [];
  for (const person of people.values()) {
    const learned = person.userId ? learningByUser.get(person.userId) : null;
    const codes = unique([
      ...person.requests.flatMap((q) => q.codes),
      ...(learned ? [...learned.keys()] : []),
    ]);
    for (const code of codes) {
      const request = person.requests.find((q) => q.codes.includes(code));
      const uc = learned?.get(code) ?? null;
      let learningStatus = null;
      let modules = { done: 0, total: 0, percent: 0 };
      let lastActivity = null;
      if (uc) {
        const mods = catalog.modulesFor(code);
        const outline = mods.length ? buildOutline(mods, uc.progress) : null;
        const state = courseState(uc, outline);
        learningStatus = state;
        modules = {
          done: outline?.completed ?? 0,
          total: outline?.total ?? 0,
          percent: outline?.percent ?? 0,
        };
        lastActivity = latest([
          ...uc.progress.flatMap((p) => [p.readAt, p.checkPassedAt]),
          uc.examAttempts[0]?.startedAt,
          uc.user.lastLoginAt,
        ]);
      }
      rows.push({
        id: `${person.email}|${code}`,
        name: person.name,
        email: person.email,
        designation: person.designation,
        country: person.country,
        code,
        certification: catalog.certName(code),
        requestStatus: request?.status ?? null,
        learningStatus: learningStatus ? STATE_STATUS[learningStatus] : null,
        learningStatusLabel: learningStatus
          ? STATE_LABEL[learningStatus]
          : null,
        modules,
        modulesDone: modules.done,
        modulesTotal: modules.total,
        lastActivity: iso(lastActivity),
        lastLogin: iso(uc?.user.lastLoginAt),
        certificateStatus: uc?.certificate?.status ?? null,
      });
    }
  }
  return rows;
}

export async function detail(key, filters) {
  const now = new Date();
  const loaded = await loadDetail(key, filters);
  if (!loaded) return null;
  const { catalog, requests, learning, organisation } = loaded;
  const all = peopleRows(loaded);

  const people = new Set(requests.map((r) => r.email.trim().toLowerCase()));
  const learners = new Set(
    requests.map((r) => r.userId).filter((id) => id != null),
  );
  const approved = requests.filter((r) => r.status === "approved").length;
  const rejected = requests.filter((r) => r.status === "rejected").length;
  const mine = learning.filter((uc) => learners.has(uc.userId));
  const certifiedPeople = new Set(
    mine
      .filter((uc) => uc.certificate?.status === "valid")
      .map((uc) => uc.userId),
  );
  const tiles = [
    tile("people", "People", people.size, "number"),
    tile("requests", "Requests", requests.length, "number"),
    tile(
      "approval",
      "Approval rate",
      rate(approved, approved + rejected),
      "percent",
    ),
    tile(
      "inProgress",
      "In progress",
      mine.filter((uc) => uc.status === "in_progress").length,
      "number",
    ),
    tile("certified", "Certified", certifiedPeople.size, "number"),
    // Secondary: shown behind "more figures" so the page leads with five.
    {
      ...tile("learners", "Learners", learners.size, "number"),
      secondary: true,
    },
    {
      ...tile(
        "passed",
        "Passed",
        mine.filter((uc) => uc.status === "passed").length,
        "number",
      ),
      secondary: true,
    },
  ];

  const grain = filters.grain;
  const axis = periodKeys(
    filters,
    [organisation.firstSeen, ...requests.map((r) => r.createdAt)],
    now,
  );
  const series = [
    {
      key: "requests",
      title: "Requests over time",
      kind: "area",
      grain,
      fields: [{ key: "value", label: "Requests" }],
      data: fillSeries(
        axis,
        grain,
        tally(requests, (r) => bucketKey(r.createdAt, grain)),
      ),
    },
  ];

  const requested = new Map();
  for (const r of requests)
    for (const code of parseCertList(r.certifications))
      requested.set(code, (requested.get(code) ?? 0) + 1);
  const completed = new Map();
  for (const uc of mine)
    if (uc.status === "passed")
      completed.set(
        uc.certificationCode,
        (completed.get(uc.certificationCode) ?? 0) + 1,
      );
  const toRows = (map) =>
    [...map]
      .map(([code, value]) => ({ name: catalog.shortName(code), value }))
      .sort((a, b) => b.value - a.value);
  const distributions = [
    {
      key: "requested",
      title: "Certifications requested",
      data: toRows(requested),
    },
    {
      key: "completed",
      title: "Certifications completed",
      data: toRows(completed),
    },
    {
      key: "status",
      title: "Request status",
      data: [
        { name: "Approved", value: approved },
        { name: "Pending", value: requests.length - approved - rejected },
        { name: "Rejected", value: rejected },
      ],
    },
  ];

  const sorted = sortRows(all, filters.sort, filters.dir, { tieBreak: "id" });
  const { rows: pageRows, ...window } = paginateArray(sorted, {
    page: filters.page,
    pageSize: filters.pageSize,
  });
  return {
    organisation,
    tiles,
    series,
    distributions,
    table: { rows: pageRows, window },
    options: { certifications: catalog.options },
  };
}

export async function detailRows(key, filters) {
  const loaded = await loadDetail(key, filters);
  if (!loaded) return [];
  return sortRows(peopleRows(loaded), filters.sort, filters.dir, {
    tieBreak: "id",
  }).slice(0, EXPORT_ROW_CAP + 1);
}
