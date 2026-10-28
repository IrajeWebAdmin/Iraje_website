import { requireAdmin } from "@/lib/dal";
import { getSanityClient } from "@/lib/sanity/client";

const MODULES_QUERY = `*[_type == "module"] | order(course->certification->code asc, order asc) {
  _id, order, title,
  "code": course->certification->code,
  "hasPdf": defined(pdfDriveLink)
}`;

// /admin/materials — which modules have a Google Drive PDF link. "Preview"
// fetches it exactly the way a learner would, so it proves the link works and
// the file is shared with the website's service account.
export default async function MaterialsPage() {
  await requireAdmin();
  const modules = await getSanityClient().fetch(MODULES_QUERY);
  const withPdf = modules.filter((m) => m.hasPdf).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Study materials</h1>
        <p className="mt-1 text-sm text-shuttle">
          Paste each PDF&apos;s Google Drive link on its Module in Sanity Studio. {withPdf} of {modules.length} modules have
          a PDF.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-mist bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-catskill text-xs text-shuttle uppercase">
            <tr>
              <th className="px-4 py-3">Certification</th>
              <th className="px-4 py-3">Module</th>
              <th className="px-4 py-3">PDF</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((m) => (
              <tr key={m._id} className="border-t border-mist">
                <td className="px-4 py-3 font-medium">{m.code ?? "—"}</td>
                <td className="px-4 py-3">
                  {m.order}. {m.title}
                </td>
                <td className="px-4 py-3">
                  {m.hasPdf ? (
                    <a href={`/api/materials/${m._id}`} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                      Preview
                    </a>
                  ) : (
                    <span className="text-slate-soft">Missing</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
