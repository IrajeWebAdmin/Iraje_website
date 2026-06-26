import Link from "next/link";
import {
  FiArrowRight,
  FiUsers,
  FiDatabase,
  FiCloud,
  FiKey,
} from "react-icons/fi";
import pam from "@/data/pam";

// Icon per privileged-account row, in the card's listed order.
const PILL_ICONS = [FiUsers, FiDatabase, FiCloud, FiKey];

export default function PamHero() {
  const { eyebrow, subtitle, ctas, card } = pam.hero;

  return (
    <section className="relative overflow-hidden bg-[#022966] text-white">
      {/* Base vertical gradient #0451cc -> #022966, plus a top-right blue glow — from Figma */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#0451cc_0%,#022966_100%)] opacity-90" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_-5%,#2a63e8_0%,transparent_45%)]" />

      <div className="container-global relative pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Copy */}
          <div>
            <p className="epm-eyebrow epm-eyebrow-normal font-medium text-[#FFCE0C]">
              {eyebrow}
            </p>
            <h1 className="mt-5 max-w-[640px] text-4xl leading-[1.1] font-semibold md:text-6xl">
              Secure every
              <br />
              privileged <span className="text-[#FFCE0C]">identity.</span>
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
                    className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-navy transition hover:bg-mist"
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

          {/* Privileged accounts card */}
          <div className="relative rounded-3xl border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-xl md:p-8">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-white/80" />
              <span className="text-xs font-semibold tracking-[0.32em] text-white uppercase">
                {card.eyebrow}
              </span>
            </div>

            <ul className="mt-8 space-y-4">
              {card.pills.map((pill, i) => {
                const Icon = PILL_ICONS[i] ?? FiKey;
                return (
                  <li
                    key={pill}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-base text-white/90 md:text-lg">
                      {pill}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
