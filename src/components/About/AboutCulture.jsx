import {
  FiShield,
  FiHeart,
  FiCheckCircle,
  FiZap,
  FiFeather,
  FiUsers,
} from "react-icons/fi";
import AboutSection from "./AboutSection";
import about from "@/data/about";

const VALUE_ICONS = [FiShield, FiHeart, FiCheckCircle, FiZap, FiFeather, FiUsers];

export default function AboutCulture() {
  const { eyebrow, heading, body, items, badges } = about.culture;

  return (
    <AboutSection center eyebrow={eyebrow} heading={heading} intro={body}>
      {/* Value cards */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const Icon = VALUE_ICONS[i] ?? FiShield;
          return (
            <div
              key={item.title}
              className="flex flex-col rounded-2xl border border-mist border-t-2 border-t-brand bg-white p-7 text-left"
            >
              <span className="font-mono text-xs font-semibold text-slate-soft">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#E3E9FF] text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-soft">
                {item.body}
              </p>
            </div>
          );
        })}
      </div>

      {/* Badges */}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {badges.map((b) => (
          <span
            key={b.label}
            className="inline-flex items-center gap-2 rounded-full border border-mist bg-white px-5 py-2.5 text-sm font-medium text-ink/80"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.icon} alt="" className="h-5 w-5" />
            {b.label}
          </span>
        ))}
      </div>
    </AboutSection>
  );
}
