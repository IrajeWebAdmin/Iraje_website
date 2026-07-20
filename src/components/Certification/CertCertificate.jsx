import CertSection from "./CertSection";
import {
  FiCheck,
  FiArrowRight,
  FiUser,
  FiCalendar,
  FiType,
  FiEdit3,
} from "react-icons/fi";
import { BsQrCode } from "react-icons/bs";
import certification from "@/data/certification";

// Includes-list icons, in the same order as certificate.includes.
const INCLUDE_ICONS = [FiUser, FiCalendar, FiType, BsQrCode, FiEdit3];

// Your Certificate: a realistic certificate preview card (left) + what the
// credential includes (right), followed by a reveal note + verify CTA.

// Decorative QR-code graphic for the sample certificate (not a scannable code).
// The pattern is deterministic so server and client render identically.
function QrCode({ className }) {
  const N = 25;
  const finder = (x, y) => {
    const ring = (ox, oy) => {
      const lx = x - ox;
      const ly = y - oy;
      return (
        lx === 0 ||
        lx === 6 ||
        ly === 0 ||
        ly === 6 ||
        (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4)
      );
    };
    if (x < 7 && y < 7) return { hit: true, on: ring(0, 0) };
    if (x >= N - 7 && y < 7) return { hit: true, on: ring(N - 7, 0) };
    if (x < 7 && y >= N - 7) return { hit: true, on: ring(0, N - 7) };
    return { hit: false, on: false };
  };
  const cells = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const f = finder(x, y);
      const on = f.hit
        ? f.on
        : ((x + 1) * (y + 3) * 37 + x * 13 + y * 7) % 100 < 47;
      if (on) {
        cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
      }
    }
  }
  return (
    <svg
      viewBox={`0 0 ${N} ${N}`}
      className={className}
      fill="#0B1B3A"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {cells}
    </svg>
  );
}

export default function CertCertificate() {
  const { eyebrow, heading, intro, includes, reveal, verifyCta, sample } =
    certification.certificate;

  // Split the org into a coloured lead word + rest ("Iraje" + "University").
  const [orgLead, ...orgRestArr] = sample.org.split(" ");
  const orgRest = orgRestArr.join(" ");
  // Bold everything after "completed " in the course line.
  const marker = "completed ";
  const ci = sample.course.indexOf(marker);
  const coursePrefix =
    ci >= 0 ? sample.course.slice(0, ci + marker.length) : sample.course;
  const courseRest = ci >= 0 ? sample.course.slice(ci + marker.length) : "";

  return (
    <CertSection id="certificate" tone="tint" paddingClassName="py-15">
      {/* Section header — global epm-* classes, centered */}
      <div className="mx-auto max-w-6xl text-center">
        <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
          {eyebrow}
        </span>
        <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black">
          {heading}
        </h2>
      </div>

      {/* Intro pulled out of the max-w-6xl header so it can sit on one line on
          wide screens (xl+); wraps normally below that. */}
      <p className="mx-auto mt-6 max-w-7xl text-center epm-body leading-relaxed text-[#8E8E93] xl:whitespace-nowrap">
        {intro}
      </p>

      <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">
        {/* Certificate preview — replicates the sample credential design */}
        <div className="rounded-[20px] border border-mist bg-white p-3 text-left shadow-[0px_20px_50px_-28px_rgba(12,30,58,0.3)]">
          {/* Inner frame — the certificate's double border */}
          <div className="rounded-[14px] border border-[#E8ECF4] p-6 md:p-8">
            {/* Header: org lockup + certification kicker */}
            <div className="flex items-start justify-between gap-4">
              <p className="font-serif text-lg text-ink">
                <span className="font-bold text-brand">{orgLead}</span>
                {orgRest && ` ${orgRest}`}
              </p>
              <span className="text-[11px] font-semibold tracking-[0.2em] text-[#0E9BD6] uppercase">
                {sample.kicker}
              </span>
            </div>

            {/* Code */}
            <p className="mt-8 text-xs font-semibold tracking-[0.28em] text-brand uppercase">
              {sample.code}
            </p>

            {/* Title */}
            <h3 className="mt-3 font-serif text-2xl leading-snug font-bold text-ink md:text-[28px]">
              {sample.title}
            </h3>

            {/* Recipient */}
            <p className="mt-6 text-sm text-slate-soft">{sample.intro}</p>
            <p className="mt-2 font-serif text-3xl font-bold text-brand md:text-4xl">
              {sample.name}
            </p>

            {/* Course line — product name + title in bold */}
            <p className="mt-5 text-sm leading-relaxed text-ink">
              {coursePrefix}
              <span className="font-semibold">{courseRest}</span>
            </p>

            {/* Meta details + QR */}
            <div className="mt-8 flex items-end justify-between gap-6">
              <div className="space-y-1.5 text-xs">
                {sample.meta.map((m) => (
                  <p key={m.label} className="text-slate-soft">
                    {m.label}:{" "}
                    <span className="font-semibold text-ink">{m.value}</span>
                  </p>
                ))}
              </div>
              <QrCode className="h-18 w-18 shrink-0" />
            </div>
          </div>
        </div>

        {/* Copy + includes list */}
        <div>
          <ul className="space-y-5">
            {includes.map((item, i) => {
              const Icon = INCLUDE_ICONS[i] ?? FiCheck;
              return (
                <li key={item.text} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF0FF] text-brand">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-base text-ink">
                    {item.text}
                    {item.sample && (
                      <span className="ml-1 text-slate-soft">— {item.sample}</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 p-3">
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
      </div>
    </CertSection>
  );
}
