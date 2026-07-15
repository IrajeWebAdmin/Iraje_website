import CertSection from "./CertSection";
import certification from "@/data/certification";

// Verification Portal: a blue gradient card with a search field to confirm any
// Iraje certificate by number or candidate email, with a demo hint underneath.
export default function CertVerify() {
  const { eyebrow, heading, intro, placeholder, cta, hint } =
    certification.verify;

  return (
    <CertSection id="verify" tone="light">
      <div className="rounded-[28px] bg-[linear-gradient(180deg,#0451CC_0%,#022966_100%)] p-10 md:p-14">
        {/* Header — global epm-* classes, recoloured for the dark card */}
        <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-white/70">
          {eyebrow}
        </span>
        <h2 className="mt-4 epm-heading leading-[1.05] font-medium tracking-[-2px] text-white">
          {heading}
        </h2>
        <p className="mt-6 max-w-xl epm-body leading-relaxed text-white/80">
          {intro}
        </p>

        {/* Search + verify */}
        <div className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder={placeholder}
            aria-label="Certificate number or email"
            className="flex-1 rounded-xl bg-white px-5 py-3.5 text-sm text-ink outline-none placeholder:text-slate-soft/70"
          />
          <button
            type="button"
            className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-brand transition hover:bg-white/90"
          >
            {cta}
          </button>
        </div>
        <p className="mt-4 text-xs text-white/60">{hint}</p>
      </div>
    </CertSection>
  );
}
