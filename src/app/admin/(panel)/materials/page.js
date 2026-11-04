import { FiChevronDown, FiDownload } from "react-icons/fi";
import { requireAdmin } from "@/lib/dal";
import { getSanityClient } from "@/lib/sanity/client";
import { displayCertCode } from "@/lib/certCodes";
import SearchBox from "@/components/Admin/SearchBox";

export const metadata = {
  title: "Study materials | Iraje Admin",
};

// Only whether a PDF exists is read here. The Drive link itself stays on the
// server: /api/materials fetches it, so it never reaches a page.
const MODULES_QUERY = `*[_type == "module"] | order(course->certification->code asc, order asc) {
  _id, order, title,
  "code": course->certification->code,
  "certTitle": course->certification->title,
  "hasPdf": defined(pdfDriveLink)
}`;

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

// /admin/materials — every module's PDF, grouped by certification. "Preview"
// fetches the file exactly the way a learner would, so it proves the link
// works and the file is shared with the website's service account.
export default async function MaterialsPage({ searchParams }) {
  await requireAdmin();

  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 80);
  const needle = q.toLowerCase();

  const modules = await getSanityClient().fetch(MODULES_QUERY);
  const matches = (m) =>
    !needle ||
    [m.title, m.code, displayCertCode(m.code), m.certTitle]
      .filter(Boolean)
      .some((text) => text.toLowerCase().includes(needle));

  // One group per certification, in catalogue order, each with the modules
  // that match the search.
  const groups = [];
  const byCode = new Map();
  for (const m of modules) {
    const key = m.code ?? "";
    let group = byCode.get(key);
    if (!group) {
      group = { code: key, title: m.certTitle ?? "", modules: [], shown: [] };
      byCode.set(key, group);
      groups.push(group);
    }
    group.modules.push(m);
    if (matches(m)) group.shown.push(m);
  }
  const visible = groups.filter((g) => g.shown.length > 0);
  const shownCount = visible.reduce((n, g) => n + g.shown.length, 0);

  const footer =
    visible.length === 1 && !q
      ? `Showing ${shownCount} of ${visible[0].modules.length} ${displayCertCode(visible[0].code)} modules`
      : `Showing ${shownCount} of ${modules.length} modules${
          visible.length > 1
            ? ` across ${plural(visible.length, "certification")}`
            : ""
        }${q ? ` matching “${q}”` : ""}`;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-ink text-3xl font-bold tracking-tight sm:text-4xl">
          Study <span className="text-brand font-medium italic">materials</span>
        </h1>
        <p className="text-shuttle mt-2 text-sm">
          The PDF notes learners read in each module before their exam.
        </p>
      </header>

      <section className="border-mist rounded-2xl border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <h2 className="text-ink text-base font-semibold">Modules</h2>
          <SearchBox placeholder="Search modules" label="Search modules" />
        </div>

        {visible.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-ink text-sm font-semibold">
              {q ? `No modules match “${q}”` : "No modules yet"}
            </p>
            <p className="text-shuttle mt-1 text-sm">
              {q
                ? "Try a module title or a certification code."
                : "Modules are added in Sanity Studio."}
            </p>
          </div>
        ) : (
          <div className="space-y-3 px-4 pb-4">
            {visible.map((g) => {
              const missing = g.shown.filter((m) => !m.hasPdf).length;
              const detail = `${plural(g.shown.length, "module")} shown · ${
                missing ? `${missing} missing a PDF` : "all have a PDF"
              }`;
              return (
                <details
                  key={g.code || "none"}
                  open
                  className="group border-mist overflow-hidden rounded-xl border"
                >
                  <summary className="bg-catskill/70 hover:bg-catskill flex cursor-pointer list-none flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center gap-3">
                      <span className="bg-brand rounded-md px-2 py-0.5 text-[11px] font-semibold text-white">
                        {g.code ? displayCertCode(g.code) : "—"}
                      </span>
                      <span className="text-ink text-sm font-semibold">
                        {g.title || "Unassigned modules"}
                      </span>
                    </span>
                    <span className="text-shuttle flex items-center gap-2 text-xs">
                      {detail}
                      <FiChevronDown
                        className="h-4 w-4 transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </span>
                  </summary>

                  <table className="w-full text-left text-sm">
                    <thead className="text-shuttle text-xs font-semibold">
                      <tr>
                        <th className="w-14 px-4 py-2.5 font-semibold">#</th>
                        <th className="px-4 py-2.5 font-semibold">Module</th>
                        <th className="px-4 py-2.5 text-right font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.shown.map((m) => (
                        <tr key={m._id} className="border-mist border-t">
                          <td className="text-shuttle px-4 py-3">{m.order}</td>
                          <td className="text-ink px-4 py-3 font-medium">
                            {m.title}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              {m.hasPdf ? (
                                <>
                                  <a
                                    href={`/api/materials/${m._id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="border-mist text-brand hover:border-brand inline-flex h-8 items-center rounded-full border bg-white px-3.5 text-xs font-semibold transition"
                                  >
                                    Preview
                                  </a>
                                  <a
                                    href={`/api/materials/${m._id}?download=1`}
                                    title="Download PDF"
                                    aria-label={`Download ${m.title}`}
                                    className="border-mist text-shuttle hover:border-brand hover:text-brand inline-flex h-8 w-8 items-center justify-center rounded-full border bg-white transition"
                                  >
                                    <FiDownload
                                      className="h-3.5 w-3.5"
                                      aria-hidden="true"
                                    />
                                  </a>
                                </>
                              ) : (
                                <span className="text-xs font-medium text-red-600">
                                  Missing PDF
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              );
            })}
          </div>
        )}

        <div className="border-mist text-shuttle flex flex-wrap items-center justify-between gap-2 border-t px-5 py-3 text-xs">
          <p>{footer}</p>
          <p>Other certifications’ modules appear in their own groups</p>
        </div>
      </section>
    </div>
  );
}
