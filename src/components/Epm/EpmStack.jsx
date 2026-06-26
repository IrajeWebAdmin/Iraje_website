import EpmSection from "./EpmSection";
import { BsShieldCheck } from "react-icons/bs";
import epm from "@/data/epm";

export default function EpmStack() {
  const { eyebrow, heading, body, layers, note, matrix } = epm.stack;

  return (
    <EpmSection
      tone="light"
      center
      eyebrow={eyebrow}
      eyebrowClassName="epm-eyebrow-normal"
      heading={heading}
      intro={body}
    >
      {/* Security-stack layers — every layer detects/responds except the one
          preventive layer (Iraje EPM), which is highlighted in brand blue. */}
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  hl ? "bg-white/15 text-white" : "bg-[#EAF1FF] text-brand"
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
        className={`mt-20 ${matrix ? "grid gap-12 lg:grid-cols-2 lg:items-center" : ""}`}
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
        <div className="rounded-3xl border border-[#E8ECF4] bg-white p-6 shadow-[0_12px_40px_rgba(2,41,102,0.07)] md:p-8">
          <div className="flex gap-3">
            {/* Y axis label (reads bottom → top) */}
            <span className="flex items-center rotate-180 text-xs font-semibold tracking-wide text-ink [writing-mode:vertical-rl]">
              {matrix.axisY}
            </span>

            <div className="flex-1">
              <div className="relative rounded-2xl bg-[#F4F8FF] px-5 py-6">
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
