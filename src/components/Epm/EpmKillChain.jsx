import { Fragment } from "react";
import Image from "next/image";
import EpmSection from "./EpmSection";
import { FiArrowRight } from "react-icons/fi";
import epm from "@/data/epm";

export default function EpmKillChain() {
  const { eyebrow, heading, body, steps, blockedIndex, blockedLabel } =
    epm.killChain;

  return (
    <EpmSection tone="light" paddingClassName="py-15">
      {/* Section header — custom classes to match the EpmThreat treatment */}
      <div className="mx-auto max-w-6xl text-center">
        <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
          {eyebrow}
        </span>

        <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black lg:whitespace-nowrap">
          {heading}
        </h2>

        <p className="mx-auto mt-8 max-w-4xl epm-body  leading-relaxed text-[#8E8E93]">
          {body}
        </p>
      </div>

      {/* Circles + arrows are ONE continuous row (items-center), so arrows
          align to the exact vertical center of the circles. The label — and,
          for the blocked step, the "BLOCKED BY EPM" badge — sit absolutely
          beneath each circle, out of normal flow, so they never shift the
          circle row. pb-24 reserves room for that stacked content. */}
      <div className="mt-14 flex items-center pb-24">
        {steps.map((step, i) => {
          const blocked = i === blockedIndex;
          return (
            <Fragment key={step.label}>
              <div
                className={`relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full transition md:h-[104px] md:w-[104px] ${
                  blocked ? "bg-[#BBD0F1]" : "bg-[#F8E9E7]"
                }`}
              >
                <Image
                  src={step.icon}
                  alt=""
                  width={48}
                  height={48}
                  className="h-9 w-9 md:h-11 md:w-11"
                />

                {/* Label (+ blocked badge) underneath, out of flow */}
                <div className="absolute top-full left-1/2 mt-4 flex w-[160px] -translate-x-1/2 flex-col items-center gap-2 text-center">
                  <span className="text-[15px] leading-snug font-medium text-ink md:text-[17px]">
                    {step.label}
                  </span>
                  {blocked && (
                    <span className="px-3 py-1 font-mono text-[13px] font-medium  whitespace-nowrap text-[#0451CC] ">
                      ✕ {blockedLabel}
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow grows to fill the gap, spreading circles across the
                  full epm-container width */}
              {i < steps.length - 1 && (
                <div className="flex flex-1 items-center justify-center px-2">
                  <FiArrowRight className="h-6 w-6 shrink-0 text-[#E00000] md:h-8 md:w-8" />
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </EpmSection>
  );
}
