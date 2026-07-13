import Link from "next/link";
import {
  FiArrowRight,
  FiCheck,
  FiGrid,
  FiStar,
  FiShield,
  FiShare2,
} from "react-icons/fi";
import AboutSection from "./AboutSection";
import about from "@/data/about";

// Card order matches the data sequence: Resellers, System Integrators, MSSPs, Technology Partners
const TYPE_ICONS = [FiGrid, FiStar, FiShield, FiShare2];

export default function AboutPartners() {
  const { eyebrow, heading, body, types, offersTitle, offers, cta } =
    about.partners;

  return (
    <AboutSection tone="tint" paddingClassName="py-15">
      {/* Section header — global epm-* classes, left-aligned per the design. */}
      <div className="max-w-4xl text-left">
        <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
          {eyebrow}
        </span>
        <h2 className="mt-4 epm-heading leading-[1.05] font-medium tracking-[-2px] text-black">
          {heading}
        </h2>
        <p className="mt-8 max-w-3xl epm-body leading-relaxed text-[#8E8E93]">
          {body}
        </p>
      </div>

      {/* Partner types */}
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {types.map((t, i) => {
          const Icon = TYPE_ICONS[i] ?? FiGrid;
          return (
            <div
              key={t.title}
              className="rounded-2xl border border-mist bg-white p-6 text-left shadow-[0px_1.04px_2.08px_0px_#0C1E3A0D]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E3E9FF] text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold text-ink">
                {t.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-soft">
                {t.body}
              </p>
            </div>
          );
        })}
      </div>

      {/* Offers */}
      <div className="mt-8 rounded-3xl border border-mist bg-white p-8 text-left md:p-10">
        <h3 className="font-display text-xl font-semibold text-ink">
          {offersTitle}
        </h3>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {offers.map((o) => (
            <li key={o} className="flex gap-3">
              <FiCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span className="text-sm leading-snug text-ink/80">{o}</span>
            </li>
          ))}
        </ul>
        <Link
          href={cta.href}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-brand/90"
        >
          {cta.label}
          <FiArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </AboutSection>
  );
}
