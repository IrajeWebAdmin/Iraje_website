import "server-only";
import { prisma } from "@/lib/prisma";
import { istDay } from "./filters.js";
import {
  bucketKey,
  bucketKeys,
  fillSeries,
  histogram,
  average,
  rate,
  tally,
  topN,
} from "./buckets.js";
import { paginateArray, sortRows } from "./paginate.js";
import { EXPORT_ROW_CAP } from "./export.js";
import {
  periodWhere,
  learnerScopeWhere,
  learnerOrganizations,
  orgDisplayNames,
  attemptOutcome,
  minutesBetween,
  tile,
  iso,
} from "./common.js";
import { getReportCatalog } from "./catalog.js";

// Exams: how attempts are going. The outcome of a sitting (passed, failed,
// timed out, in progress) is derived from several columns, so the outcome
// filter, sorting and paging run in memory over a date-bounded select. The
// frozen paper is never selected; answers only to count them.

const OUTCOME_LABELS = {
  passed: "Passed",
  failed: "Failed",
  timed_out: "Timed out",
  in_progress: "In progress",
};
const COMPLETED = new Set(["passed", "failed", "timed_out"]);
const SCORED = new Set(["passed", "failed"]);
const SCORE_BANDS = [
  { label: "0–49%", min: 0, max: 49 },
  { label: "50–59%", min: 50, max: 59 },
  { label: "60–69%", min: 60, max: 69 },
  { label: "70–79%", min: 70, max: 79 },
  { label: "80–89%", min: 80, max: 89 },
  { label: "90–100%", min: 90, max: 100 },
];

export const definition = {
  slug: "exams",
  tableTitle: "Exam sittings",
  title: "Exams",
  subtitle: "How attempts are going: pass rates, scores and time taken.",
  statuses: [
    { value: "passed", label: "Passed" },
    { value: "failed", label: "Failed" },
    { value: "timed_out", label: "Timed out" },
    { value: "in_progress", label: "In progress" },
  ],
  // Sorted in memory, so each value names the row field to sort by.
  sorts: {
    learner: "name",
    certification: "certificationCode",
    examSet: "examSet",
    startedAt: "startedAt",
    submittedAt: "submittedAt",
    score: "score",
    percentage: "percentage",
  },
  defaultSort: "startedAt",
  defaultDir: "desc",
  groupBys: [
    { value: "certification", label: "Certification" },
    { value: "outcome", label: "Outcome" },
    { value: "examSet", label: "Question set" },
    { value: "organization", label: "Organisation" },
  ],
  defaultGroupBy: "certification",
  fields: ["range", "grain", "cert", "status", "country", "org", "q", "by"],
  qPlaceholder: "Learner name or email",
  columns: [
    { key: "learner", label: "Learner", kind: "multiline", sortable: true },
    { key: "organization", label: "Organisation", kind: "orgLink" },
    {
      key: "certification",
      label: "Certification",
      kind: "text",
      sortable: true,
    },
    {
      key: "examSet",
      label: "Set",
      kind: "number",
      align: "right",
      sortable: true,
    },
    { key: "attemptNo", label: "Attempt", kind: "number", align: "right" },
    { key: "startedAt", label: "Started", kind: "datetime", sortable: true },
    {
      key: "submittedAt",
      label: "Submitted",
      kind: "datetime",
      sortable: true,
    },
    { key: "durationMin", label: "Minutes", kind: "number", align: "right" },
    {
      key: "score",
      label: "Score",
      kind: "number",
      align: "right",
      sortable: true,
    },
    { key: "total", label: "Out Of", kind: "number", align: "right" },
    {
      key: "percentage",
      label: "%",
      kind: "percent",
      align: "right",
      sortable: true,
    },
    { key: "answered", label: "Answered", kind: "number", align: "right" },
    { key: "outcome", label: "Result", kind: "status" },
  ],
  exportColumns: [
    { key: "id", header: "Attempt #", kind: "number", width: 10 },
    { key: "name", header: "Learner", width: 24 },
    { key: "email", header: "Email", width: 30 },
    { key: "organization", header: "Organisation", width: 24 },
    { key: "country", header: "Country", width: 16 },
    { key: "certification", header: "Certification", width: 30 },
    { key: "examSet", header: "Question set", kind: "number", width: 10 },
    { key: "attemptNo", header: "Attempt no.", kind: "number", width: 10 },
    { key: "startedAt", header: "Started", kind: "datetime", width: 20 },
    { key: "submittedAt", header: "Submitted", kind: "datetime", width: 20 },
    { key: "durationMin", header: "Minutes taken", kind: "number", width: 12 },
    { key: "score", header: "Score", kind: "number", width: 8 },
    { key: "total", header: "Out of", kind: "number", width: 8 },
    { key: "percentage", header: "Percentage", kind: "number", width: 10 },
    { key: "answered", header: "Answered", kind: "number", width: 10 },
    { key: "outcome", header: "Result", width: 12 },
  ],
};

function baseWhere(filters) {
  const uc = {};
  if (filters.certs.length) uc.certificationCode = { in: filters.certs };
  const scope = learnerScopeWhere(filters);
  if (scope.user) uc.user = { ...scope.user };
  if (filters.q) {
    uc.user = {
      ...(uc.user ?? {}),
      OR: [
        { name: { contains: filters.q } },
        { email: { contains: filters.q } },
      ],
    };
  }
  return {
    ...periodWhere("startedAt", filters),
    ...(Object.keys(uc).length ? { userCertification: uc } : {}),
  };
}

const SELECT = {
  id: true,
  examSet: true,
  startedAt: true,
  deadlineAt: true,
  submittedAt: true,
  score: true,
  total: true,
  percentage: true,
  passed: true,
  answers: true,
  userCertificationId: true,
  userCertification: {
    select: {
      userId: true,
      certificationCode: true,
      user: { select: { name: true, email: true } },
    },
  },
};

/**
 * Every attempt in scope as a finished row: outcome derived, attempt number
 * counted over the enrolment's whole history, organisation attached. The
 * outcome filter is applied here because it cannot be expressed in SQL.
 */
async function loadRows(filters, now) {
  const [attempts, catalog] = await Promise.all([
    prisma.examAttempt.findMany({ where: baseWhere(filters), select: SELECT }),
    getReportCatalog(),
  ]);
  const enrolmentIds = [...new Set(attempts.map((a) => a.userCertificationId))];
  const [history, orgs] = await Promise.all([
    enrolmentIds.length
      ? prisma.examAttempt.findMany({
          where: { userCertificationId: { in: enrolmentIds } },
          select: { id: true, userCertificationId: true, startedAt: true },
          orderBy: [{ startedAt: "asc" }, { id: "asc" }],
        })
      : [],
    learnerOrganizations(attempts.map((a) => a.userCertification?.userId)),
  ]);
  const attemptNo = new Map();
  const seen = new Map();
  for (const h of history) {
    const n = (seen.get(h.userCertificationId) ?? 0) + 1;
    seen.set(h.userCertificationId, n);
    attemptNo.set(h.id, n);
  }

  const nowMs = now.getTime();
  const rows = attempts.map((a) => {
    const outcome = attemptOutcome(a, nowMs);
    const user = a.userCertification?.user;
    const org = orgs.get(a.userCertification?.userId) ?? null;
    const scored = SCORED.has(outcome);
    return {
      id: a.id,
      enrolmentId: a.userCertificationId,
      learner: [user?.name, user?.email].filter(Boolean).join("\n"),
      name: user?.name ?? null,
      email: user?.email ?? null,
      organization: org?.organization ?? null,
      orgKey: org?.orgKey ?? null,
      country: org?.country ?? null,
      certification: catalog.certName(a.userCertification?.certificationCode),
      certificationCode: a.userCertification?.certificationCode ?? null,
      examSet: a.examSet,
      attemptNo: attemptNo.get(a.id) ?? null,
      startedAt: iso(a.startedAt),
      submittedAt: iso(a.submittedAt),
      durationMin: scored ? minutesBetween(a.startedAt, a.submittedAt) : null,
      score: scored ? a.score : null,
      total: a.total ?? null,
      percentage: scored ? a.percentage : null,
      answered: Object.keys(a.answers ?? {}).length,
      outcome,
    };
  });
  const wanted = new Set(filters.statuses);
  const filtered = wanted.size
    ? rows.filter((r) => wanted.has(r.outcome))
    : rows;
  return { rows: filtered, catalog };
}

function spanKeys(filters, dates, now) {
  let { from, to } = filters;
  if (!from || !to) {
    const days = dates.filter(Boolean).map((d) => istDay(new Date(d)));
    if (days.length === 0) return [];
    from = days.reduce((a, b) => (a < b ? a : b));
    to = istDay(now);
  }
  return bucketKeys(from, to, filters.grain);
}

export async function report(filters) {
  const now = new Date();
  const { rows: all, catalog } = await loadRows(filters, now);

  // ---- Tiles ----
  const completed = all.filter((r) => COMPLETED.has(r.outcome));
  const passed = all.filter((r) => r.outcome === "passed");
  const scored = all.filter((r) => SCORED.has(r.outcome));
  const open = all.length - completed.length;
  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

  const tiles = [
    tile(
      "completed",
      "Exams finished",
      completed.length,
      "number",
      open
        ? `plus ${plural(open, "sitting")} still open`
        : "passed, failed or timed out",
    ),
    tile(
      "passRate",
      "Pass rate",
      rate(passed.length, completed.length),
      "percent",
      `${passed.length} of ${completed.length} finished`,
    ),
    tile(
      "averageScore",
      "Average score",
      average(scored.map((r) => r.percentage)),
      "percent",
    ),
    tile(
      "averageDuration",
      "Average time taken",
      average(scored.map((r) => r.durationMin)),
      "minutes",
    ),
  ];

  // ---- Series ----
  const grain = filters.grain;
  const keys = spanKeys(
    filters,
    all.map((r) => r.startedAt),
    now,
  );
  // Average mark of the sittings begun in each bucket.
  const scoreByKey = new Map();
  for (const r of scored) {
    const k = bucketKey(r.startedAt, grain);
    if (!k) continue;
    const b = scoreByKey.get(k) ?? { sum: 0, n: 0 };
    b.sum += r.percentage;
    b.n += 1;
    scoreByKey.set(k, b);
  }
  const averageByKey = new Map(
    [...scoreByKey].map(([k, b]) => [
      k,
      { value: Math.round((b.sum / b.n) * 10) / 10 },
    ]),
  );
  const series = [
    {
      key: "attempts",
      title: "Exams started, by result",
      kind: "bar",
      grain,
      fields: [
        { key: "passed", label: "Passed" },
        { key: "failed", label: "Failed" },
        { key: "timedOut", label: "Timed out" },
      ],
      data: fillSeries(
        keys,
        grain,
        tally(
          completed,
          (r) => bucketKey(r.startedAt, grain),
          (r) => (r.outcome === "timed_out" ? "timedOut" : r.outcome),
        ),
        ["passed", "failed", "timedOut"],
      ),
    },
    {
      key: "averageScore",
      title: "Average score",
      subtitle: "Average mark of the sittings begun in each period",
      kind: "area",
      grain,
      fields: [{ key: "value", label: "Average %" }],
      data: fillSeries(keys, grain, averageByKey),
      valueSuffix: "%",
    },
  ];

  // ---- Distributions ----
  const countBy = (keyOf, source = all) => {
    const m = new Map();
    for (const r of source) {
      const k = keyOf(r);
      if (k == null || k === "") continue;
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  };
  const toEntries = (m, nameOf = (k) => k) =>
    [...m]
      .map(([k, v]) => ({ name: nameOf(k), value: v }))
      .sort((a, b) => b.value - a.value);

  let selected;
  if (filters.groupBy === "outcome") {
    selected = {
      key: "outcome",
      title: "By outcome",
      data: toEntries(
        countBy((r) => r.outcome),
        (o) => OUTCOME_LABELS[o] ?? o,
      ),
    };
  } else if (filters.groupBy === "examSet") {
    selected = {
      key: "examSet",
      title: "By question set",
      data: toEntries(
        countBy((r) => r.examSet),
        (s) => `Set ${s}`,
      ),
    };
  } else if (filters.groupBy === "organization") {
    const byOrg = countBy((r) => r.orgKey);
    const names = await orgDisplayNames([...byOrg.keys()]);
    selected = {
      key: "organization",
      title: "By organisation",
      data: topN(
        toEntries(byOrg, (k) => names.get(k) ?? k),
        10,
      ),
    };
  } else {
    selected = {
      key: "certification",
      title: "By certification",
      data: toEntries(
        countBy((r) => r.certificationCode),
        (c) => catalog.shortName(c),
      ),
    };
  }
  const distributions = [
    selected,
    {
      key: "scoreBands",
      title: "Score bands",
      subtitle: "Finished sittings by the mark they scored",
      data: histogram(
        scored.map((r) => r.percentage),
        SCORE_BANDS,
      ),
    },
  ];

  // ---- Table (sorted and paged in memory) ----
  const sorted = sortRows(all, definition.sorts[filters.sort], filters.dir);
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

/** Every matching row for a download, in the table's order (capped). */
export async function rows(filters) {
  const { rows: all } = await loadRows(filters, new Date());
  return sortRows(all, definition.sorts[filters.sort], filters.dir).slice(
    0,
    EXPORT_ROW_CAP + 1,
  );
}
