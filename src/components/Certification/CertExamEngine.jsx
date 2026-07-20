import CertSection from "./CertSection";
import { FiShield, FiCheck, FiRotateCcw } from "react-icons/fi";
import certification from "@/data/certification";

// Note icons, in the same order as exam.notes.
const NOTE_ICONS = [FiShield, FiCheck, FiRotateCcw];

// Online Examination Engine: a per-certification exam-rules table, three
// question-bank stat cards, and a row of exam-fairness notes.
// The "Questions" column is hidden on small screens (matches Figma `.hide`).
export default function CertExamEngine() {
  const { eyebrow, heading, intro, columns, rows, banks, notes } = certification.exam;

  return (
    <CertSection id="exam" tone="light" paddingClassName="py-15">
      {/* Section header — global epm-* classes, centered */}
      <div className="mx-auto max-w-6xl text-center">
        <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
          {eyebrow}
        </span>
        <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black">
          {heading}
        </h2>
        <p className="mx-auto mt-6 max-w-6xl epm-body leading-relaxed text-[#8E8E93]">
          {intro}
        </p>
      </div>

      {/* Exam rules table */}
      <div className="mt-12 overflow-hidden rounded-2xl border border-mist bg-white shadow-[0px_1px_2px_0px_#0C1E3A0D]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#F4F7FB] text-[#5B6C84]">
                {columns.map((col, i) => (
                  <th
                    key={col}
                    className={`px-6 py-4 text-xs font-semibold tracking-wide uppercase ${
                      i === 2 ? "hidden md:table-cell" : ""
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[0]} className="border-t border-[#0C1E3A0F] bg-white">
                  <td className="px-6 py-4 font-semibold text-ink">{row[0]}</td>
                  <td className="px-6 py-4 text-xs font-medium tracking-wide text-[#0451CC] uppercase">
                    {row[1]}
                  </td>
                  <td className="hidden px-6 py-4 font-normal text-ink md:table-cell">
                    {row[2]}
                  </td>
                  <td className="px-6 py-4 font-normal text-ink">{row[3]}</td>
                  <td className="px-6 py-4 font-normal text-ink">{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Question banks */}
      <div className="mt-15 grid gap-8  md:grid-cols-3">
        {banks.map((bank) => (
          <div
            key={bank.label}
            className="rounded-2xl border border-[#0C1E3A1A] bg-[#0451CC] p-8 text-center shadow-[0px_1px_2px_0px_#0C1E3A0D]"
          >
            <p className="font-display text-4xl font-semibold text-white">
              {bank.count}
            </p>
            <p className="mt-1 text-sm text-white/80">{bank.label}</p>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-soft">
        {notes.map((note, i) => {
          const Icon = NOTE_ICONS[i] ?? FiCheck;
          return (
            <span key={note} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-brand" />
              {note}
            </span>
          );
        })}
      </div>
    </CertSection>
  );
}
