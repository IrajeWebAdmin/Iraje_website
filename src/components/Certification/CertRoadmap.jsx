import CertSection from "./CertSection";
import certification from "@/data/certification";

// Certification Roadmap: four level cards (Associate → Expert). "Available"
// levels are live today; "Roadmap" levels are upcoming (dimmed status chip).
const STATUS = {
  Available: "bg-[#E4F7EC] text-[#1B8A4B]",
  Roadmap: "bg-mist text-slate-soft",
};

export default function CertRoadmap() {
  const { eyebrow, heading, intro, levels } = certification.roadmap;

  return (
    <CertSection id="roadmap" bg="bg-[#BDD1FE29]" paddingClassName="py-15">
      {/* Section header — global epm-* classes, centered */}
      <div className="mx-auto max-w-6xl text-center">
        <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
          {eyebrow}
        </span>
        <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black">
          {heading}
        </h2>
        <p className="mx-auto mt-6 max-w-3xl epm-body leading-relaxed text-[#8E8E93]">
          {intro}
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {levels.map((lvl) => (
          <div
            key={lvl.level}
            className="flex flex-col rounded-2xl border border-mist bg-white p-6 shadow-[0px_1px_2px_0px_#0C1E3A0D]"
          >
            {/* Level + status */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-[0.16em] text-brand uppercase">
                {lvl.level}
              </p>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium tracking-wide uppercase ${STATUS[lvl.status]}`}
              >
                {lvl.status}
              </span>
            </div>

            {/* Title */}
            <h3 className="mt-3 font-display text-xl font-bold text-ink">
              {lvl.title}
            </h3>

            {/* Items — dashed dividers between rows */}
            <ul className="mt-4  pt-1">
              {lvl.items.map((item) => (
                <li
                  key={item}
                  className="border-b border-dashed border-mist py-2.5 text-sm text-ink/80 last:border-b-0 last:pb-0"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </CertSection>
  );
}
