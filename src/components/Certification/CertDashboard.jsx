import CertSection from "./CertSection";
import { FiCheck } from "react-icons/fi";
import certification from "@/data/certification";

// Student Dashboard: feature list + "inside each course" module tags on the
// left, and a browser-style dashboard mockup on the right.
const COURSE_STATE = {
  progress: "bg-[#E3E9FF] text-brand",
  idle: "bg-mist text-slate-soft",
  certified: "bg-[#E4F7EC] text-[#1B8A4B]",
};

export default function CertDashboard() {
  const { eyebrow, heading, intro, features, insideTag, modules, mock } =
    certification.dashboard;

  return (
    <CertSection id="dashboard" tone="tint" headClassName="max-w-2xl">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* Copy + feature list */}
        <div>
          <p className="epm-eyebrow epm-eyebrow-normal font-semibold text-brand">{eyebrow}</p>
          <h2 className="epm-heading mt-4 font-display leading-[1.12] font-semibold">
            {heading}
          </h2>
          <p className="epm-body mt-5 leading-relaxed text-slate-soft">{intro}</p>

          <ul className="mt-8 space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                  <FiCheck className="h-3 w-3" />
                </span>
                <span className="text-sm leading-relaxed text-ink">{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <span className="inline-block rounded-full bg-[#E3E9FF] px-3 py-1 text-xs font-semibold text-brand">
              {insideTag}
            </span>
            <div className="mt-3 flex flex-wrap gap-2">
              {modules.map((m) => (
                <span
                  key={m}
                  className="rounded-lg border border-mist bg-white px-3 py-1.5 text-xs font-medium text-ink"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="overflow-hidden rounded-2xl border border-mist bg-white shadow-[0px_24px_60px_-30px_rgba(4,81,204,0.4)]">
          {/* Browser bar */}
          <div className="flex items-center gap-2 border-b border-mist bg-[#F6F8FD] px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <span className="h-3 w-3 rounded-full bg-[#28C840]" />
            <span className="ml-3 truncate rounded-md bg-white px-3 py-1 text-xs text-slate-soft">
              {mock.url}
            </span>
          </div>

          {/* Body: sidebar + main */}
          <div className="grid grid-cols-[120px_1fr]">
            <div className="space-y-1 border-r border-mist bg-[#FBFCFF] p-3">
              {mock.nav.map((n, i) => (
                <p
                  key={n}
                  className={`rounded-md px-2 py-1.5 text-xs ${
                    i === 0 ? "bg-brand font-semibold text-white" : "text-slate-soft"
                  }`}
                >
                  {n}
                </p>
              ))}
            </div>
            <div className="p-4">
              <p className="font-display text-sm font-semibold text-ink">{mock.welcome}</p>
              <p className="mt-1 text-[11px] text-slate-soft">{mock.sub}</p>
              <div className="mt-4 space-y-2">
                {mock.courses.map((c) => (
                  <div
                    key={c.code}
                    className="flex items-center justify-between rounded-lg border border-mist px-3 py-2"
                  >
                    <span className="text-xs font-semibold text-ink">{c.code}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${COURSE_STATE[c.state]}`}
                    >
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CertSection>
  );
}
