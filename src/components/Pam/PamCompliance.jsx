import Image from "next/image";
import PamSection from "./PamSection";
import pam from "@/data/pam";

export default function PamCompliance() {
  const {
    eyebrow,
    heading,
    body,
    standards,
    indianTitle,
    indianBody,
    indianRegulators,
    dpdpTitle,
    dpdpSections,
  } = pam.compliance;


  return (
    <PamSection
      tone="tint"
      center
      eyebrow={eyebrow}
      heading={heading}
      intro={body}
      eyebrowClassName="epm-eyebrow-normal"
      headClassName="max-w-none"
      headingClassName="whitespace-nowrap"
    >
      {/* Global standards */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {standards.map((std) => (
          <div
            key={std.name}
            className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-mist bg-white px-4 text-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E3E9FF]">
              <Image
                src="/icons/pam-compliance.svg"
                alt=""
                width={28}
                height={28}
              />
            </span>
            <p className="mt-3 font-display text-base font-semibold text-ink">
              {std.name}
            </p>
            <p className="mt-1 text-sm text-slate-soft">{std.sub}</p>
          </div>
        ))}
      </div>

      {/* Indian regulators + DPDP mapping */}
      <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="text-left">
          <h3 className="font-display text-xl font-semibold text-ink">
            {indianTitle}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-soft">
            {indianBody}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {indianRegulators.map((reg) => (
              <div
                key={reg.name}
                className="flex items-center gap-2.5 rounded-2xl border border-mist bg-white px-5 py-3"
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand" />
                <span className="font-display text-sm font-semibold text-ink">
                  {reg.name}
                </span>
                <span className="text-xs text-slate-soft">{reg.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-mist bg-white p-8 text-left md:p-10">
          <h3 className="font-display text-xl font-semibold text-brand">
            {dpdpTitle}
          </h3>
          <ul className="mt-5 space-y-4">
            {dpdpSections.map((section) => (
              <li key={section} className="flex gap-3 text-sm text-ink/75">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand">
                  <Image
                    src="/icons/regulatory-compliance.svg"
                    alt=""
                    width={12}
                    height={12}
                  />
                </span>
                <span className="leading-snug">{section}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PamSection>
  );
}
