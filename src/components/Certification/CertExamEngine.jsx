import CertSection from "./CertSection";
import certification from "@/data/certification";

// Online Examination Engine: a per-certification exam-rules table, three
// question-bank stat cards, and a row of exam-fairness notes.
// The "Questions" column is hidden on small screens (matches Figma `.hide`).
export default function CertExamEngine() {
  const { eyebrow, heading, intro, columns, rows, banks, notes } = certification.exam;

  return (
    <CertSection id="exam" eyebrow={eyebrow} heading={heading} intro={intro} tone="light">
      {/* Exam rules table */}
      <div className="mt-12 overflow-hidden rounded-3xl border border-mist bg-white shadow-[0px_18px_40px_-28px_rgba(4,81,204,0.35)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-brand text-white">
                {columns.map((col, i) => (
                  <th
                    key={col}
                    className={`px-6 py-4 font-semibold ${
                      i === 2 ? "hidden md:table-cell" : ""
                    } ${i >= 3 ? "text-center" : ""}`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <tr key={row[0]} className={r % 2 ? "bg-[#f4f8ff]" : "bg-white"}>
                  <td className="px-6 py-4 font-semibold text-ink">{row[0]}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-[#E3E9FF] px-3 py-1 text-xs font-semibold tracking-wide text-brand uppercase">
                      {row[1]}
                    </span>
                  </td>
                  <td className="hidden px-6 py-4 font-medium text-ink md:table-cell">
                    {row[2]}
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-ink">{row[3]}</td>
                  <td className="px-6 py-4 text-center font-semibold text-brand">{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Question banks */}
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {banks.map((bank) => (
          <div
            key={bank.label}
            className="rounded-2xl border border-mist bg-[#f4f8ff] p-6 text-center"
          >
            <p className="font-display text-3xl font-semibold text-brand">{bank.count}</p>
            <p className="mt-1 text-sm text-slate-soft">{bank.label}</p>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-soft">
        {notes.map((note) => (
          <span key={note} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            {note}
          </span>
        ))}
      </div>
    </CertSection>
  );
}
