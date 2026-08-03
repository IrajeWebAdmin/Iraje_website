import PamSection from "./PamSection";
import pam from "@/data/pam";

const levelGradients = [
  "linear-gradient(270deg, #5869C2 0%, #5C6DC5 50%, #6777CD 100%)",
  "linear-gradient(270deg, #414EB3 0%, #4957B8 50%, #4F5FBC 100%)",
  "linear-gradient(270deg, #343FA4 0%, #3944AA 50%, #3C48AE 100%)",
  "linear-gradient(270deg, #1E2860 0%, #27317C 37.5%, #2F3A99 100%)",
];

export default function PamMaturity() {
  const { eyebrow, heading, body, flow, levels } = pam.maturity;

  return (
    <PamSection  paddingClassName="py-15">
      {/* Section header — global epm-* classes, matching the other sections. */}
      <div className="text-center">
        <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
          {eyebrow}
        </span>
        <h2 className="mt-4 epm-heading leading-[1.05] font-medium tracking-[-2px] text-black md:whitespace-nowrap">
          {heading}
        </h2>
        <p className="mx-auto mt-8 max-w-6xl epm-body leading-relaxed text-[#8E8E93]">
          {body}
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {levels.map((level, index) => (
          <div
            key={level.level}
            className="card-hover flex flex-col overflow-hidden rounded-3xl border border-mist bg-white text-left shadow-lg shadow-brand/5"
          >
            <div
              style={{
                background: levelGradients[index % levelGradients.length],
              }}
              className="px-7 py-6 text-white"
            >
              <span className="text-xs font-semibold tracking-[0.14em] text-white/70 uppercase">
                {level.level}
              </span>
              <h3 className="mt-2 font-display text-xl font-semibold text-white">
                {level.name}
              </h3>
            </div>
            <ul className="divide-y divide-dotted divide-mist px-7 py-2">
              {level.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 py-2.5 text-[13px] leading-snug text-ink/75"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-base font-medium tracking-[0.22em] uppercase md:text-lg">
        {flow.split("→").map((part, index, parts) => (
          <span key={part}>
            <span style={{ color: "#707070" }}>{part.trim()}</span>
            {index < parts.length - 1 && (
              <span className="mx-2 font-extrabold text-brand">→</span>
            )}
          </span>
        ))}
      </p>
    </PamSection>
  );
}
