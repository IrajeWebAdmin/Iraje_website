import CertSection from "./CertSection";
import { FiCheck, FiArrowRight } from "react-icons/fi";
import certification from "@/data/certification";

// Your Certificate: what the credential includes (left) + a realistic
// certificate preview card (right), followed by a reveal note + verify CTA.
export default function CertCertificate() {
  const { eyebrow, heading, intro, includes, reveal, verifyCta, sample } =
    certification.certificate;

  return (
    <CertSection id="certificate" tone="tint" headClassName="max-w-2xl">
      <div className="grid items-start gap-12 lg:grid-cols-2">
        {/* Copy + includes list */}
        <div>
          <p className="epm-eyebrow epm-eyebrow-normal font-semibold text-brand">{eyebrow}</p>
          <h2 className="epm-heading mt-4 font-display leading-[1.12] font-semibold">
            {heading}
          </h2>
          <p className="epm-body mt-5 leading-relaxed text-slate-soft">{intro}</p>

          <ul className="mt-8 space-y-3">
            {includes.map((item) => (
              <li key={item.text} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                  <FiCheck className="h-3 w-3" />
                </span>
                <span className="text-sm leading-relaxed text-ink">
                  {item.text}
                  {item.sample && (
                    <span className="ml-1 text-slate-soft">— {item.sample}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-2xl border border-mist bg-white p-5">
            <p className="text-sm leading-relaxed text-slate-soft">{reveal}</p>
            <a
              href={verifyCta.href}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand px-5 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white"
            >
              {verifyCta.label}
              <FiArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Certificate preview */}
        <div className="rounded-[28px] border border-mist bg-white p-8 shadow-[0px_28px_70px_-30px_rgba(4,81,204,0.45)]">
          <div className="rounded-2xl border-2 border-[#E3E9FF] p-6 text-center">
            <p className="font-display text-sm font-semibold tracking-[0.14em] text-ink uppercase">
              {sample.org}
            </p>
            <span className="mt-3 inline-block rounded-full bg-[#E3E9FF] px-3 py-1 text-[11px] font-semibold tracking-wide text-brand uppercase">
              {sample.kicker} · {sample.code}
            </span>
            <h3 className="mt-4 font-display text-xl leading-snug font-semibold text-ink">
              {sample.title}
            </h3>
            <p className="mt-5 text-xs text-slate-soft">{sample.intro}</p>
            <p className="font-display text-2xl font-semibold text-brand">{sample.name}</p>
            <p className="mx-auto mt-3 max-w-xs text-xs leading-relaxed text-slate-soft">
              {sample.course}
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-mist pt-5 text-[11px]">
              {sample.meta.map((m) => (
                <div key={m.label}>
                  <p className="text-slate-soft">{m.label}</p>
                  <p className="mt-1 font-semibold text-ink">{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CertSection>
  );
}
