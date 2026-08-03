import EpmSection from "./EpmSection";
import epm from "@/data/epm";
import {
  FiLock,
  FiClock,
  FiFileText,
  FiMaximize2,
  FiCheckCircle,
  FiShield,
  FiEye,
} from "react-icons/fi";

// Per-card icons, keyed by the `icon` field on each eightWays data item.
const ICONS = {
  lock: FiLock,
  clock: FiClock,
  file: FiFileText,
  escalation: FiMaximize2,
  check: FiCheckCircle,
  shield: FiShield,
  eye: FiEye,
};

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
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <div
              key={item.title}
              className="card-hover-dark flex flex-col rounded-2xl bg-[#3774d8] p-6 shadow-[0px_12.78px_31.94px_-19.16px_#0C1E3A47,0px_0.8px_1.6px_0px_#0C1E3A0D]"
            >
              {/* Icon tile — brand-blue glyph on a white rounded square */}
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-white">
                {Icon && <Icon className="h-6 w-6 text-[#0451CC]" />}
              </span>

              <p className="mt-5 text-left font-display text-lg font-semibold text-white">
                {item.title}
              </p>
              <p className="mt-2 text-left text-sm leading-relaxed text-white/70">
                {item.body}
              </p>
            </div>
          );
        })}
      </div>
    </EpmSection>
  );
}
