import Link from "next/link";
import {
  FiArrowRight,
  FiCheck,
  FiUsers,
  FiSettings,
  FiShield,
  FiLink,
} from "react-icons/fi";
import AboutSection from "./AboutSection";
import about from "@/data/about";

const TYPE_ICONS = [FiUsers, FiSettings, FiShield, FiLink];

export default function AboutPartners() {
  const { eyebrow, heading, body, types, offersTitle, offers, cta } =
    about.partners;

  return (
    <AboutSection tone="tint" eyebrow={eyebrow} heading={heading} intro={body}>
      {/* Partner types */}
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {types.map((t, i) => {
          const Icon = TYPE_ICONS[i] ?? FiUsers;
          return (
            <div
              key={t.title}
              className="rounded-2xl border border-mist bg-white p-6 text-left"
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
