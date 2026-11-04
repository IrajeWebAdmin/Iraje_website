import "server-only";
import { cache } from "react";
import { getSanityClient } from "@/lib/sanity/client";
import { displayCertCode } from "@/lib/certCodes";

// Names live in Sanity, numbers live in MySQL. Every report needs the
// certification titles and, for progress, each course's module list. This
// loads both once per request (React cache) so a page with five queries and
// a table of 100 rows still makes one Sanity round trip.
//
// The module list mirrors COURSE_QUERY: the first non-archived course of each
// certification, its modules in order, so "3 of 15 modules" here is the same
// 15 the learner's dashboard counts.
const REPORT_CATALOG_QUERY = `*[_type == "certification"] | order(code asc) {
  code,
  label,
  title,
  status,
  track,
  "course": *[_type == "course" && certification._ref == ^._id && status != "archived"] | order(_createdAt asc)[0] {
    "modules": *[_type == "module" && course._ref == ^._id] | order(order asc) {
      _id,
      order,
      title,
      "checkCount": count(*[_type == "question" && usedFor == "knowledgeCheck" && status == "active" && module._ref == ^._id])
    }
  }
}`;

export const getReportCatalog = cache(async () => {
  const rows = await getSanityClient().fetch(REPORT_CATALOG_QUERY);
  const certifications = rows
    .filter((c) => c.code)
    .map((c) => ({
      code: c.code,
      label: c.label ?? "",
      title: c.title ?? "",
      status: c.status ?? "",
      track: c.track ?? "",
      /** "PAM 101 · PAM Fundamentals" — what filters and charts show. */
      name: [displayCertCode(c.code), c.title].filter(Boolean).join(" · "),
      modules: c.course?.modules ?? [],
    }));
  const byCode = new Map(certifications.map((c) => [c.code, c]));
  return {
    certifications,
    byCode,
    /** Display name for a code, falling back to the code itself. */
    certName: (code) => byCode.get(code)?.name ?? displayCertCode(code ?? ""),
    /** Short name for chart labels: "PAM 101", "CyberTantra". */
    shortName: (code) => byCode.get(code)?.label || displayCertCode(code ?? ""),
    /** Module documents for a code (empty when the course has none yet). */
    modulesFor: (code) => byCode.get(code)?.modules ?? [],
    /** Options for the certification filter: [{ code, label }]. */
    options: certifications.map((c) => ({ code: c.code, label: c.name })),
  };
});
