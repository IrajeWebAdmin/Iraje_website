import PamSection from "./PamSection";
import pam from "@/data/pam";

// The competitor column marks negatives ("Limited") in dark red.
function highlightLimited(text) {
  if (!text.includes("Limited")) return text;
  return text.split(/(Limited)/g).map((part, i) =>
    part === "Limited" ? (
      <span key={i} className="text-[#8B0101]">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export default function PamComparison() {
  const { eyebrow, heading, body, columns, rows } = pam.comparison;

  return (
    <PamSection tone="tint" paddingClassName="py-15">
      {/* Section header — global epm-* classes, matching the other sections. */}
      <div className="mx-auto max-w-6xl text-center">
        <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
          {eyebrow}
        </span>
        <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black">
          {heading}
        </h2>
        <p className="mx-auto mt-8 max-w-3xl epm-body leading-relaxed text-slate-soft">
          {body}
        </p>
      </div>

      <div className="mt-12 overflow-hidden rounded-[38px] border border-[#E3E8F4]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead>
              <tr>
                {columns.map((col, c) => (
                  <th
                    key={col}
                    className={`px-6 py-6 align-middle text-[15px] ${
                      c === 0 ? "font-semibold" : "font-medium"
                    } ${
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
                      className={`px-6 py-4 align-top leading-snug text-black ${
                        c === 0 ? "font-semibold" : "font-medium"
                      } ${c === row.length - 1 ? "bg-[#DFEBFF]" : "bg-[#F4F8FF]"}`}
                    >
                      {c !== 0 && c !== row.length - 1
                        ? highlightLimited(cell)
                        : cell}
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
