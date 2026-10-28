"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { FiArrowLeft, FiArrowRight, FiClock } from "react-icons/fi";

// The exam paper, one question at a time, with a countdown. Answers are kept in
// this browser tab (sessionStorage) so an accidental refresh doesn't lose them,
// and sent to the server only on "Submit" — or automatically when time runs
// out. The server keeps its own clock, so changing the computer's time changes
// nothing. A numbered navigator lets the learner jump to any question.
export default function ExamRunner({
  attemptId,
  deadlineAt,
  serverNow,
  questions,
  submitAction,
}) {
  const storageKey = `iraje-exam-${attemptId}`;
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const submitted = useRef(false);

  // Restore answers and position saved in this tab (after mount, so server
  // and browser render the same first screen).
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || "{}");
      if (saved && typeof saved === "object") setAnswers(saved);
      const at = Number(sessionStorage.getItem(`${storageKey}-at`));
      if (Number.isInteger(at) && at >= 0 && at < questions.length)
        setIndex(at);
    } catch {}
  }, [storageKey, questions.length]);

  function goTo(i) {
    const next = Math.min(Math.max(i, 0), questions.length - 1);
    setIndex(next);
    try {
      sessionStorage.setItem(`${storageKey}-at`, String(next));
    } catch {}
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function choose(questionId, optionKey) {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: optionKey };
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

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
        return;
      }
      try {
        sessionStorage.removeItem(storageKey);
        sessionStorage.removeItem(`${storageKey}-at`);
      } catch {}
      // The page refreshes itself (the action revalidates it) and shows the result.
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
  const last = index === total - 1;
  const urgent = secondsLeft !== null && secondsLeft < 300;
  const mm =
    secondsLeft === null
      ? "--"
      : String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss =
    secondsLeft === null ? "--" : String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="space-y-4">
      {/* Status bar: position, answered count, countdown. Sits under the portal header. */}
      <div className="border-mist sticky top-16 z-30 flex items-center justify-between gap-3 rounded-2xl border bg-white/95 px-5 py-3 shadow-[0_8px_24px_-20px_rgba(12,30,58,0.4)] backdrop-blur">
        <div>
          <p className="text-ink text-sm font-semibold">
            Question {index + 1} of {total}
          </p>
          <p className="text-shuttle text-xs">
            {answered} of {total} answered
          </p>
        </div>
        <p
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-base font-semibold tabular-nums ${
            urgent ? "bg-red-50 text-red-600" : "text-brand bg-[#E8EEFF]"
          }`}
          aria-live="off"
        >
          <FiClock className="h-4 w-4" />
          {mm}:{ss}
        </p>
      </div>

      {/* The question */}
      <div className="border-mist rounded-2xl border bg-white">
        <div className="px-5 py-5 sm:px-6">
          <p className="text-brand text-xs font-semibold">
            Question {index + 1}
          </p>
          <p className="text-ink mt-1 text-lg leading-snug font-semibold">
            {q.prompt}
          </p>

          <div
            role="radiogroup"
            aria-label={`Question ${index + 1}`}
            className="mt-5 space-y-2.5"
          >
            {q.options.map((o) => {
              const selected = answers[q.id] === o._key;
              return (
                <label
                  key={o._key}
                  className={`text-ink flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                    selected
                      ? "border-brand bg-[#E8EEFF]"
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
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      selected ? "border-brand" : "border-slate-soft"
                    }`}
                  >
                    {selected && (
                      <span className="bg-brand h-2.5 w-2.5 rounded-full" />
                    )}
                  </span>
                  <span>{o.text}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="border-mist flex items-center justify-between gap-3 border-t px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={index === 0 || pending}
            className="border-mist text-ink inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-40"
          >
            <FiArrowLeft className="h-4 w-4" />
            Previous
          </button>
          {last ? (
            <button
              type="button"
              onClick={() => submit(false)}
              disabled={pending}
              className="bg-brand rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Submitting…" : "Submit exam"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              disabled={pending}
              className="bg-brand inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Next
              <FiArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Navigator: jump to any question; answered ones are filled in. */}
      <div className="border-mist rounded-2xl border bg-white px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-ink text-sm font-semibold">All questions</p>
          <p className="text-shuttle text-xs">
            Blue = answered · outlined = current
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {questions.map((x, i) => {
            const done = Boolean(answers[x.id]);
            const current = i === index;
            return (
              <button
                key={x.id}
                type="button"
                onClick={() => goTo(i)}
                aria-current={current ? "true" : undefined}
                aria-label={`Question ${i + 1}${done ? ", answered" : ""}`}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold transition ${
                  done
                    ? "bg-brand text-white"
                    : "text-shuttle hover:text-brand bg-[#F1F4F9] hover:bg-[#E8EEFF]"
                } ${current ? "ring-brand ring-2 ring-offset-2" : ""}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        {!last && (
          <div className="border-mist mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-shuttle text-xs">
              Finished early? You can submit from here at any time.
            </p>
            <button
              type="button"
              onClick={() => submit(false)}
              disabled={pending}
              className="border-brand text-brand rounded-lg border px-4 py-2 text-xs font-semibold transition hover:bg-[#E8EEFF] disabled:opacity-60"
            >
              {pending ? "Submitting…" : "Submit exam"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
