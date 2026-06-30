import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import about from "@/data/about";

export default function AboutHero() {
  const { eyebrow, titleLead, titleAccent, body, ctas } = about.hero;

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Decorative right panel */}
      <div className="pointer-events-none absolute top-0 right-0 hidden h-full w-[42%] rounded-bl-[3rem] bg-[#EEF4FF] lg:block" />

      <div className="container-global relative pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="max-w-2xl">
          <p className="epm-eyebrow epm-eyebrow-normal text-brand">{eyebrow}</p>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] text-ink md:text-6xl">
            {titleLead} <span className="text-brand italic">{titleAccent}</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-soft md:text-lg">
            {body}
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            {ctas.map((cta) => (
              <Link
                key={cta.label}
                href={cta.href}
                className={
                  cta.primary
                    ? "inline-flex items-center gap-2 rounded-xl bg-brand px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-brand/90"
                    : "inline-flex items-center gap-2 rounded-xl border border-mist px-7 py-3.5 text-sm font-semibold text-ink transition hover:bg-[#F6F8FD]"
                }
              >
                {cta.label}
                {cta.primary && <FiArrowRight className="h-4 w-4" />}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
