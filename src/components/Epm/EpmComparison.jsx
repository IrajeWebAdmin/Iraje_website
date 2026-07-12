import epm from "@/data/epm";
import { BsCheckLg, BsExclamationTriangle, BsXLg } from "react-icons/bs";

// Brand gradient for the highlighted EPM card.
const BRAND_GRADIENT =
  "bg-[linear-gradient(120deg,#022966_0%,#1d5bff_100%)]";

// Status icons for "At a glance" cells (✓ good / ✗ bad / ⚠ partial).
const STATUS_ICON = {
  good: { Icon: BsCheckLg, className: "text-green-600" },
  bad: { Icon: BsXLg, className: "text-red-500" },
  warn: { Icon: BsExclamationTriangle, className: "text-amber-500" },
};

// A table cell is either a plain string (comparison table) or a
// { text, status } object (glance table) that renders with a leading icon.
function CellContent({ cell }) {
  if (!cell || typeof cell !== "object") return cell;
  const cfg = STATUS_ICON[cell.status];
  const Icon = cfg?.Icon;
  return (
    <span className="inline-flex items-center gap-2">
      {Icon && (
        <Icon aria-hidden="true" className={`h-4 w-4 shrink-0 ${cfg.className}`} />
      )}
      <span>{cell.text}</span>
    </span>
  );
}

function Table({ columns, rows, highlightCol = 1 }) {
  return (
    <div className="mt-8 overflow-x-auto rounded-[38px] border border-[#E3E8F4] shadow-[0px_12.78px_31.94px_-19.16px_#0C1E3A47,0px_0.8px_1.6px_0px_#0C1E3A0D]">
      <table className="w-full min-w-[760px] border-collapse  text-left text-sm">
        <thead>
          <tr>
            {columns.map((col, c) => (
              <th
                key={col}
                className={`h-32.5 px-6 align-middle text-[15px] font-semibold ${
                  c === highlightCol
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
            <tr key={row[0]} className="border-b border-[#0000001C]">
              {row.map((cell, c) => (
                <td
                  key={c}
                  className={`px-6 py-4 align-top leading-snug text-black ${
                    c === 0 ? "font-medium" : "font-normal"
                  } ${c === highlightCol ? "bg-[#DFEBFF]" : "bg-[#F4F8FF]"}`}
                >
                  <CellContent cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-center text-[17px] font-semibold tracking-wide text-brand">
      {children}
    </p>
  );
}

export default function EpmComparison() {
  const { vs, comparison, glance } = epm;

  return (
    <section className="bg-[#F4F8FF] py-15 text-ink">
      <div className="epm-container">
        {/* Intro */}
        <div className="mx-auto max-w-4xl text-center">
          <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
            {vs.eyebrow}
          </span>
          <h2 className="mx-auto mt-4 max-w-6xl epm-heading font-medium leading-[1.1] tracking-tight text-black">
            {vs.heading}
          </h2>
          <p className="mx-auto mt-6 max-w-4xl epm-body leading-relaxed text-slate-soft">
            {vs.body}
          </p>
        </div>

        {/* Three cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {vs.cards.map((card) => {
            const hl = card.highlight;
            return (
              <div
                key={card.name}
                className={`rounded-2xl p-7 shadow-[0px_12.78px_31.94px_-19.16px_#0C1E3A47,0px_0.8px_1.6px_0px_#0C1E3A0D] ${
                  hl ? `${BRAND_GRADIENT} text-white` : "bg-[#E8EDFB] text-ink"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                      hl ? "bg-white text-ink" : "bg-brand text-white"
                    }`}
                  >
                    {card.name}
                  </span>
                  <span
                    className={`text-sm font-medium ${hl ? "text-white" : "text-black"}`}
                  >
                    {card.tag}
                  </span>
                </div>
                <p
                  className={`mt-6 text-lg font-semibold ${hl ? "text-white" : "text-ink"}`}
                >
                  {card.headline}
                </p>
                <p
                  className={`mt-3 text-sm leading-relaxed ${hl ? "text-white/70" : "text-black"}`}
                >
                  {card.body}
                </p>
              </div>
            );
          })}
        </div>

        {/* Detailed comparison */}
        <div className="mt-20">
          <p className="text-center epm-body font-semibold tracking-wide text-brand">
            {comparison.eyebrow}
          </p>
          <Table
            columns={comparison.columns}
            rows={comparison.rows}
            highlightCol={1}
          />
        </div>

        {/* At a glance */}
        <div className="mt-20">
          <SectionLabel>{glance.eyebrow}</SectionLabel>
          <Table columns={glance.columns} rows={glance.rows} highlightCol={1} />
        </div>

        {/* Closing quote */}
        <div className="mt-16 rounded-2xl bg-[linear-gradient(108.08deg,#0B2A5B_0%,#1D5BFF_100%)] px-8 py-10 text-center shadow-[0px_12.78px_31.94px_-19.16px_#0C1E3A47,0px_0.8px_1.6px_0px_#0C1E3A0D]">
          <p className="mx-auto max-w-3xl font-display text-lg leading-snug font-medium text-white md:text-xl">
            “{vs.quote}”
          </p>
        </div>
      </div>
    </section>
  );
}
