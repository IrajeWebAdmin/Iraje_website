import {
  FiShield,
  FiEye,
  FiCheck,
  FiSun,
  FiArrowLeft,
  FiUsers,
} from "react-icons/fi";
import AboutSection from "./AboutSection";
import about from "@/data/about";

// Positional to the culture.items order: Security First, Customer Success,
// Integrity & Trust, Innovation, Simplicity, One Team.
const VALUE_ICONS = [FiShield, FiEye, FiCheck, FiSun, FiArrowLeft, FiUsers];

export default function AboutCulture() {
  const { eyebrow, heading, body, items, badges } = about.culture;

  return (
   <AboutSection paddingClassName="py-15">
         {/* Section header — global epm-* classes, matching the other sections. */}
         <div className="mx-auto max-w-6xl text-center">
           <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
             {eyebrow}
           </span>
           <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black">
             {heading}
           </h2>
           <p className="mx-auto mt-8 max-w-3xl epm-body leading-relaxed text-[#8E8E93]">
             {body}
           </p>
         </div>

      {/* Value cards */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const Icon = VALUE_ICONS[i] ?? FiShield;
          return (
            <div
              key={item.title}
              className="relative flex flex-col overflow-hidden rounded-2xl border border-[#0C1E3A1A] bg-white p-7 text-left shadow-[0px_1px_2px_0px_#0C1E3A0D]"
            >
              {/* Gradient top accent (blue → teal), clipped to the card radius */}
              <span className="absolute inset-x-0 top-0 h-0.75 bg-linear-to-r from-brand to-[#22C7B8]" />
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E3E9FF] text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8E8E93]">
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
            className="inline-flex items-center gap-2 rounded-full border border-[#0C1E3A1A] bg-white px-4 py-2.25 text-sm font-medium text-ink/80 shadow-[0px_1px_2px_0px_#0C1E3A0D]"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#EEF3FF]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.icon} alt="" className="h-4 w-4" />
            </span>
            {b.label}
          </span>
        ))}
      </div>
    </AboutSection>
  );
}
