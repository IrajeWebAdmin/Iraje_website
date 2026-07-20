import EpmSection from "./EpmSection";
import { BsShieldCheck } from "react-icons/bs";
import epm from "@/data/epm";

export default function EpmStack() {
  const { eyebrow, heading, body, columns, note, matrix } = epm.stack;

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

        <p className="mx-auto mt-8 epm-body leading-relaxed text-[#8E8E93]">
          {[].concat(body).join(" ")}
        </p>
      </div>

      {/* Security-stack layers grouped under the action each performs —
          Prevent / Detect / Respond. Every layer detects or responds except the
          one preventive layer (Iraje EPM), highlighted in brand blue. Each
          column stacks its header card above its layer cards; on mobile the
          three columns stack vertically, header-then-cards. */}
      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {columns.map((column) => (
          <div key={column.header} className="flex flex-col gap-4">
            {/* Column header — the action this group of layers performs */}
            <div className="flex items-center justify-center rounded-xl border border-[#E8ECF4] bg-white px-5 py-4">
              <span
                className={`text-lg font-semibold text-blue-600 ${
                  column.emphasis ? "underline underline-offset-4" : ""
                }`}
              >
                {column.header}
              </span>
            </div>

            {column.layers.map((layer) => {
              const hl = layer.highlight;
              return (
                <div
                  key={layer.name}
                  className={`flex items-start gap-3.5 rounded-xl border px-5 py-4 ${
                    hl
                      ? "epm-glow border-transparent bg-brand"
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
        ))}
      </div>

      {/* Why detection alone isn't enough + the BASIC → ADVANCED maturity matrix */}
      <div
        className={`mt-20 ${matrix ? "grid gap-12 lg:grid-cols-[1fr_700px] lg:items-center" : ""}`}
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
        <div className="w-full rounded-[38px] border border-[#E8ECF4] bg-white px-10 py-10 shadow-[0_12px_40px_rgba(2,41,102,0.07)] md:p-8 lg:flex lg:min-h-[560px] lg:flex-col lg:items-center lg:justify-center">
          {/* Panel block — centred in the card. The Y-axis label is positioned
              absolutely to the panel's left so it never pushes the blue panel
              off-centre: the panel itself sits at the card's horizontal centre. */}
          <div className="relative mx-auto w-fit">
            {/* Y axis label (reads bottom → top) — vertically centred against the
                blue panel (top-0 + h-[300px] matches the panel height), floating
                just left of it. */}
            <span className="absolute top-0 -left-12 flex h-75 items-center rotate-180 text-xs font-semibold tracking-wide text-ink [writing-mode:vertical-rl]">
              {matrix.axisY}
            </span>

            {/* Light-blue quadrant panel */}
            <div className="relative flex h-[300px] w-[390px] flex-col rounded-[38px] bg-[#F4F8FF] px-5 py-5">
              {/* column headers — one centred over each column */}
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

              {/* 2×2 quadrant grid — fills the panel; the dashed dividers span the
                  full quadrant area and meet exactly at the centre, splitting the
                  panel cleanly into four connected quadrants. */}
              <div className="relative mt-6 grid flex-1 grid-cols-2 grid-rows-2">
                {/* vertical dashed divider — full height, dead centre */}
                <span className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-dashed border-slate-300" />
                {/* horizontal dashed divider — full width, dead centre */}
                <span className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-slate-300" />
                {matrix.cells.map((cell, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center px-3 text-center text-[13px] leading-relaxed text-slate-500"
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

            {/* X axis + caption — centred under the panel */}
            <p className="mt-4 text-center text-[13px] font-bold tracking-wide text-ink">
              {matrix.axisX}
            </p>
            <p className="mt-1.5 text-center text-xs font-medium text-brand">
              {matrix.caption}
            </p>
          </div>
        </div>
        )}
      </div>
    </EpmSection>
  );
}
