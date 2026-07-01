import PamSection from "./PamSection";
import { FiCheck } from "react-icons/fi";
import pam from "@/data/pam";

export default function PamMaturity() {
  const { eyebrow, heading, body, flow, levels } = pam.maturity;

  return (
    <PamSection
      center
      eyebrow={eyebrow}
      heading={heading}
      intro={body}
      eyebrowClassName="epm-eyebrow-normal"
      headClassName="max-w-none"
      headingClassName="md:whitespace-nowrap"
    >
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {levels.map((level) => (
          <div
            key={level.level}
            className="flex flex-col rounded-3xl border border-mist bg-white p-7 text-left"
          >
            <span className="text-xs font-semibold tracking-[0.14em] text-brand uppercase">
              {level.level}
            </span>
            <h3 className="mt-2 font-display text-xl font-semibold text-ink">
              {level.name}
            </h3>
            <ul className="mt-5 space-y-3 border-t border-[#EDF1F9] pt-5">
              {level.features.map((feature) => (
                <li
                  key={feature}
                  className="flex gap-2.5 text-[13px] leading-snug text-ink/75"
                >
                  <FiCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-sm font-semibold tracking-[0.22em] text-brand uppercase">
        {flow}
      </p>
    </PamSection>
  );
}
