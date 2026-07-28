import PamSection from "./PamSection";
import { BsShieldCheck, BsLightbulb } from "react-icons/bs";
import { FiHeadphones, FiGrid, FiFlag } from "react-icons/fi";
import pam from "@/data/pam";

// Per-card icons, keyed by the `icon` field on each whyIraje item.
const ICONS = {
  shield: BsShieldCheck,
  support: FiHeadphones,
  innovation: BsLightbulb,
  architecture: FiGrid,
  roadmap: FiFlag,
};

export default function PamWhyIraje() {
  const { eyebrow, heading, body, items } = pam.whyIraje;

  return (
    <PamSection tone="tint"  paddingClassName="py-15">
      {/* Section header — global epm-* classes, matching the other sections. */}
      <div className="mx-auto max-w-6xl text-center">
        <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
          {eyebrow}
        </span>
        <h2 className="mx-auto mt-4 max-w-3xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black">
          {heading}
        </h2>
        <p className="mx-auto mt-8 max-w-3xl epm-body leading-relaxed text-[#8E8E93] lg:text-nowrap">
          {body}
        </p>
      </div>

      {/* 5 × 231.9px cards + 4 × 24px gaps = 1255.5px — cap the grid so the
          cards land on their Figma width instead of stretching to 1600. */}
      <div className="mx-auto mt-12 grid max-w-[1256px] gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => {
          const Icon = ICONS[item.icon] ?? BsShieldCheck;
          return (
            <div
              key={item.title}
              className="flex min-h-[203px] flex-col items-center justify-center rounded-[28px] border border-[#7070703D] bg-[#F4F8FF] p-6 text-center"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E4EAFB] text-brand">
                <Icon className="h-5 w-5" />
              </span>
              {/* Reserve two lines so a wrapping title (e.g. "Scalable & Secure
                  Architecture") doesn't shift its card's icon and first text
                  line out of line with the neighbouring cards. */}
              <h3 className="mt-3 min-h-12 font-display text-base leading-6 font-semibold text-ink">
                {item.title}
              </h3>
            </div>
          );
        })}
      </div>
    </PamSection>
  );
}
