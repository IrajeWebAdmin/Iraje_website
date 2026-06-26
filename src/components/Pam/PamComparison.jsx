import PamSection from "./PamSection";
import pam from "@/data/pam";

export default function PamComparison() {
  const { eyebrow, heading, body, columns, rows } = pam.comparison;

  return (
    <PamSection tone="tint" center eyebrow={eyebrow} heading={heading} intro={body}>
      <div className="mt-12 overflow-hidden rounded-2xl border border-[#E3E8F4]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead>
              <tr>
                {columns.map((col, c) => (
                  <th
                    key={col}
                    className={`px-6 py-6 align-middle text-[15px] font-semibold ${
                      c === columns.length - 1
                        ? "bg-brand text-white"
                        : c === 0
                          ? "bg-[#E3E9FF] text-ink"
                          : "bg-[#EBEDF3] text-ink"
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[0]} className="border-t border-[#E6EBF5]">
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      className={`px-6 py-4 align-top leading-snug ${
                        c === row.length - 1
                          ? "bg-[#DFEBFF] font-medium text-ink"
                          : c === 0
                            ? "bg-[#F4F8FF] font-semibold text-ink"
                            : "bg-[#F4F8FF] text-slate-soft"
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PamSection>
  );
}
