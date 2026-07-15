import CertSection from "./CertSection";
import { FiLock, FiMonitor, FiUser } from "react-icons/fi";
import certification from "@/data/certification";

// Track header icons, keyed by track name (matches the design).
const TRACK_ICONS = {
  "Privileged Access Management": FiLock,
  "Endpoint Privilege Management": FiMonitor,
  CyberTantra: FiUser,
};

// Certification Tracks: three tracks (PAM, EPM, CyberTantra), each with an
// Associate (101) and Administrator (201) card. Cards share one layout driven
// by certification.tracks in the data layer.
function LevelCard({ level }) {
  const admin = level.level === "Administrator";
  return (
    <div className="flex min-h-[443.8px] flex-col rounded-[18px] border border-mist bg-white px-7 pt-7 pb-6.5 shadow-[0px_1px_2px_0px_#0C1E3A0D] transition hover:shadow-[0px_20px_40px_-24px_rgba(4,81,204,0.35)]">
      {/* Code pill + level */}
      <div className="flex items-center justify-between">
        <span
          className={`rounded-md px-3 py-1 text-xs font-semibold tracking-wide text-white ${
            admin ? "bg-[#0B1B3A]" : "bg-[#0451CC]"
          }`}
        >
          {level.code}
        </span>
        <span className="text-xs font-semibold text-brand">{level.level}</span>
      </div>

      <h4 className="mt-4 font-display text-lg leading-snug font-semibold text-ink">
        {level.title}
      </h4>
      <p className="mt-2 text-sm leading-relaxed text-slate-soft">{level.role}</p>

      {/* Audience */}
      <div className="mt-5 border-t border-mist pt-5">
        <p className="text-[13px] font-semibold text-ink">Audience</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {level.audience.map((a) => (
            <span
              key={a}
              className="rounded-full border border-mist bg-[#F6F8FD] px-3 py-1 text-xs font-medium text-ink"
            >
              {a}
            </span>
          ))}
        </div>
      </div>

      {/* Exam stats */}
      <div className="mt-5 flex gap-x-10 border-t border-mist pt-5">
        <Stat value={level.questions} unit="MCQs" />
        <Stat value={level.duration} unit="Duration" />
        <Stat value={level.pass} unit="To pass" />
      </div>

      <p className="mt-auto pt-5 text-xs text-slate-soft">
        Prerequisite: <span className="font-semibold text-ink">{level.prerequisite}</span>
      </p>

      <a
        href="#enroll"
        className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand/90"
      >
        Enroll
      </a>
    </div>
  );
}

function Stat({ value, unit }) {
  return (
    <div>
      <p className="font-display text-lg font-semibold text-brand">{value}</p>
      <p className="mt-0.5 text-[11px] text-slate-soft">{unit}</p>
    </div>
  );
}

export default function CertTracks() {
  const { eyebrow, heading, body, items } = certification.tracks;

  return (
    <CertSection bg="bg-[#BDD1FE29]" paddingClassName="py-15">
      {/* Section header — global epm-* classes, centered */}
      <div className="mx-auto max-w-6xl text-center">
        <span className="epm-eyebrow epm-eyebrow-normal font-semibold text-blue-600">
          {eyebrow}
        </span>
        <h2 className="mx-auto mt-4 max-w-6xl epm-heading leading-[1.05] font-medium tracking-[-2px] text-black">
          {heading}
        </h2>
        <p className="mx-auto mt-6 max-w-3xl epm-body leading-relaxed text-[#8E8E93]">
          {body}
        </p>
      </div>

      <div className="mt-14 space-y-14">
        {items.map((track) => {
          const TrackIcon = TRACK_ICONS[track.track] ?? FiLock;
          return (
            <div key={track.track} className="mx-auto max-w-281.5">
              {/* Track header — icon + stacked title/subtitle */}
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF0FF] text-brand">
                  <TrackIcon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {track.track}
                  </h3>
                  <p className="text-sm text-slate-soft">{track.subtitle}</p>
                </div>
              </div>

              {/* Two level cards */}
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {track.levels.map((level) => (
                  <LevelCard key={level.code} level={level} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </CertSection>
  );
}
