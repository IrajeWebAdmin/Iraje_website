"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { RETAKE_WAIT_LABEL, RETAKE_WAIT_SHORT } from "@/lib/examRules";
import {
  FiAlertTriangle,
  FiAward,
  FiCheck,
  FiClock,
  FiList,
  FiMonitor,
  FiRefreshCw,
} from "react-icons/fi";

const AMBER = "bg-[#FFF4E0] text-[#B86E00]";
const GREEN = "bg-[#E4F7EC] text-[#1B8A4B]";

/** 1 -> "1st", 2 -> "2nd", 11 -> "11th", 22 -> "22nd". */
function ordinal(n) {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${{ 1: "st", 2: "nd", 3: "rd" }[n % 10] ?? "th"}`;
}

// The exam instructions page, as in the design: course pill and status, the
// "PAM 101 — Final exam" title, four tiles, the rules with an icon each, the
// agreement tick that enables Start exam, and a sidebar with a checklist,
// the learner's attempt details and the timer warning. `action` is startExam
// with the certification code bound by the page; `waitUntil` (a formatted
// date) replaces the start form during a retake wait.
export default function ExamStart({
  action,
  exam = {},
  code,
  label,
  courseTitle,
  modules = { completed: 0, total: 0 },
  attemptNumber = 1,
  lastAttempt,
  waitUntil,
  notNowHref = "/certification/dashboard",
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [ready, setReady] = useState(false);

  // Same fallbacks as the exam engine (startExam, gradeAttempt), so the page
  // never promises a different paper than the one it hands out.
  const minutes = exam.durationMinutes ?? 60;
  const passMark = exam.passPercentage ?? 100;

  const status = waitUntil
    ? { text: `Retake opens ${waitUntil}`, className: AMBER }
    : lastAttempt
      ? {
          text: `Last attempt ${lastAttempt.percentage}% · retake open`,
          className: AMBER,
        }
      : { text: "All modules complete · eligible", className: GREEN };

  const tiles = [
    { value: `${minutes} min`, label: "Time allowed" },
    { value: exam.questionCount ?? "—", label: "Questions" },
    { value: `${passMark}%`, label: "Pass mark" },
    { value: RETAKE_WAIT_SHORT, label: "Wait before retake" },
  ];

  const rules = [
    {
      Icon: FiClock,
      title: `Time allowed: ${minutes} minutes`,
      text: "The timer cannot be paused. When time runs out, your answers are submitted automatically.",
    },
    {
      Icon: FiAward,
      title: `Pass mark: ${passMark}%`,
      text: "One mark per question, no negative marking — so answer every question.",
    },
    {
      Icon: FiList,
      title: "Question types",
      text: "Multiple choice, True / False and fill-in-the-blank questions.",
    },
    {
      Icon: FiRefreshCw,
      title: "Retakes",
      text: `If you don't pass, you can try again after ${RETAKE_WAIT_LABEL}.`,
    },
    {
      Icon: FiMonitor,
      title: "Proctored exam",
      text: "Stay on the exam tab. Leaving it or switching windows may be recorded.",
    },
  ];

  const checklist = [
    "A stable internet connection",
    `${minutes} uninterrupted minutes in a quiet place`,
    "Other tabs and apps closed",
    "Answers save automatically as you go",
  ];

  const attemptRows = [
    { label: "Attempt", value: `${ordinal(attemptNumber)} attempt` },
    ...(lastAttempt
      ? [
          {
            label: "Last score",
            value: `${lastAttempt.percentage}%`,
            tone: "text-red-600",
          },
        ]
      : []),
    {
      label: "Modules",
      value: `${modules.completed} / ${modules.total} complete`,
    },
    { label: "Certificate", value: "Issued on passing" },
  ];

  const intro = [label, courseTitle].filter(Boolean).join(" — ");

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
      <section className="border-mist rounded-2xl border bg-white p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-brand rounded-md px-2.5 py-1 text-[11px] font-semibold text-white">
            {code}
          </span>
          <span
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${status.className}`}
          >
            {status.text}
          </span>
        </div>
        <h1 className="text-ink mt-4 text-3xl leading-tight font-bold">
          {code} — Final{" "}
          <span className="text-brand font-normal italic">exam</span>
        </h1>
        <p className="text-shuttle mt-2 max-w-xl text-sm leading-relaxed">
          {intro ? `${intro}. ` : ""}Read the rules below before you begin. Once
          you start, the timer runs until you submit.
        </p>

        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiles.map((t) => (
            <li
              key={t.label}
              className="border-mist rounded-xl border px-4 py-3"
            >
              <p className="text-brand text-xl leading-tight font-semibold">
                {t.value}
              </p>
              <p className="text-shuttle mt-1 text-xs">{t.label}</p>
            </li>
          ))}
        </ul>

        <h2 className="text-ink mt-7 text-lg font-semibold">Exam rules</h2>
        <ul className="mt-2">
          {rules.map(({ Icon, title, text }) => (
            <li
              key={title}
              className="border-mist flex items-start gap-4 border-b py-4"
            >
              <span className="text-brand flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#D6E2FF] bg-[#EEF3FF]">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-ink text-sm font-semibold">{title}</p>
                <p className="text-shuttle mt-0.5 text-xs leading-relaxed">
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {waitUntil ? (
          <div className="mt-6 space-y-4">
            <p className="border-mist text-ink flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold">
              <FiClock className="text-brand h-4 w-4 shrink-0" />
              You can retake the exam from {waitUntil}.
            </p>
            <Link
              href={notNowHref}
              className="border-mist text-ink hover:border-brand hover:text-brand inline-flex items-center rounded-full border bg-white px-6 py-2.5 text-sm font-semibold transition"
            >
              Back to dashboard
            </Link>
          </div>
        ) : (
          <form action={formAction} className="mt-6">
            <label className="border-mist flex items-start gap-3 rounded-lg border px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={ready}
                onChange={(e) => setReady(e.target.checked)}
                className="accent-brand mt-0.5 h-4 w-4 shrink-0"
              />
              <span>
                <span className="text-ink font-semibold">
                  I have read and agree to the exam rules.
                </span>{" "}
                <span className="text-shuttle">
                  I understand the timer starts as soon as I begin.
                </span>
              </span>
            </label>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={!ready || pending}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition ${
                  ready
                    ? "bg-brand hover:bg-navy text-white"
                    : "text-slate-soft cursor-not-allowed bg-[#E6EBF3]"
                }`}
              >
                {pending ? "Preparing your paper…" : "Start exam"}
              </button>
              <Link
                href={notNowHref}
                className="border-mist text-ink hover:border-brand hover:text-brand inline-flex items-center rounded-full border bg-white px-6 py-2.5 text-sm font-semibold transition"
              >
                Not now
              </Link>
              <p className="text-slate-soft text-xs">
                {ready
                  ? "You can start when you are ready."
                  : "Tick the box above to enable Start exam."}
              </p>
            </div>
            {state?.error && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {state.error}
              </p>
            )}
          </form>
        )}
      </section>

      <aside className="flex flex-col gap-4">
        <div className="border-mist rounded-2xl border bg-white p-5">
          <h2 className="text-ink text-base font-semibold">Before you begin</h2>
          <ul className="mt-3 space-y-2.5">
            {checklist.map((item) => (
              <li
                key={item}
                className="text-ink flex items-start gap-2.5 text-sm"
              >
                <FiCheck className="text-brand mt-0.5 h-4 w-4 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-mist rounded-2xl border bg-white p-5">
          <h2 className="text-ink text-base font-semibold">Your attempt</h2>
          <dl className="divide-mist mt-2 divide-y">
            {attemptRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 py-2.5 text-sm"
              >
                <dt className="text-shuttle">{row.label}</dt>
                <dd
                  className={`text-right font-semibold ${row.tone ?? "text-ink"}`}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-[#F3E2A8] bg-[#FFF8E1] px-4 py-3 text-sm text-[#7A5200]">
          <FiAlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          Refreshing or closing the page will not stop the timer.
        </div>
      </aside>
    </div>
  );
}
