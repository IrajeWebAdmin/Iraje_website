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
        className={`mt-20 ${matrix ? "grid gap-12 lg:grid-cols-[1fr_600px] lg:items-center" : ""}`}
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
        <div className="mx-auto flex w-full flex-col items-center justify-center rounded-[38px] border border-[#E8ECF4] bg-white p-6 shadow-[0_12px_40px_rgba(2,41,102,0.07)]">
          {/* Invisible mirror of the axis captions rendered below the panel. It
              reserves the same height above, so the gap between the white card
              and the blue panel is equal top and bottom — no magic numbers. */}
          <div aria-hidden="true" className="invisible flex flex-col">
            <p className="mt-4 text-center text-[13px] font-bold tracking-wide">
              {matrix.axisX}
            </p>
            <p className="mt-1.5 text-center text-xs font-medium">
              {matrix.caption}
            </p>
          </div>

          {/* Row: Y-axis label + panel + a mirrored spacer. The spacer matches the
              label's width, so the blue panel sits dead-centre in the white card
              while the label stays vertically centred beside it. */}
          <div className="flex items-center justify-center">
            {/* Y axis label (reads bottom → top), centred against the panel. */}
            <span className="flex h-82.5 w-12 shrink-0 items-center justify-center rotate-180 text-xs font-semibold tracking-wide text-ink [writing-mode:vertical-rl]">
              {matrix.axisY}
            </span>

            {/* Light-blue quadrant panel */}
            <div className="relative flex h-82.5 w-107.5 shrink-0 flex-col rounded-[38px] bg-[#F4F8FF] px-5 py-5">
              {/* Vertical dashed divider — spans the panel's full height (not just
                  the quadrant grid) so the cross reaches the top and bottom edges.
                  The panel's padding is symmetric, so left-1/2 still lines up with
                  the grid's centre column. */}
              <span className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-dashed border-slate-300" />

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
                {/* Horizontal dashed divider — sits at the quadrant grid's centre
                    but extends past the panel's px-5 padding (-left-5/-right-5) so
                    it meets both side edges and joins the vertical line. */}
                <span className="pointer-events-none absolute -left-5 -right-5 top-1/2 -translate-y-1/2 border-t border-dashed border-slate-300" />
                {matrix.cells.map((cell, i) => (
                  <div
                    key={i}
                    className="group flex flex-col items-center justify-center px-3 text-center text-[13px] leading-relaxed text-slate-500"
                  >
                    {cell.lines.map((line, idx) => (
                      <p
                        key={line}
                        className={
                          cell.highlight && idx === 0
                            ? "font-semibold text-brand transition-all duration-300 group-hover:text-navy group-hover:[text-shadow:0_0_14px_rgba(4,81,204,0.45)]"
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

            {/* Mirrors the axis label's width so the panel stays dead-centre. */}
            <span aria-hidden="true" className="w-12 shrink-0" />
          </div>

          {/* X axis + caption — centred under the panel */}
          <p className="mt-4 text-center text-[13px] font-bold tracking-wide text-ink">
            {matrix.axisX}
          </p>
          <p className="mt-1.5 text-center text-xs font-medium text-brand">
            {matrix.caption}
          </p>
        </div>
        )}
      </div>
    </EpmSection>
  );
}
