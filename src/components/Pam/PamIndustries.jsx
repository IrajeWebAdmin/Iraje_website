import PamSection from "./PamSection";
import pam from "@/data/pam";

export default function PamIndustries() {
  const { eyebrow, heading, body, items } = pam.industries;

  return (
    <PamSection center eyebrow={eyebrow} heading={heading} intro={body}>
      <div className="mt-12 flex flex-wrap justify-center gap-3">
        {items.map((industry) => (
          <span
            key={industry}
            className="rounded-full border border-mist bg-white px-6 py-3 text-sm font-medium text-ink transition hover:bg-brand hover:text-white"
          >
            {industry}
          </span>
        ))}
      </div>
    </PamSection>
  );
}
