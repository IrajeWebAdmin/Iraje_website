import CertSection from "./CertSection";
import { FiSearch } from "react-icons/fi";
import certification from "@/data/certification";

// Verification Portal: a centered search field to confirm any Iraje
// certificate by number or candidate email, with a demo hint underneath.
export default function CertVerify() {
  const { eyebrow, heading, intro, placeholder, cta, hint } = certification.verify;

  return (
    <CertSection
      id="verify"
      eyebrow={eyebrow}
      heading={heading}
      intro={intro}
      tone="light"
      center
    >
      <div className="mx-auto mt-10 max-w-xl">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <FiSearch className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-soft" />
            <input
              type="text"
              placeholder={placeholder}
              aria-label="Certificate number or email"
              className="w-full rounded-full border border-mist bg-white py-3.5 pr-4 pl-11 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <button
            type="button"
            className="rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-brand/90"
          >
            {cta}
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-slate-soft">{hint}</p>
      </div>
    </CertSection>
  );
}
