"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { FiArrowLeft, FiArrowRight, FiClock, FiFlag } from "react-icons/fi";

const LETTERS = "ABCDEFGHIJ";

const BTN = {
  primary:
    "bg-brand hover:bg-navy inline-flex items-center justify-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60",
  outline:
    "border-mist text-ink hover:border-brand hover:text-brand inline-flex items-center justify-center gap-1.5 rounded-lg border bg-white px-5 py-2.5 text-sm font-semibold transition disabled:opacity-40",
};

// Navigator tile styles, in priority order: the current question is always
// outlined, then flagged beats answered.
const NAV = {
  current: "border-brand bg-white text-brand",
  flagged: "border-[#E9B949] bg-[#FFF8E1] text-[#B86E00]",
  answered: "border-brand bg-brand text-white",
  open: "border-mist bg-white text-shuttle hover:border-brand hover:text-brand",
};
const LEGEND = [
  ["Answered", "border-brand bg-brand"],
  ["Current", "border-brand bg-white"],
  ["Flagged", "border-[#E9B949] bg-[#FFF8E1]"],
  ["Not answered", "border-slate-soft bg-white"],
];

// A spare history entry on top of the exam. Pressing Back then lands on the
// exam again (and fires popstate) instead of leaving it. Skipped when one is
// already there: after a reload, or React's doubled effect in development.
function armBackGuard() {
  if (window.history.state?.examGuard) return;
  window.history.pushState({ examGuard: true }, "");
}

// The exam paper, as in the design: its own top bar (course, countdown, Submit)
// in place of the portal header, one question at a time with lettered options
// and a flag for review, and a numbered navigator on the right. Answers and
// flags are kept in this browser tab (sessionStorage) so an accidental refresh
// doesn't lose them, and sent to the server only on Submit — or automatically
// when time runs out. The server keeps its own clock, so changing the
// computer's time changes nothing. The browser's Back button is guarded: it
// warns, and leaving means the exam is submitted as it stands.
export default function ExamRunner({
  attemptId,
  deadlineAt,
  serverNow,
  questions,
  submitAction,
  code,
  label,
  courseTitle,
  exam = {},
  outlineHref = "/certification/dashboard",
}) {
  const storageKey = `iraje-exam-${attemptId}`;
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const submitted = useRef(false);
  // viaBack: the running submit was started from the Back button.
  // ownBack: we called history.back() ourselves, so ignore that popstate.
  const viaBack = useRef(false);
  const ownBack = useRef(false);

  // Restore answers, flags and position saved in this tab (after mount, so
  // server and browser render the same first screen).
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || "{}");
      if (saved && typeof saved === "object") setAnswers(saved);
      const savedFlags = JSON.parse(
        sessionStorage.getItem(`${storageKey}-flags`) || "{}",
      );
      if (savedFlags && typeof savedFlags === "object") setFlags(savedFlags);
      const at = Number(sessionStorage.getItem(`${storageKey}-at`));
      if (Number.isInteger(at) && at >= 0 && at < questions.length)
        setIndex(at);
    } catch {}
  }, [storageKey, questions.length]);

  function remember(suffix, value) {
    try {
      sessionStorage.setItem(`${storageKey}${suffix}`, value);
    } catch {}
  }

  function goTo(i) {
    const next = Math.min(Math.max(i, 0), questions.length - 1);
    setIndex(next);
    remember("-at", String(next));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function choose(questionId, optionKey) {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: optionKey };
      remember("", JSON.stringify(next));
      return next;
    });
  }

  function toggleFlag(questionId) {
    setFlags((prev) => {
      const next = { ...prev };
      if (next[questionId]) delete next[questionId];
      else next[questionId] = true;
      remember("-flags", JSON.stringify(next));
      return next;
    });
  }

  // `auto` skips the confirmations: the timer must not ask, and the Back
  // guard has asked already.
  function submit(auto = false) {
    if (submitted.current) return;
    const unanswered = questions.length - Object.keys(answers).length;
    if (
      !auto &&
      unanswered > 0 &&
      !window.confirm(
        `${unanswered} question(s) are unanswered. Submit anyway?`,
      )
    )
      return;
    if (
      !auto &&
      unanswered === 0 &&
      !window.confirm(
        "Submit your exam now? You cannot change answers afterwards.",
      )
    )
      return;
    submitted.current = true;
    startTransition(async () => {
      const r = await submitAction(attemptId, answers);
      if (r?.error) {
        submitted.current = false;
        setError(r.error);
        // Started from the Back button? The learner stays, so guard again.
        if (viaBack.current) {
          viaBack.current = false;
          armBackGuard();
        }
        return;
      }
      try {
        for (const suffix of ["", "-at", "-flags"])
          sessionStorage.removeItem(`${storageKey}${suffix}`);
      } catch {}
      // The page refreshes itself (the action revalidates it) and shows the
      // result. Step back once: when Back started this submit, that leaves
      // the exam as the learner asked; otherwise it only pops the guard
      // entry, so the first Back from the result page goes somewhere.
      ownBack.current = true;
      window.history.back();
    });
  }

  // Countdown, corrected for any difference between this computer's clock and the server's.
  // The timer always calls the newest submit(), which knows the latest answers.
  const latestSubmit = useRef(submit);
  useEffect(() => {
    latestSubmit.current = submit;
  });
  useEffect(() => {
    const offset = new Date(serverNow).getTime() - Date.now();
    const deadline = new Date(deadlineAt).getTime();
    const tick = () => {
      const left = Math.max(
        0,
        Math.round((deadline - (Date.now() + offset)) / 1000),
      );
      setSecondsLeft(left);
      if (left === 0) latestSubmit.current(true);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [deadlineAt, serverNow]);

  const total = questions.length;
  const q = questions[index];
  const answered = Object.keys(answers).length;
  const percent = total ? Math.round((answered / total) * 100) : 0;
  const flagged = Boolean(flags[q.id]);
  const last = index === total - 1;
  const urgent = secondsLeft !== null && secondsLeft < 300;
  const mm =
    secondsLeft === null
      ? "--"
      : String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss =
    secondsLeft === null ? "--" : String(secondsLeft % 60).padStart(2, "0");
  const title = [label, courseTitle].filter(Boolean).join(" — ");
  const passMark = exam.passPercentage ?? 100;

  // Back pressed with the paper open. The guard entry has just been popped,
  // so the page is still the exam: warn, then submit as it stands and go, or
  // stay with the guard put back. While a submit is in flight, hold the page.
  function leaveViaBack() {
    if (submitted.current) {
      armBackGuard();
      return;
    }
    const ok = window.confirm(
      `Leave the exam?\n\nGoing back submits it as it stands (${answered} of ${total} answered). You cannot return to it afterwards.\n\nOK submits and leaves. Cancel keeps you in the exam.`,
    );
    if (!ok) {
      armBackGuard();
      return;
    }
    viaBack.current = true;
    submit(true);
  }
  const latestLeave = useRef(leaveViaBack);
  useEffect(() => {
    latestLeave.current = leaveViaBack;
  });
  useEffect(() => {
    armBackGuard();
    const onPopState = () => {
      if (ownBack.current) return;
      latestLeave.current();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return (
    <>
      {/* Exam top bar: replaces the portal header while the paper is open. */}
      <header className="border-mist sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-14 max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Image
              src="/images/navbar/company-logo-nav.png"
              alt="Iraje Identity Security Platform Logo"
              width={90}
              height={32}
              priority
            />
            <span className="bg-brand hidden rounded-md px-2.5 py-1 text-[11px] font-semibold text-white sm:inline-flex">
              {code}
            </span>
            <div className="hidden min-w-0 md:block">
              <p className="text-ink truncate text-sm font-semibold">{title}</p>
              <p className="text-shuttle text-xs">
                Proctored exam · {total} questions · {passMark}% to pass
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <p
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold tabular-nums ${
                urgent
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-mist text-ink"
              }`}
              aria-live="off"
            >
              <FiClock className="h-4 w-4" />
              {mm}:{ss}
              <span className="text-shuttle text-xs font-normal">left</span>
            </p>
            <button
              type="button"
              onClick={() => submit(false)}
              disabled={pending}
              className={`${BTN.primary} rounded-full`}
            >
              {pending ? "Submitting…" : "Submit exam"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <nav
                aria-label="Breadcrumb"
                className="text-shuttle flex items-center gap-1.5 text-xs"
              >
                <Link
                  href="/certification/dashboard"
                  className="hover:text-brand transition"
                >
                  Dashboard
                </Link>
                <span>/</span>
                <Link
                  href={outlineHref}
                  className="hover:text-brand transition"
                >
                  {code}
                </Link>
                <span>/</span>
                <span className="text-ink">Exam</span>
              </nav>
              <p className="text-shuttle text-xs">Answers save automatically</p>
            </div>

            {/* The question */}
            <div className="border-mist mt-3 rounded-2xl border bg-white p-6 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-brand text-sm font-semibold">
                  Question {index + 1} of {total}
                </p>
                <button
                  type="button"
                  onClick={() => toggleFlag(q.id)}
                  aria-pressed={flagged}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    flagged
                      ? "border-[#E9B949] bg-[#FFF8E1] text-[#B86E00]"
                      : "border-mist text-ink hover:border-brand hover:text-brand"
                  }`}
                >
                  <FiFlag className="h-3.5 w-3.5" />
                  {flagged ? "Flagged for review" : "Flag for review"}
                </button>
              </div>
              <h1 className="text-ink mt-4 text-xl leading-snug font-semibold">
                {q.prompt}
              </h1>

              <div
                role="radiogroup"
                aria-label={`Question ${index + 1}`}
                className="mt-6 space-y-3"
              >
                {q.options.map((o, i) => {
                  const selected = answers[q.id] === o._key;
                  return (
                    <label
                      key={o._key}
                      className={`text-ink flex cursor-pointer items-center gap-4 rounded-xl border px-4 py-3.5 text-sm transition ${
                        selected
                          ? "border-brand ring-brand bg-[#EEF3FF] ring-1"
                          : "border-mist hover:border-brand/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={o._key}
                        checked={selected}
                        disabled={pending}
                        onChange={() => choose(q.id, o._key)}
                        className="sr-only"
                      />
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                          selected
                            ? "border-brand bg-brand text-white"
                            : "border-mist text-ink bg-white"
                        }`}
                      >
                        {LETTERS[i] ?? i + 1}
                      </span>
                      <span>{o.text}</span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => goTo(index - 1)}
                  disabled={index === 0 || pending}
                  className={BTN.outline}
                >
                  <FiArrowLeft className="h-4 w-4" />
                  Previous
                </button>
                {last ? (
                  <button
                    type="button"
                    onClick={() => submit(false)}
                    disabled={pending}
                    className={BTN.primary}
                  >
                    {pending ? "Submitting…" : "Submit exam"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => goTo(index + 1)}
                    disabled={pending}
                    className={BTN.primary}
                  >
                    Save &amp; next
                    <FiArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {error && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>

          {/* Navigator: jump to any question; the legend explains the colours. */}
          <aside className="border-mist rounded-2xl border bg-white p-5 lg:sticky lg:top-20">
            <h2 className="text-ink text-base font-semibold">Questions</h2>
            <p className="text-shuttle mt-0.5 text-xs">
              {answered} of {total} answered
            </p>
            <div className="bg-mist mt-3 h-1 w-full overflow-hidden rounded-full">
              <div
                className="bg-brand h-full rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-8 gap-1.5">
              {questions.map((x, i) => {
                const state =
                  i === index
                    ? "current"
                    : flags[x.id]
                      ? "flagged"
                      : answers[x.id]
                        ? "answered"
                        : "open";
                return (
                  <button
                    key={x.id}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={state === "current" ? "true" : undefined}
                    aria-label={`Question ${i + 1}${answers[x.id] ? ", answered" : ""}${flags[x.id] ? ", flagged" : ""}`}
                    className={`flex h-6 items-center justify-center rounded-md border text-[11px] font-semibold transition ${NAV[state]}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
              {LEGEND.map(([name, swatch]) => (
                <li key={name} className="text-shuttle flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-sm border ${swatch}`} />
                  {name}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => submit(false)}
              disabled={pending}
              className={`${BTN.primary} mt-5 w-full rounded-full`}
            >
              {pending ? "Submitting…" : "Submit exam"}
            </button>
            <p className="text-shuttle mt-3 text-center text-[11px] leading-relaxed">
              You can review and change answers until you submit.
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}
