import Link from "next/link";
import { FiArrowRight, FiLock } from "react-icons/fi";
import { LEVEL_LABEL, continueHref } from "@/lib/dashboard";

const PILL = {
  examReady: { text: "Exam ready", className: "bg-[#E8EEFF] text-brand" },
  certified: { text: "Certified", className: "bg-[#E4F7EC] text-[#1B8A4B]" },
  inProgress: { text: "In progress", className: "bg-[#FFF4E0] text-[#B86E00]" },
  notStarted: { text: "Not started", className: "bg-[#F1F4F9] text-shuttle" },
  noContent: { text: "Coming soon", className: "bg-[#F1F4F9] text-shuttle" },
  locked: {
    text: "Locked",
    className: "bg-[#F1F4F9] text-shuttle",
    icon: FiLock,
  },
};

const BTN = {
  primary:
    "inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white transition hover:bg-navy",
  outline:
    "inline-flex items-center rounded-lg border border-mist bg-white px-4 py-2 text-xs font-semibold text-ink transition hover:border-brand hover:text-brand",
  disabled:
    "inline-flex cursor-not-allowed items-center rounded-lg bg-[#EEF2F8] px-4 py-2 text-xs font-semibold text-slate-soft",
};

function StatusPill({ state }) {
  const pill = PILL[state] ?? PILL.notStarted;
  const Icon = pill.icon;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${pill.className}`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {pill.text}
    </span>
  );
}

// "Associate" / "Administrator" from Sanity's level; older documents without a
// level fall back to the first word after "Certified" in the title.
function levelLabel(cert) {
  if (LEVEL_LABEL[cert.level]) return LEVEL_LABEL[cert.level];
  const match = /^Certified\s+([A-Za-z]+)/.exec(cert.title ?? "");
  return match ? match[1] : "";
}

// Progress line, bar, footnote and action for each state. `passedCodes` is the
// set of certification codes this learner has passed, for prerequisite checks.
function describe({ cert, enrolment, outline, state, passedCodes }) {
  const base = `/certification/learn/${cert.code.toLowerCase()}`;
  const prereq = cert.prerequisite;
  const prereqLine = `Prerequisite: ${prereq?.label ?? "None"}`;
  const modules = outline
    ? `Modules ${outline.completed} / ${outline.total}`
    : "";

  switch (state) {
    case "examReady":
      return {
        left: modules,
        right: "100% complete",
        percent: 100,
        bar: "bg-brand",
        note: "Exam eligible",
        action: (
          <Link href={`${base}/exam`} className={BTN.primary}>
            Take exam <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
        ),
      };
    case "certified": {
      const number = enrolment.certificate?.certificateNo;
      return {
        left: "Course completed",
        right: "100% complete",
        percent: 100,
        bar: "bg-[#1B8A4B]",
        note: number ?? "Certified",
        action: number ? (
          <a href={`/api/certificates/${number}/pdf`} className={BTN.outline}>
            View certificate
          </a>
        ) : (
          <span className={BTN.disabled}>Certificate pending</span>
        ),
      };
    }
    case "inProgress":
      return {
        left: modules,
        right: `${outline.percent}% complete`,
        percent: outline.percent,
        bar: "bg-brand",
        note: "Exam unlocks at 100%",
        action: (
          <Link href={continueHref(outline, base)} className={BTN.outline}>
            Continue learning
          </Link>
        ),
      };
    case "notStarted":
      return {
        left: "Not started",
        right: "0% complete",
        percent: 0,
        bar: "bg-brand",
        note: prereqLine,
        action: (
          <Link href={continueHref(outline, base)} className={BTN.outline}>
            Start course
          </Link>
        ),
      };
    case "noContent":
      return {
        left: "Content coming soon",
        right: "—",
        percent: 0,
        bar: "bg-brand",
        note: prereqLine,
        action: <span className={BTN.disabled}>Coming soon</span>,
      };
    default: {
      // locked — not enrolled. A 201 whose 101 is not passed yet cannot be
      // requested; everything else links to the enrolment form.
      const prereqMet = !prereq || passedCodes.has(prereq.code);
      let action;
      if (cert.status === "comingSoon") {
        action = <span className={BTN.disabled}>Coming soon</span>;
      } else if (!prereqMet) {
        action = (
          <span className={BTN.disabled} title={`Pass ${prereq.label} first`}>
            Requires {prereq.label}
          </span>
        );
      } else {
        action = (
          <Link
            href={`/certification?enroll=${cert.code}#enroll`}
            className={BTN.outline}
          >
            Request access
          </Link>
        );
      }
      return {
        left: prereqLine,
        right: "—",
        percent: 0,
        bar: "bg-brand",
        note: !prereq
          ? "Not enrolled"
          : prereqMet
            ? "Prerequisite met"
            : `Unlocks after ${prereq.label}`,
        action,
      };
    }
  }
}

export default function CourseCard({ card, passedCodes }) {
  const { cert, state } = card;
  const d = describe({ ...card, passedCodes });

  return (
    <li className="border-mist flex flex-col rounded-2xl border bg-white p-5 shadow-[0_1px_3px_rgba(12,30,58,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <span className="bg-ink rounded-md px-2.5 py-1 text-xs font-semibold text-white">
          {cert.label}
        </span>
        <StatusPill state={state} />
      </div>

      <p className="text-brand mt-4 text-xs font-medium">{levelLabel(cert)}</p>
      <h3 className="text-ink mt-1 min-h-11 text-base leading-snug font-semibold">
        {cert.title}
      </h3>

      <div className="mt-4 pb-5">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-ink font-medium">{d.left}</span>
          <span className="text-shuttle">{d.right}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E8ECF4]">
          <div
            className={`h-full rounded-full ${d.bar}`}
            style={{ width: `${d.percent}%` }}
          />
        </div>
      </div>

      <div className="border-mist mt-auto flex items-center justify-between gap-3 border-t pt-4">
        <span className="text-shuttle min-w-0 truncate text-xs">{d.note}</span>
        {d.action}
      </div>
    </li>
  );
}
