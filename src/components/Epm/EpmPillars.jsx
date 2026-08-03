import Image from "next/image";
import EpmSection from "./EpmSection";
import epm from "@/data/epm";

// Reuse the CapabilityStrip icons — pillars share the same six capability
// names (Manage, Monitor, …), so key the strip's SVGs by name.
const STRIP_ICONS = Object.fromEntries(
  epm.hero.strip.map((s) => [s.name, s.icon]),
);

export default function EpmPillars() {
  const { eyebrow, heading, body, items } = epm.pillars;

  return (
    <EpmSection paddingClassName="py-15">
      {/* Section header — global epm-* classes, matching the other sections. */}
      <div className="mx-auto max-w-6xl text-center">
        <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
          {eyebrow}
        </span>
        <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black">
          {heading}
        </h2>
        <p className="mt-8 epm-body leading-relaxed text-[#8E8E93] lg:whitespace-nowrap">
          {body}
        </p>
      </div>

      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((pillar) => {
          const icon = STRIP_ICONS[pillar.name];
          return (
            <div
              key={pillar.name}
              className="card-hover rounded-[20px] border border-black/10 bg-white p-7"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-[38px] w-[41px] shrink-0 items-center justify-center rounded-lg bg-[#0451CC]">
                  {icon && (
                    <Image
                      src={icon}
                      alt=""
                      width={20}
                      height={20}
                      // brightness-0 invert renders the brand-blue SVG solid white
                      className="h-5 w-5 brightness-0 invert"
                    />
                  )}
                </span>
                <h3 className="font-display text-2xl font-medium text-black">
                  {pillar.name}
                </h3>
              </div>
              <ul className="mt-6 list-disc space-y-4 ps-5 text-sm font-light text-[#020111]">
                {pillar.features.map((feature) => (
                  <li key={feature} className="leading-normal">
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </EpmSection>
  );
}
