import Link from "next/link";
import Image from "next/image";
import { FiShield, FiCheck, FiArrowRight } from "react-icons/fi";
import epm from "@/data/epm";

export default function EpmHero() {
  const { eyebrow, title, subtitle, ctas, card, strip } = epm.hero;

  return (
    <section className="relative overflow-visible bg-[#022966] text-white">
      {/* Background: linear gradient #0451cc (0.28%) -> #022966 (100%) — from Figma */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#0451cc_0.28%,#022966_100%)]" />

      {/* Extra bottom padding on lg leaves blue space for the CapabilityStrip
          (rendered as the next sibling) to straddle the hero/white boundary. */}
      <div className="epm-container relative pt-32 pb-14 md:pt-40 lg:pb-36">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Copy — @container so the h1 below can size itself from this
              column's real width. Sizing it off the viewport does not work
              here: at lg the column drops from the full container to ~52% of
              it, so the same viewport means two very different column widths
              either side of that breakpoint. */}
          <div className="@container">
            <p className="epm-eyebrow epm-eyebrow-normal font-medium text-[#FFCE0C]">
              {eyebrow}
            </p>
            {/* <h1 className="mt-5 font-display text-4xl leading-[1.07] font-bold tracking-tight md:text-6xl">
              {title}
            </h1> */}
            {/* The lines are hard-broken with <br>, so the type has to fit the
                column or the breaks double up ("Your first line" / "of"). The
                longest line, "defence, right at", is ~8.1em — at the old flat
                md:text-7xl that is ~583px, wider than this column is anywhere
                below ~1250px. 10.5cqw keeps it at ~85% of the column instead,
                and min() caps it at the same 4.5rem it renders today, which it
                reaches around 1500px. Under 768px the flat text-4xl stands. */}
            <h1 className="mt-5 max-w-[700px] text-4xl leading-[1.1] font-semibold md:text-[min(4.5rem,10.5cqw)]">
              Your first line of
              <br />
              defence, right at
              <br />
              the <span className="text-[#FFCE0C]">endpoint.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
              {subtitle}
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              {ctas.map((cta) =>
                cta.primary ? (
                  <Link
                    key={cta.label}
                    href={cta.href}
                    className="text-navy hover:bg-mist inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold transition"
                  >
                    {cta.label}
                  </Link>
                ) : (
                  <Link
                    key={cta.label}
                    href={cta.href}
                    className="group inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-white/60"
                  >
                    {cta.label}
                    <FiArrowRight className="transition group-hover:translate-x-0.5" />
                  </Link>
                ),
              )}
            </div>
          </div>

          {/* Shield card */}
          <div className="relative rounded-3xl border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-xl md:p-8">
            {/* <div className="text-azure-bright flex items-center gap-2.5">
              <FiShield className="h-5 w-5" />
                <span className="text-xs font-semibold tracking-[0.35em] uppercase text-white">
                {card.eyebrow}
              </span>
            </div> */}

            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-white/80"></span>

              <span className="text-xs font-semibold tracking-[0.35em] text-white uppercase">
                {card.eyebrow}
              </span>
            </div>

            <ul className="mt-8 space-y-4">
              {card.pills.map((pill) => (
                <li
                  key={pill.text}
                  className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.05] px-5 py-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
                    <Image src={pill.icon} alt="" width={22} height={22} />
                  </div>

                  <span className="text-lg text-white/90">{pill.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Capability strip — hairlines via gap-px showing the container bg */}
        {/* <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3 lg:grid-cols-6">
          {strip.map((item) => (
            <div key={item.name} className="bg-navy/80 px-5 py-5 backdrop-blur">
              <p className="font-display text-base font-semibold text-white">
                {item.name}
              </p>
              <p className="text-azure-bright mt-1 font-mono text-[10px] tracking-[0.18em]">
                {item.label}
              </p>
            </div>
          ))}
        </div> */}

        
      </div>
    </section>
  );
}
