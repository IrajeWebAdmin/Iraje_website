import "server-only";
import { prisma } from "@/lib/prisma";
import { parseCertList, displayCertCode } from "@/lib/certCodes";
import { istDay } from "./filters.js";
import {
  bucketKey,
  bucketKeys,
  fillSeries,
  rate,
  tally,
  topN,
} from "./buckets.js";
import { pageWindow } from "./paginate.js";
import { EXPORT_ROW_CAP } from "./export.js";
import {
  periodWhere,
  certWhere,
  statusWhere,
  orgWhere,
  countryWhere,
  nameEmailWhere,
  orgDisplayNames,
  orderByFor,
  hoursBetween,
  tile,
  iso,
} from "./common.js";
import { getReportCatalog } from "./catalog.js";

// Certification requests: who is asking, for what, and how fast we decide.
// Every number here is computed on the server from the enrolment table; the
// page only prints what comes back.

const STATUS_LABELS = {
  new: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export const definition = {
  slug: "requests",
  title: "Certification requests",
  subtitle:
    "Certification requests received, how they were decided, and how quickly.",
  tableTitle: "All requests in this period",
  statuses: [
    { value: "new", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ],
  // Sortable column key -> Prisma field.
  sorts: {
    name: "name",
    organization: "organization",
    country: "country",
    status: "status",
    createdAt: "createdAt",
    reviewedAt: "reviewedAt",
  },
  defaultSort: "createdAt",
  defaultDir: "desc",
  groupBys: [
    { value: "certification", label: "Certification" },
    { value: "status", label: "Status" },
    { value: "country", label: "Country" },
    { value: "organization", label: "Organisation" },
  ],
  defaultGroupBy: "certification",
  fields: ["range", "grain", "cert", "status", "country", "org", "q", "by"],
  qPlaceholder: "Name or email",
  columns: [
    { key: "id", label: "Request", kind: "id", width: 90 },
    { key: "name", label: "Learner", kind: "enrollmentLink", sortable: true },
    {
      key: "organization",
      label: "Organisation",
      kind: "orgLink",
      sortable: true,
    },
    { key: "country", label: "Country", kind: "text", sortable: true },
    { key: "certifications", label: "Certifications", kind: "list" },
    {
      key: "createdAt",
      label: "Submitted",
      sortLabel: "submission date",
      kind: "datetime",
      sortable: true,
    },
    {
      key: "reviewedAt",
      label: "Approved",
      sortLabel: "approval date",
      kind: "datetime",
      sortable: true,
    },
    { key: "reviewedBy", label: "Reviewed By", kind: "text" },
    { key: "status", label: "Status", kind: "status", sortable: true },
    { key: "view", label: "", kind: "enrollmentView", align: "right" },
  ],
  exportColumns: [
    { key: "id", header: "Request #", kind: "number", width: 10 },
    { key: "name", header: "Name", width: 24 },
    { key: "email", header: "Email", width: 30 },
    { key: "mobile", header: "Mobile", width: 16 },
    { key: "organization", header: "Organisation", width: 24 },
    { key: "designation", header: "Designation", width: 20 },
    { key: "country", header: "Country", width: 16 },
    { key: "certifications", header: "Certifications", width: 24 },
    { key: "status", header: "Status", width: 10 },
    { key: "createdAt", header: "Submitted", kind: "datetime", width: 20 },
    { key: "reviewedAt", header: "Approved", kind: "datetime", width: 20 },
    { key: "reviewedBy", header: "Reviewed by", width: 20 },
    {
      key: "turnaroundHours",
      header: "Turnaround (hours)",
      kind: "number",
      width: 12,
    },
    { key: "rejectionReason", header: "Rejection reason", width: 40 },
  ],
};

/** The filters that do not depend on the period. */
function scopeWhere(filters) {
  return {
    ...certWhere("certificationCode", filters),
    ...orgWhere(filters),
    ...countryWhere(filters),
    ...nameEmailWhere(filters),
  };
}

function baseWhere(filters) {
  return {
    ...periodWhere("createdAt", filters),
    ...statusWhere("status", filters),
    ...scopeWhere(filters),
  };
}

const PAGE_SELECT = {
  id: true,
  name: true,
  email: true,
  mobile: true,
  organization: true,
  organizationKey: true,
  designation: true,
  country: true,
  certifications: true,
  status: true,
  createdAt: true,
  reviewedAt: true,
  rejectionReason: true,
  reviewedBy: { select: { name: true } },
};

function toRow(r) {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    mobile: r.mobile,
    organization: r.organization,
    orgKey: r.organizationKey,
    designation: r.designation ?? null,
    country: r.country,
    certifications: parseCertList(r.certifications).map(displayCertCode),
    status: r.status,
    createdAt: iso(r.createdAt),
    reviewedAt: iso(r.reviewedAt),
    reviewedBy: r.reviewedBy?.name ?? null,
    turnaroundHours: hoursBetween(r.createdAt, r.reviewedAt),
    rejectionReason: r.rejectionReason ?? null,
  };
}

/** Bucket keys for the period, or for the data's own span when "all time". */
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
  const where = baseWhere(filters);
  const orderBy = orderByFor(definition.sorts[filters.sort], filters.dir);

  const [total, inRange, firstPage, catalog] = await Promise.all([
    prisma.enrollment.count({ where }),
    prisma.enrollment.findMany({
      where,
      select: {
        status: true,
        createdAt: true,
        certifications: true,
        organizationKey: true,
        country: true,
      },
    }),
    prisma.enrollment.findMany({
      where,
      orderBy,
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      select: PAGE_SELECT,
    }),
    getReportCatalog(),
  ]);

  // A page past the end is clamped to the last one.
  const window = pageWindow({
    page: filters.page,
    pageSize: filters.pageSize,
    total,
  });
  const pageRows =
    window.page === filters.page
      ? firstPage
      : await prisma.enrollment.findMany({
          where,
          orderBy,
          skip: window.skip,
          take: window.take,
          select: PAGE_SELECT,
        });

  // ---- Tiles ----
  const count = (status) => inRange.filter((r) => r.status === status).length;
  const approved = count("approved");
  const rejected = count("rejected");
  const pending = count("new");

  const tiles = [
    tile("received", "Received", total, "number", "Requests in this period"),
    tile("approved", "Approved", approved, "number", "In this period"),
    tile("rejected", "Rejected", rejected, "number", "In this period"),
    tile("pending", "Pending", pending, "number", "Awaiting review"),
    tile(
      "approvalRate",
      "Approval rate",
      rate(approved, approved + rejected),
      "percent",
      `${approved} approved of ${approved + rejected} decided`,
    ),
  ];

  // ---- Series ----
  const grain = filters.grain;
  const receivedKeys = spanKeys(
    filters,
    inRange.map((r) => r.createdAt),
    now,
  );
  const per = { day: "day", week: "week", month: "month" }[grain] ?? "period";
  const series = [
    {
      key: "received",
      title: "Requests over time",
      subtitle: `Per ${per}, by current status`,
      kind: "bar",
      stacked: true,
      grain,
      // Status colours, not the series palette: each bar segment is a status.
      fields: [
        { key: "new", label: "New", color: "#F0A830" },
        { key: "approved", label: "Approved", color: "#1B8A4B" },
        { key: "rejected", label: "Rejected", color: "#DC2626" },
      ],
      data: fillSeries(
        receivedKeys,
        grain,
        tally(
          inRange,
          (r) => bucketKey(r.createdAt, grain),
          (r) => r.status,
        ),
        ["new", "approved", "rejected"],
      ),
    },
  ];

  // ---- Distributions ----
  const countBy = (keyOf) => {
    const m = new Map();
    for (const r of inRange) {
      const keys = keyOf(r);
      for (const k of Array.isArray(keys) ? keys : [keys]) {
        if (k == null || k === "") continue;
        m.set(k, (m.get(k) ?? 0) + 1);
      }
    }
    return m;
  };
  const toEntries = (m, nameOf = (k) => k) =>
    [...m]
      .map(([k, v]) => ({ name: nameOf(k), value: v }))
      .sort((a, b) => b.value - a.value);

  let selected;
  if (filters.groupBy === "status") {
    selected = {
      key: "status",
      title: "Requests by status",
      data: toEntries(
        countBy((r) => r.status),
        (s) => STATUS_LABELS[s] ?? s,
      ),
    };
  } else if (filters.groupBy === "country") {
    selected = {
      key: "country",
      title: "Requests by country",
      data: topN(toEntries(countBy((r) => r.country)), 10),
    };
  } else if (filters.groupBy === "organization") {
    const byOrg = countBy((r) => r.organizationKey);
    const names = await orgDisplayNames([...byOrg.keys()]);
    selected = {
      key: "organization",
      title: "Requests by organisation",
      data: topN(
        toEntries(byOrg, (k) => names.get(k) ?? k),
        10,
      ),
    };
  } else {
    // Every code of a legacy multi-code request counts, so old rows are not lost.
    selected = {
      key: "certification",
      title: "Requests by certification",
      subtitle: "A request can include more than one certification",
      data: toEntries(
        countBy((r) => parseCertList(r.certifications)),
        (c) => catalog.shortName(c),
      ),
    };
  }
  const distributions = [selected];

  return {
    tiles,
    series,
    distributions,
    table: { rows: pageRows.map(toRow), window },
    options: { certifications: catalog.options },
  };
}

/** Every matching row for a download, in the table's order (capped). */
export async function rows(filters) {
  const list = await prisma.enrollment.findMany({
    where: baseWhere(filters),
    orderBy: orderByFor(definition.sorts[filters.sort], filters.dir),
    take: EXPORT_ROW_CAP + 1,
    select: PAGE_SELECT,
  });
  return list.map(toRow);
}
