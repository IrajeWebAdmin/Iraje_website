import "server-only";
import { prisma } from "@/lib/prisma";
import { istDay, addDays } from "./filters.js";
import {
  bucketKey,
  bucketKeys,
  fillSeries,
  average,
  tally,
  topN,
} from "./buckets.js";
import { pageWindow } from "./paginate.js";
import { EXPORT_ROW_CAP } from "./export.js";
import {
  periodWhere,
  certWhere,
  learnerScopeWhere,
  learnerOrganizations,
  orgDisplayNames,
  orderByFor,
  tile,
  iso,
} from "./common.js";
import { getReportCatalog } from "./catalog.js";

// Certificates: what has been issued, what is still valid, what is about to
// lapse. "Expired" is derived (status valid but past its expiry date), so the
// status filter and the table both work on the derived value.

const DAY_MS = 86_400_000;

export const definition = {
  slug: "certificates",
  tableTitle: "Certificates",
  title: "Certificates",
  subtitle: "What has been issued, what is valid, and what is about to lapse.",
  statuses: [
    { value: "valid", label: "Valid" },
    { value: "expired", label: "Expired" },
    { value: "revoked", label: "Revoked" },
  ],
  sorts: {
    certificateNo: "certificateNo",
    holderName: "holderName",
    certificationCode: "certificationCode",
    scorePercentage: "scorePercentage",
    issuedAt: "issuedAt",
    expiresAt: "expiresAt",
  },
  defaultSort: "issuedAt",
  defaultDir: "desc",
  groupBys: [
    { value: "certification", label: "Certification" },
    { value: "organization", label: "Organisation" },
    { value: "country", label: "Country" },
    { value: "status", label: "Status" },
  ],
  defaultGroupBy: "certification",
  fields: ["range", "grain", "cert", "status", "country", "org", "q", "by"],
  qPlaceholder: "Holder, email or certificate no.",
  columns: [
    {
      key: "certificateNo",
      label: "Certificate No.",
      kind: "text",
      sortable: true,
    },
    { key: "holderName", label: "Holder", kind: "text", sortable: true },
    { key: "email", label: "Email", kind: "text" },
    { key: "organization", label: "Organisation", kind: "orgLink" },
    { key: "certification", label: "Certification", kind: "text" },
    {
      key: "scorePercentage",
      label: "Score",
      kind: "percent",
      align: "right",
      sortable: true,
    },
    { key: "issuedAt", label: "Issued", kind: "date", sortable: true },
    { key: "expiresAt", label: "Expires", kind: "date", sortable: true },
    { key: "daysToExpiry", label: "Days Left", kind: "number", align: "right" },
    { key: "status", label: "Status", kind: "status" },
    { key: "download", label: "PDF", kind: "link" },
  ],
  exportColumns: [
    { key: "certificateNo", header: "Certificate no.", width: 22 },
    { key: "holderName", header: "Holder", width: 24 },
    { key: "email", header: "Email", width: 30 },
    { key: "organization", header: "Organisation", width: 24 },
    { key: "country", header: "Country", width: 16 },
    { key: "certification", header: "Certification", width: 30 },
    { key: "certificationCode", header: "Code", width: 10 },
    { key: "scorePercentage", header: "Score %", kind: "number", width: 10 },
    { key: "issuedAt", header: "Issued", kind: "date", width: 14 },
    { key: "expiresAt", header: "Expires", kind: "date", width: 14 },
    {
      key: "daysToExpiry",
      header: "Days to expiry",
      kind: "number",
      width: 12,
    },
    { key: "status", header: "Status", width: 10 },
  ],
};

const STATUS_LABELS = {
  valid: "Valid",
  expired: "Expired",
  revoked: "Revoked",
};

/** The derived status: revoked, expired (valid but past its date) or valid. */
function derivedStatus(c, now) {
  if (c.status === "revoked") return "revoked";
  return new Date(c.expiresAt) <= now ? "expired" : "valid";
}

function statusFragment(status, now) {
  if (status === "revoked") return { status: "revoked" };
  if (status === "expired") return { status: "valid", expiresAt: { lte: now } };
  return { status: "valid", expiresAt: { gt: now } };
}

/** Everything except the period and the status (shared by the all-time tiles). */
function scopeWhere(filters) {
  const and = [certWhere("certificationCode", filters)];
  const scope = learnerScopeWhere(filters);
  if (Object.keys(scope).length) and.push({ userCertification: scope });
  if (filters.q) {
    and.push({
      OR: [
        { holderName: { contains: filters.q } },
        { certificateNo: { contains: filters.q } },
        { userCertification: { user: { email: { contains: filters.q } } } },
      ],
    });
  }
  return { AND: and.filter((f) => Object.keys(f).length) };
}

function baseWhere(filters, now) {
  const where = scopeWhere(filters);
  const period = periodWhere("issuedAt", filters);
  if (Object.keys(period).length) where.AND.push(period);
  if (filters.statuses.length)
    where.AND.push({ OR: filters.statuses.map((s) => statusFragment(s, now)) });
  return where;
}

const PAGE_SELECT = {
  id: true,
  certificateNo: true,
  holderName: true,
  certificationCode: true,
  certificationTitle: true,
  scorePercentage: true,
  issuedAt: true,
  expiresAt: true,
  status: true,
  userCertification: {
    select: { userId: true, user: { select: { email: true } } },
  },
};

function toRow(c, now, orgs, catalog) {
  const org = orgs.get(c.userCertification?.userId) ?? null;
  return {
    id: c.id,
    certificateNo: c.certificateNo,
    download: {
      href: `/api/certificates/${c.certificateNo}/pdf`,
      label: "PDF",
    },
    holderName: c.holderName,
    email: c.userCertification?.user?.email ?? null,
    organization: org?.organization ?? null,
    orgKey: org?.orgKey ?? null,
    country: org?.country ?? null,
    certification: catalog.certName(c.certificationCode),
    certificationCode: c.certificationCode,
    scorePercentage: c.scorePercentage,
    issuedAt: iso(c.issuedAt),
    expiresAt: iso(c.expiresAt),
    daysToExpiry: Math.ceil((new Date(c.expiresAt) - now) / DAY_MS),
    status: derivedStatus(c, now),
  };
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
  const where = baseWhere(filters, now);
  const scope = scopeWhere(filters);
  const in90 = new Date(now.getTime() + 90 * DAY_MS);
  const in12m = new Date(now.getTime() + 365 * DAY_MS);
  const orderBy = orderByFor(definition.sorts[filters.sort], filters.dir);
  const countWhere = (extra) => ({ AND: [...scope.AND, extra] });

  const [
    total,
    inRange,
    validCount,
    expiringCount,
    upcoming,
    firstPage,
    catalog,
  ] = await Promise.all([
    prisma.certificate.count({ where }),
    prisma.certificate.findMany({
      where,
      select: {
        certificationCode: true,
        scorePercentage: true,
        issuedAt: true,
        expiresAt: true,
        status: true,
        userCertification: { select: { userId: true } },
      },
    }),
    prisma.certificate.count({
      where: countWhere(statusFragment("valid", now)),
    }),
    prisma.certificate.count({
      where: countWhere({ status: "valid", expiresAt: { gt: now, lte: in90 } }),
    }),
    prisma.certificate.findMany({
      where: countWhere({
        status: "valid",
        expiresAt: { gt: now, lte: in12m },
      }),
      select: { expiresAt: true },
    }),
    prisma.certificate.findMany({
      where,
      orderBy,
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      select: PAGE_SELECT,
    }),
    getReportCatalog(),
  ]);

  const window = pageWindow({
    page: filters.page,
    pageSize: filters.pageSize,
    total,
  });
  const pageRows =
    window.page === filters.page
      ? firstPage
      : await prisma.certificate.findMany({
          where,
          orderBy,
          skip: window.skip,
          take: window.take,
          select: PAGE_SELECT,
        });

  // One organisation lookup covers the page (a subset of the in-range rows).
  const orgs = await learnerOrganizations(
    inRange.map((c) => c.userCertification?.userId),
  );

  // ---- Tiles ----
  const tiles = [
    tile("issued", "Issued", total),
    tile("valid", "Valid", validCount, "number", "all time"),
    tile(
      "expiring",
      "Expiring in 90 days",
      expiringCount,
      "number",
      "all time",
    ),
    tile(
      "averageScore",
      "Average score",
      average(inRange.map((c) => c.scorePercentage)),
      "percent",
    ),
  ];

  // ---- Series ----
  const grain = filters.grain;
  const issuedKeys = spanKeys(
    filters,
    inRange.map((c) => c.issuedAt),
    now,
  );
  const monthKeys = bucketKeys(istDay(now), addDays(istDay(now), 365), "month");
  const series = [
    {
      key: "issued",
      title: "Certificates issued",
      kind: "area",
      grain,
      fields: [{ key: "value", label: "Issued" }],
      data: fillSeries(
        issuedKeys,
        grain,
        tally(inRange, (c) => bucketKey(c.issuedAt, grain)),
      ),
    },
    {
      key: "expiring",
      title: "Expiring in the next 12 months",
      kind: "bar",
      grain: "month",
      fields: [{ key: "value", label: "Expiring" }],
      data: fillSeries(
        monthKeys,
        "month",
        tally(upcoming, (c) => bucketKey(c.expiresAt, "month")),
      ),
    },
  ];

  // ---- Distributions ----
  const countBy = (keyOf) => {
    const m = new Map();
    for (const c of inRange) {
      const k = keyOf(c);
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
  if (filters.groupBy === "organization") {
    const byOrg = countBy((c) => orgs.get(c.userCertification?.userId)?.orgKey);
    const names = await orgDisplayNames([...byOrg.keys()]);
    selected = {
      key: "organization",
      title: "By organisation",
      data: topN(
        toEntries(byOrg, (k) => names.get(k) ?? k),
        10,
      ),
    };
  } else if (filters.groupBy === "country") {
    selected = {
      key: "country",
      title: "By country",
      data: topN(
        toEntries(
          countBy((c) => orgs.get(c.userCertification?.userId)?.country),
        ),
        10,
      ),
    };
  } else if (filters.groupBy === "status") {
    selected = {
      key: "status",
      title: "By status",
      data: toEntries(
        countBy((c) => derivedStatus(c, now)),
        (s) => STATUS_LABELS[s] ?? s,
      ),
    };
  } else {
    selected = {
      key: "certification",
      title: "By certification",
      data: toEntries(
        countBy((c) => c.certificationCode),
        (code) => catalog.shortName(code),
      ),
    };
  }
  const distributions = [selected];

  return {
    tiles,
    series,
    distributions,
    table: { rows: pageRows.map((c) => toRow(c, now, orgs, catalog)), window },
    options: { certifications: catalog.options },
  };
}

/** Every matching row for a download, in the table's order (capped). */
export async function rows(filters) {
  const now = new Date();
  const [list, catalog] = await Promise.all([
    prisma.certificate.findMany({
      where: baseWhere(filters, now),
      orderBy: orderByFor(definition.sorts[filters.sort], filters.dir),
      take: EXPORT_ROW_CAP + 1,
      select: PAGE_SELECT,
    }),
    getReportCatalog(),
  ]);
  const orgs = await learnerOrganizations(
    list.map((c) => c.userCertification?.userId),
  );
  return list.map((c) => toRow(c, now, orgs, catalog));
}
