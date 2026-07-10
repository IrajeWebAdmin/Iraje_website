import EpmSection from "./EpmSection";
import { BsShieldCheck } from "react-icons/bs";
import epm from "@/data/epm";

export default function EpmStack() {
  const { eyebrow, heading, body, layers, note, matrix } = epm.stack;

  return (
    <EpmSection tone="light" paddingClassName="py-15">
      {/* Section header — custom classes to match the EpmThreat treatment */}
      <div className="mx-auto max-w-6xl text-center">
        <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
          {eyebrow}
        </span>

        <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black lg:whitespace-nowrap">
          {heading}
        </h2>

        <p className="mx-auto mt-8 max-w-4xl epm-body font-medium leading-relaxed text-[#8E8E93]">
          {[].concat(body).map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </p>
      </div>

      {/* Security-stack layers — every layer detects/responds except the one
          preventive layer (Iraje EPM), which is highlighted in brand blue.
          Column-major fill (grid-flow-col + fixed row count) so the data order
          runs DOWN each column exactly as designed: col1 = layers 1–5, etc.
          Rows are auto-height so a two-line role only grows its own row. */}
      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-none sm:grid-flow-col sm:auto-cols-fr sm:grid-rows-[repeat(8,auto)] lg:grid-rows-[repeat(5,auto)]">
        {layers.map((layer) => {
          const hl = layer.highlight;
          return (
            <div
              key={layer.name}
              className={`flex items-start gap-3.5 rounded-xl border px-5 py-4 ${
                hl
                  ? "border-transparent bg-brand shadow-lg shadow-brand/25"
                  : "border-[#E8ECF4] bg-white"
              }`}
            >
              <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  hl ? "bg-white text-brand" : "bg-[#EAF1FF] text-brand"
                }`}
              >
                <BsShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <p
                  className={`text-[15px] font-semibold ${hl ? "text-white" : "text-ink"}`}
                >
                  {layer.name}
                </p>
                <p
                  className={`mt-0.5 text-[13px] leading-snug ${hl ? "text-white/75" : "text-slate-soft"}`}
                >
                  {layer.role}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Why detection alone isn't enough + the BASIC → ADVANCED maturity matrix */}
      <div
        className={`mt-20 ${matrix ? "grid gap-12 lg:grid-cols-[1fr_619px] lg:items-center" : ""}`}
      >
        {/* Left: explanation */}
        <div className="text-left">
          <h3 className="font-display text-2xl font-semibold text-ink md:text-3xl">
            {note.heading}
          </h3>
          {(note.paragraphs ?? [note.body]).map((p) => (
            <p
              key={p}
              className="mt-5 max-w-xl text-sm leading-relaxed text-slate-soft md:text-base"
            >
              {p}
            </p>
          ))}
        </div>

        {/* Right: maturity matrix (only when matrix data is provided) */}
        {matrix && (
        <div className="w-full rounded-[38px] border border-[#E8ECF4] bg-white p-6 shadow-[0_12px_40px_rgba(2,41,102,0.07)] md:p-8 lg:flex lg:min-h-131.25 lg:flex-col lg:justify-center">
          <div className="flex items-start gap-3">
            {/* Y axis label (reads bottom → top) — height matches the panel
                (h-91.75) so its centered text aligns with the panel's center. */}
            <span className="flex h-91.75 items-center rotate-180 text-xs font-semibold tracking-wide text-ink [writing-mode:vertical-rl]">
              {matrix.axisY}
            </span>

            <div className="flex-1">
              <div className="relative h-91.75 w-111 rounded-[38px] bg-[#F4F8FF] px-5 py-6">
                {/* vertical dashed divider */}
                <span className="pointer-events-none absolute inset-y-6 left-1/2 -translate-x-1/2 border-l border-dashed border-slate-300" />

                {/* column headers */}
                <div className="grid grid-cols-2 text-center">
                  {matrix.columns.map((c) => (
                    <span
                      key={c}
                      className="text-[13px] font-bold tracking-wide text-ink"
                    >
                      {c}
                    </span>
                  ))}
                </div>

                {/* 2x2 quadrant cells */}
                <div className="relative mt-6 grid grid-cols-2">
                  {/* horizontal dashed divider */}
                  <span className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-slate-300" />
                  {matrix.cells.map((cell, i) => (
                    <div
                      key={i}
                      className={`px-3 text-center text-[13px] leading-relaxed text-slate-500 ${
                        i < 2 ? "pb-10" : "pt-10"
                      }`}
                    >
                      {cell.lines.map((line, idx) => (
                        <p
                          key={line}
                          className={
                            cell.highlight && idx === 0
                              ? "font-semibold text-brand"
                              : ""
                          }
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* X axis + caption */}
              <p className="mt-5 text-center text-[13px] font-bold tracking-wide text-ink">
                {matrix.axisX}
              </p>
              <p className="mt-1.5 text-center text-xs font-medium text-brand">
                {matrix.caption}
              </p>
            </div>
          </div>
        </div>
        )}
      </div>
    </EpmSection>
  );
}
