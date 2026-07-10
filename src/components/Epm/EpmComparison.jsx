import epm from "@/data/epm";

// Brand gradient shared by the highlighted EPM card and the closing quote band.
const BRAND_GRADIENT =
  "bg-[linear-gradient(120deg,#022966_0%,#1d5bff_100%)]";

function Table({ columns, rows, highlightCol = 1 }) {
  return (
    <div className="mt-8 overflow-x-auto rounded-2xl border border-[#E3E8F4]">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead>
          <tr>
            {columns.map((col, c) => (
              <th
                key={col}
                className={`px-6 py-6 align-middle text-[15px] font-semibold ${
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
            <tr key={row[0]} className="border-t border-[#E6EBF5]">
              {row.map((cell, c) => (
                <td
                  key={c}
                  className={`px-6 py-4 align-top leading-snug ${
                    c === highlightCol
                      ? "bg-[#DFEBFF] text-ink"
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
    <section className="bg-[#F4F8FF] py-20 text-ink md:py-28">
      <div className="epm-container">
        {/* Intro */}
        <div className="mx-auto max-w-4xl text-center">
          <SectionLabel>{vs.eyebrow}</SectionLabel>
          <h2 className="mt-4 font-display epm-heading leading-[1.1] font-bold text-ink">
            {vs.heading}
          </h2>
          <p className="mx-auto mt-6 max-w-3xl epm-body leading-relaxed text-slate-soft">
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
                className={`rounded-2xl p-7 ${
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
                    className={`text-sm font-medium ${hl ? "text-white/70" : "text-slate-soft"}`}
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
                  className={`mt-3 text-sm leading-relaxed ${hl ? "text-white/70" : "text-slate-soft"}`}
                >
                  {card.body}
                </p>
              </div>
            );
          })}
        </div>

        {/* Detailed comparison */}
        <div className="mt-20">
          <SectionLabel>{comparison.eyebrow}</SectionLabel>
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
        <div className={`mt-16 rounded-2xl px-8 py-10 text-center ${BRAND_GRADIENT}`}>
          <p className="mx-auto max-w-3xl font-display text-lg leading-snug font-medium text-white md:text-xl">
            “{vs.quote}”
          </p>
        </div>
      </div>
    </section>
  );
}
