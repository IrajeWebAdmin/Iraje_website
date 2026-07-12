import EpmSection from "./EpmSection";
import epm from "@/data/epm";


export default function EpmEightWays() {
  const { eyebrow, heading, body, items } = epm.eightWays;

  return (
    <EpmSection
      id="how-epm-works"
      tone="dark"
      paddingClassName="py-15"
      className="bg-brand!"
    >
      {/* Section header — global epm-* classes, matching the other sections
          but in white for the blue band. */}
      <div className="mx-auto max-w-6xl text-center">
        <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-white">
          {eyebrow}
        </span>
        <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-white">
          {heading}
        </h2>
        <p className="mx-auto mt-8 max-w-4xl epm-body leading-relaxed text-white/70">
          {body}
        </p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex flex-col rounded-2xl bg-[#3774d8] p-6 shadow-[0px_12.78px_31.94px_-19.16px_#0C1E3A47,0px_0.8px_1.6px_0px_#0C1E3A0D]"
          >
            {/* Empty icon container — top-left placeholder, matches the Figma card (art to be dropped in later) */}
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-white" />

            <p className="mt-5 text-left font-display text-lg font-semibold text-white">
              {item.title}
            </p>
            <p className="mt-2 text-left text-sm leading-relaxed text-white/70">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </EpmSection>
  );
}
