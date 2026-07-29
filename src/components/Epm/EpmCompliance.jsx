import EpmSection from "./EpmSection";
import {
  FiCheckCircle,
  FiShield,
  FiCreditCard,
  FiFile,
  FiGlobe,
} from "react-icons/fi";
import { BsGraphUp } from "react-icons/bs";
import { LuStethoscope } from "react-icons/lu";
import epm from "@/data/epm";

// Per-standard icons, keyed by the `icon` field on each standards data item.
const ICONS = {
  check: FiCheckCircle,
  shield: FiShield,
  card: FiCreditCard,
  file: FiFile,
  health: LuStethoscope,
  globe: FiGlobe,
  chart: BsGraphUp,
};

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
    <EpmSection className="bg-[#EBEDF3]!" paddingClassName="py-15" >

       <div className="mx-auto max-w-6xl text-center">
        <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
          {eyebrow}
        </span>
        <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black">
          {heading}
        </h2>
        <p className="mt-8 epm-body leading-relaxed text-[#8E8E93] ">
          {body}
        </p>
      </div>

      {/* Global standards */}
      <h3 className="mt-14 text-center text-xl font-medium tracking-[0.12em] text-[#0451CC] ">
        {standardsTitle}
      </h3>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {standards.map((std) => {
          const Icon = ICONS[std.icon];
          return (
            <div
              key={std.name}
              className="flex h-[145.17px] w-[165.46px] flex-col items-center justify-center rounded-[20.29px] border border-mist bg-white px-4 text-center"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E4EAFB] text-brand">
                {Icon && <Icon className="h-5 w-5" />}
              </span>
              <p className="mt-3 font-display text-sm font-semibold text-ink">
                {std.name}
              </p>
              <p className="mt-1 text-xs text-[#8E8E93]">{std.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Compliance mapping table */}
      <div className="mt-14">
        <h3 className="text-center font-display text-xl font-medium text-[#0451CC]">
          {table.title}
        </h3>
        <div className="mt-6 overflow-hidden rounded-t-[33.43px] rounded-b-2xl border-[0.88px] border-[#0000004F] bg-white shadow-[0px_3.52px_17.15px_2.64px_#00000040]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-display text-left text-sm">
              <thead>
                <tr className="bg-[#0451CC] text-white">
                  <th className="border-r-[0.88px] border-[#7070703D] h-20.25 px-4 text-xs font-semibold" />
                  {table.columns.map((col) => (
                    <th
                      key={col}
                      className="border-r-[0.88px] border-[#7070703D] h-20.25 px-4 text-xs font-semibold whitespace-pre-line"
                    >
                      {col}
                    </th>
                  ))}
                  <th className="h-25.25 px-4 text-center text-xs font-semibold">
                    Iraje Compliance
                  </th>
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, r) => (
                  <tr key={row[0]} className={r % 2 ? "bg-[#EBEDF3]" : "bg-white"}>
                    <td className="border-r-[0.88px] border-[#7070703D] px-8 py-9 align-middle text-xs font-semibold text-black">
                      {r + 1}
                    </td>
                    {row.map((cell, c) => (
                      <td
                        key={c}
                        className={`border-r-[0.88px] border-[#7070703D] px-4 py-9 align-middle ${
                          c === 0 ? "font-semibold text-black" : "font-medium text-black"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                    <td className="px-4 py-9 text-center align-middle">
                      <span className="inline-flex items-center rounded-full bg-[#2464cc] px-3 py-1 text-xs font-medium text-white">
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
        <h3 className="font-display text-xl font-semibold text-[#0451CC]">
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
