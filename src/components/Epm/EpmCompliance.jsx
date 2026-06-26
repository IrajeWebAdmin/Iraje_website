import EpmSection from "./EpmSection";
import { FiShield } from "react-icons/fi";
import epm from "@/data/epm";

export default function EpmCompliance() {
  const {
    eyebrow,
    heading,
    body,
    standardsTitle,
    standards,
    table,
    indianTitle,
    indianBody,
    indianRegulators,
  } = epm.compliance;

  return (
    <EpmSection
      tone="tint"
      center
      eyebrow={eyebrow}
      heading={heading}
      intro={body}
      className="bg-[#EBEDF3]!"
    >
      {/* Global standards */}
      <h3 className="mt-14 text-center text-sm tracking-[0.12em] text-[#0451CC] uppercase">
        {standardsTitle}
      </h3>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {standards.map((std) => (
          <div
            key={std.name}
            className="rounded-2xl border border-mist bg-white px-4 py-6 text-center"
          >
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#0451CC] text-white">
              <FiShield className="h-5 w-5" />
            </span>
            <p className="mt-3 font-display text-sm font-semibold text-ink">
              {std.name}
            </p>
            <p className="mt-1 text-xs text-slate-soft">{std.sub}</p>
          </div>
        ))}
      </div>

      {/* Compliance mapping table */}
      <div className="mt-14">
        <h3 className="text-center font-display text-xl font-semibold text-[#0451CC]">
          {table.title}
        </h3>
        <div className="mt-6 overflow-hidden rounded-2xl border border-mist bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse font-display text-left text-sm">
              <thead>
                <tr className="bg-[#0451CC] text-white">
                  <th className="border-r border-white/30 h-[101px] px-4 text-xs font-semibold" />
                  {table.columns.map((col) => (
                    <th
                      key={col}
                      className="border-r border-white/30 h-[101px] px-4 text-xs font-semibold whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                  <th className="h-[101px] px-4 text-center text-xs font-semibold whitespace-nowrap">
                    Iraje Compliance
                  </th>
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, r) => (
                  <tr key={row[0]} className={r % 2 ? "bg-[#f3f5fa]" : "bg-white"}>
                    <td className="border-r border-[#707070] px-4 py-5 align-middle text-xs text-black">
                      {r + 1}
                    </td>
                    {row.map((cell, c) => (
                      <td
                        key={c}
                        className={`border-r border-[#707070] px-4 py-5 align-middle whitespace-nowrap ${
                          c === 0 ? "font-semibold text-black" : "text-black"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                    <td className="px-4 py-5 text-center align-middle">
                      <span className="inline-flex items-center rounded-full bg-[#E3E9FF] px-3 py-1 text-xs font-semibold text-[#0451CC]">
                        Yes
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Indian regulators (only when the data provides them) */}
      {indianRegulators && (
        <>
      <div className="mt-16 text-center">
        <h3 className="font-display text-xl font-semibold text-ink">
          {indianTitle}
        </h3>
        <p className="mx-auto mt-3 max-w-4xl text-sm leading-relaxed text-ink/65 md:text-base">
          {indianBody}
        </p>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {indianRegulators.map((reg) => (
          <div
            key={reg.name}
            className="flex items-center gap-3 rounded-2xl border border-mist bg-white px-6 py-5"
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#0451CC]" />
            <span className="font-display text-base font-semibold text-ink">
              {reg.name}
            </span>
            <span className="text-sm text-ink/60">{reg.desc}</span>
          </div>
        ))}
      </div>
        </>
      )}
    </EpmSection>
  );
}
