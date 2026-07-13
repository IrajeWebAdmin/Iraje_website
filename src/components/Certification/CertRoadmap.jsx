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
    <CertSection id="roadmap" eyebrow={eyebrow} heading={heading} intro={intro} tone="grey">
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {levels.map((lvl) => {
          const upcoming = lvl.status !== "Available";
          return (
            <div
              key={lvl.level}
              className={`flex flex-col rounded-3xl border p-6 ${
                upcoming
                  ? "border-dashed border-mist bg-white/60"
                  : "border-mist bg-white shadow-[0px_18px_40px_-30px_rgba(4,81,204,0.4)]"
              }`}
            >
              <p className="text-xs font-semibold tracking-[0.16em] text-brand uppercase">
                {lvl.level}
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold text-ink">{lvl.title}</h3>

              <ul className="mt-4 space-y-2 border-t border-mist pt-4">
                {lvl.items.map((item) => (
                  <li key={item} className="text-sm text-slate-soft">
                    {item}
                  </li>
                ))}
              </ul>

              <span
                className={`mt-5 inline-block w-fit rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS[lvl.status]}`}
              >
                {lvl.status}
              </span>
            </div>
          );
        })}
      </div>
    </CertSection>
  );
}
