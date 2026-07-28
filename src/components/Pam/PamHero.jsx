import Link from "next/link";
import { FiLock, FiDatabase, FiCloud, FiHome } from "react-icons/fi";
import pam from "@/data/pam";

// Icon per feature row, in the card's listed order (matches the Figma design).
const PILL_ICONS = [FiLock, FiDatabase, FiCloud, FiHome];

export default function PamHero() {
  const { eyebrow, subtitle, ctas, card } = pam.hero;

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(120%_130%_at_85%_0%,#19347F_0%,#0D214A_38%,#0A1733_100%)] text-white">
      <div className="container-global relative pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Copy */}
          <div>
            <p className="epm-eyebrow epm-eyebrow-normal font-medium text-[#FFCE0C]">
              {eyebrow}
            </p>
            <h1 className="mt-5 max-w-[640px] text-4xl leading-[1.1] font-semibold md:text-6xl">
              Manage, Monitor & Control every{" "}
              <span className="text-[#FFCE0C]">privileged access</span> in your
              enterprise.
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
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-white/60"
                  >
                    {cta.label}
                  </Link>
                ),
              )}
            </div>
          </div>

          {/* Feature card */}
          <div className="relative rounded-3xl border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-xl md:p-8">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-white/60" />
              <span className="text-xs font-semibold tracking-[0.28em] text-[#9DB4E8] uppercase">
                {card.eyebrow}
              </span>
            </div>

            <ul className="mt-8 space-y-4">
              {card.pills.map((pill, i) => {
                const Icon = PILL_ICONS[i] ?? FiLock;
                return (
                  <li
                    key={pill}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#33509A] text-[#AFC6FF]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[15px] text-white/90">{pill}</span>
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
