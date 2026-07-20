import PamSection from "./PamSection";
import {
  FiShield,
  FiMinimize2,
  FiEye,
  FiGlobe,
  FiCheckCircle,
  FiClock,
  FiZap,
  FiCloud,
} from "react-icons/fi";
import pam from "@/data/pam";

// Per-card icons, keyed by the `icon` field on each solution benefit.
const ICONS = {
  shield: FiShield,
  lateral: FiMinimize2,
  eye: FiEye,
  globe: FiGlobe,
  check: FiCheckCircle,
  clock: FiClock,
  zap: FiZap,
  cloud: FiCloud,
};

export default function PamSolution() {
  const { eyebrow, heading, body, benefits } = pam.solution;

  return (
    <PamSection tone="dark" paddingClassName="py-15" className="bg-[#0b1a39]!">
      {/* Section header — global epm-* classes, white for the dark band. */}
      <div className="mx-auto max-w-6xl text-center">
        <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-[#729CF6]">
          {eyebrow}
        </span>
        <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-white">
          {heading}
        </h2>
        <p className="mx-auto mt-8 max-w-3xl epm-body leading-relaxed text-white/70">
          {body}
        </p>
      </div>

      {/* Column-major fill (grid-flow-col + fixed row count) so the data order
          runs DOWN each column exactly as designed, without reordering the data. */}
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-none sm:grid-flow-col sm:auto-cols-fr sm:grid-rows-4 lg:grid-rows-2">
        {benefits.map((benefit) => {
          const Icon = ICONS[benefit.icon];
          return (
            <div key={benefit.title} className="rounded-3xl border border-[#FFFFFF21] bg-[#0b1a39] p-7 text-left shadow-2xl">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E4EAFB] text-black">
                {Icon && <Icon className="h-5 w-5" />}
              </span>
              <h3 className="mt-5 font-display text-base font-semibod text-white">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#DDE8FF]">
                {benefit.body}
              </p>
            </div>
          );
        })}
      </div>
    </PamSection>
  );
}
