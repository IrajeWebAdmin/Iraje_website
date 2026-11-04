import "server-only";
import { prisma } from "@/lib/prisma";
import { SUBMIT_GRACE_MS } from "@/lib/exam";
import { organizationKey } from "@/lib/organizations";
import { COUNTRIES } from "@/data/countries";

// Pieces every report family shares: Prisma `where` fragments built from the
// parsed filters, organisation lookups, and the exam-outcome rule. Everything
// here runs on the server; the browser only ever sees finished numbers.

/** `{ [field]: { gte, lt } }` for the period, or {} for "all time". */
export function periodWhere(field, filters) {
  const range = {};
  if (filters.fromUtc) range.gte = filters.fromUtc;
  if (filters.toUtc) range.lt = filters.toUtc;
  return Object.keys(range).length ? { [field]: range } : {};
}

/** `{ [field]: { in: codes } }` when certifications are chosen, else {}. */
export function certWhere(field, filters) {
  return filters.certs.length ? { [field]: { in: filters.certs } } : {};
}

/** `{ [field]: { in: statuses } }` when statuses are chosen, else {}. */
export function statusWhere(field, filters) {
  return filters.statuses.length ? { [field]: { in: filters.statuses } } : {};
}

/** Organisation search on a request row: the cleaned key contains the cleaned search. */
export function orgWhere(filters) {
  if (!filters.org) return {};
  return { organizationKey: { contains: organizationKey(filters.org) } };
}

/** Country filter on a request row. */
export function countryWhere(filters) {
  return filters.country ? { country: filters.country } : {};
}

/**
 * Organisation and country restrictions applied through the learner account:
 * a learner belongs to the organisation on any approved request of theirs.
 * Returns a `user` relation filter fragment, or {} when neither is set.
 */
export function learnerScopeWhere(filters) {
  const some = {
    status: "approved",
    ...orgWhere(filters),
    ...countryWhere(filters),
  };
  if (Object.keys(some).length === 1) return {};
  return { user: { enrollments: { some } } };
}

/** Free-text search across name and email (case-insensitive by collation). */
export function nameEmailWhere(
  filters,
  { nameField = "name", emailField = "email" } = {},
) {
  if (!filters.q) return {};
  return {
    OR: [
      { [nameField]: { contains: filters.q } },
      { [emailField]: { contains: filters.q } },
    ],
  };
}

/**
 * The most common original spelling for each organisation key, e.g.
 * "infosys" -> "Infosys". Ties go to the shortest spelling.
 */
export async function orgDisplayNames(keys) {
  const wanted = [...new Set(keys.filter(Boolean))];
  if (wanted.length === 0) return new Map();
  const rows = await prisma.enrollment.groupBy({
    by: ["organizationKey", "organization"],
    where: { organizationKey: { in: wanted } },
    _count: { _all: true },
  });
  const best = new Map();
  for (const r of rows) {
    const current = best.get(r.organizationKey);
    const better =
      !current ||
      r._count._all > current.count ||
      (r._count._all === current.count &&
        r.organization.length < current.name.length);
    if (better)
      best.set(r.organizationKey, {
        name: r.organization,
        count: r._count._all,
      });
  }
  return new Map([...best].map(([k, v]) => [k, v.name]));
}

/**
 * For each learner id, the organisation and country from their latest
 * approved request (the same rule as learnerOrganization() in lib/exam.js).
 * Returns Map<userId, { orgKey, organization, country, designation }>.
 */
export async function learnerOrganizations(userIds) {
  const ids = [...new Set(userIds.filter((id) => Number.isInteger(id)))];
  if (ids.length === 0) return new Map();
  const rows = await prisma.enrollment.findMany({
    where: { userId: { in: ids }, status: "approved" },
    orderBy: [{ reviewedAt: "desc" }, { id: "desc" }],
    select: {
      userId: true,
      organizationKey: true,
      organization: true,
      country: true,
      designation: true,
    },
  });
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r.userId)) {
      map.set(r.userId, {
        orgKey: r.organizationKey,
        organization: r.organization,
        country: r.country,
        designation: r.designation,
      });
    }
  }
  return map;
}

/**
 * What happened in an exam sitting, read-only (the report never closes
 * attempts): in_progress, timed_out, passed or failed.
 */
export function attemptOutcome(attempt, now = Date.now()) {
  const deadline = new Date(attempt.deadlineAt).getTime() + SUBMIT_GRACE_MS;
  if (!attempt.submittedAt) return deadline > now ? "in_progress" : "timed_out";
  if (attempt.passed === true) return "passed";
  if (new Date(attempt.submittedAt).getTime() > deadline) return "timed_out";
  return "failed";
}

/** Minutes between two instants, one decimal, or null. */
export function minutesBetween(start, end) {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return ms >= 0 ? Math.round(ms / 6000) / 10 : null;
}

/** Hours between two instants, one decimal, or null. */
export function hoursBetween(start, end) {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return ms >= 0 ? Math.round(ms / 360000) / 10 : null;
}

/**
 * Prisma orderBy for a sort key: "createdAt" -> [{ createdAt: dir }, { id: "desc" }],
 * "user.name" -> [{ user: { name: dir } }, { id: "desc" }]. The id tie-break
 * keeps paging stable when many rows share a timestamp.
 */
export function orderByFor(path, dir = "desc") {
  if (!path) return [{ id: "desc" }];
  const primary = path
    .split(".")
    .reverse()
    .reduce((inner, part) => ({ [part]: inner }), dir);
  return [primary, { id: "desc" }];
}

/** A headline tile. `format` tells the page how to print `value`. */
export function tile(key, label, value, format = "number", hint = null) {
  return { key, label, value, format, hint };
}

/** Country options for the filter bar, from the fixed list the form uses. */
export const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({
  value: c.name,
  label: c.name,
}));

/** ISO string or null, so rows stay plain JSON for the page and the exports. */
export const iso = (d) => (d ? new Date(d).toISOString() : null);
