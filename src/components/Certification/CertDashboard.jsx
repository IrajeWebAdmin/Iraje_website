import CertSection from "./CertSection";
import {
  FiCheck,
  FiGrid,
  FiBook,
  FiAward,
  FiCheckSquare,
  FiTrendingUp,
} from "react-icons/fi";
import certification from "@/data/certification";

// Student Dashboard: feature list + "inside each course" module tags on the
// left, and a browser-style dashboard mockup on the right.
const NAV_ICONS = {
  Dashboard: FiGrid,
  "My Courses": FiBook,
  Certifications: FiAward,
  Exams: FiCheckSquare,
  Progress: FiTrendingUp,
};

// Progress-bar width per course, derived from its state (no content change).
function coursePercent(c) {
  if (c.state === "certified") return 100;
  if (c.state === "idle") return 3;
  const n = parseInt(c.status, 10);
  return Number.isNaN(n) ? 0 : n;
}

export default function CertDashboard() {
  const { eyebrow, heading, intro, features, insideTag, modules, mock } =
    certification.dashboard;

  return (
    <CertSection id="dashboard" tone="tint" headClassName="max-w-2xl" paddingClassName="py-15">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* Copy + feature list */}
        <div>
          <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
            {eyebrow}
          </span>
          <h2 className="mt-4 epm-heading leading-[1.05] font-medium tracking-[-2px] text-black">
            {heading}
          </h2>
          <p className="mt-6 epm-body leading-relaxed text-[#8E8E93]">{intro}</p>

          <ul className="mt-8 space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <FiCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span className="text-sm leading-relaxed text-ink">{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <span className="inline-block rounded-none bg-[#E3E9FF] px-3 py-1 text-xs font-semibold text-brand">
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
        <div className="flex min-h-[352.14px] w-full max-w-[596.2px] flex-col overflow-hidden rounded-[18px] border border-[#0C1E3A29] bg-white font-sans shadow-[0px_30px_60px_-28px_#0C1E3A66,0px_2px_4px_0px_#0C1E3A0F] lg:ml-auto">
          {/* Browser bar */}
          <div className="flex items-center gap-2 border-b border-mist bg-[#F6F8FD] px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <span className="h-3 w-3 rounded-full bg-[#28C840]" />
            <span className="ml-3 truncate rounded-md  px-3 py-1 text-xs text-[#8E8E93]">
              {mock.url}
            </span>
          </div>

          {/* Body: sidebar + main */}
          <div className="grid flex-1 grid-cols-[120px_1fr]">
            <div className="space-y-1 border-r border-mist bg-[#FBFCFF] p-2">
              {mock.nav.map((n, i) => {
                const NavIcon = NAV_ICONS[n] ?? FiGrid;
                return (
                  <p
                    key={n}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
                      i === 0
                        ? "bg-[#E8EEFF] font-semibold text-brand"
                        : "text-[#8E8E93]"
                    }`}
                  >
                    <NavIcon className="h-3.5 w-3.5 shrink-0" />
                    {n}
                  </p>
                );
              })}
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold text-ink">{mock.welcome}</p>
              <p className="mt-1 text-[11px] text-[#8E8E93]">{mock.sub}</p>
              <div className="mt-5 space-y-4">
                {mock.courses.map((c) => {
                  const pct = coursePercent(c);
                  return (
                    <div key={c.code}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-ink">
                          {c.code}
                        </span>
                        {c.state === "certified" ? (
                          <span className="rounded-full bg-[#E4F7EC] px-2.5 py-0.5 text-[10px] font-semibold text-[#1B8A4B]">
                            {c.status}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#8E8E93]">
                            {c.status}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#E8ECF4]">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-[#1D5BFF] to-[#0E9BD6]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CertSection>
  );
}
