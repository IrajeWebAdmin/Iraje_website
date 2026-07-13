import CertSection from "./CertSection";
import {
  FiArrowRight,
  FiUser,
  FiCheckCircle,
  FiBookOpen,
  FiCheckSquare,
  FiAward,
} from "react-icons/fi";
import certification from "@/data/certification";

// Journey-strip icons, keyed by step label (matches the design).
const JOURNEY_ICONS = {
  Register: FiUser,
  Approval: FiCheckCircle,
  Learn: FiBookOpen,
  Exam: FiCheckSquare,
  Certificate: FiAward,
};

// How It Works: three numbered step cards, followed by a compact
// register → approval → learn → exam → certificate journey strip.
export default function CertHowItWorks() {
  const { eyebrow, heading, intro, steps, journey } = certification.howItWorks;

  return (
    <CertSection id="how" tone="light" paddingClassName="py-15">
      {/* Section header — global epm-* classes, centered */}
      <div className="mx-auto max-w-6xl text-center">
        <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
          {eyebrow}
        </span>
        <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black">
          {heading}
        </h2>
        <p className="mx-auto mt-6 max-w-3xl epm-body leading-relaxed text-slate-soft">
          {intro}
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.num}
            className="rounded-2xl border border-mist bg-white p-8 shadow-[0px_1px_2px_0px_#0C1E3A0D]"
          >
            <span className="font-display text-4xl font-bold text-brand">
              {step.num}
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold text-ink">
              {step.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-soft">
              {step.body}
            </p>
          </div>
        ))}
      </div>

      {/* Journey strip — icon pills connected by arrows */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
        {journey.map((step, i) => {
          const Icon = JOURNEY_ICONS[step] ?? FiUser;
          return (
            <span key={step} className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-mist bg-white px-4 py-4 text-sm font-semibold text-ink shadow-[0px_1px_2px_0px_#0C1E3A0D]">
                <Icon className="h-4 w-4 text-brand" />
                {step}
              </span>
              {i < journey.length - 1 && (
                <FiArrowRight className="h-4 w-4 text-slate-soft" />
              )}
            </span>
          );
        })}
      </div>
    </CertSection>
  );
}
