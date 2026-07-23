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
        <p className="mx-auto mt-8 max-w-3xl epm-body leading-relaxed text-slate-soft">
          {body}
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => {
          const Icon = ICONS[item.icon] ?? BsShieldCheck;
          return (
            <div
              key={item.title}
              className="flex flex-col items-center rounded-3xl border border-mist bg-white p-7 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E4EAFB] text-brand">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-base font-semibold text-ink">
                {item.title}
              </h3>
            </div>
          );
        })}
      </div>
    </PamSection>
  );
}
