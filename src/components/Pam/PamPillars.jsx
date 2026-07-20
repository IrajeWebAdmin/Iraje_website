import Image from "next/image";
import PamSection from "./PamSection";
import pam from "@/data/pam";
import epm from "@/data/epm";

// Reuse the CapabilityStrip icons — the PAM pillars share the same six
// capability names (Manage, Monitor, …), so key the strip's SVGs by name.
const STRIP_ICONS = Object.fromEntries(
  epm.hero.strip.map((s) => [s.name, s.icon]),
);

export default function PamPillars() {
  const { eyebrow, heading, body, items } = pam.pillars;

  return (
    <PamSection  paddingClassName="py-15">
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

      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((pillar) => {
          const icon = STRIP_ICONS[pillar.name];
          return (
          <div
            key={pillar.name}
            className="flex flex-col rounded-3xl border border-mist bg-white p-7 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-[41px] w-[41px] shrink-0 items-center justify-center rounded-xl bg-brand">
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
              <h3 className="font-display text-2xl font-medium text-ink">
                {pillar.name}
              </h3>
            </div>
            <span className="mt-3 w-fit rounded-full  px-3 py-1 text-[11px] font-semibold tracking-[0.1em] text-brand uppercase">
              {pillar.team}
            </span>
            <div className="mt-6 flex flex-wrap gap-2">
              {pillar.tags.map((tag) => {
                const highlighted = pillar.highlights?.includes(tag);
                return (
                  <span
                    key={tag}
                    className={`rounded-[5px] border px-3 py-1.5 text-xs font-medium ${
                      highlighted
                        ? "border-[#C4D6FF] bg-[#EAF1FF] text-brand"
                        : "border-[#E3E8F4] bg-[#F6F8FD] text-ink/75"
                    }`}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>
          );
        })}
      </div>
    </PamSection>
  );
}
