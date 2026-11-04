"use client";

import { useEffect } from "react";
import { FiBookOpen, FiCheckCircle, FiXCircle } from "react-icons/fi";

// The knowledge check, all questions on one page, each with its prompt and
// selectable option rows, and one "Check answers" button at the end.
//
// After a check every question is marked: Correct (green) or Incorrect (red).
// Correct ones lock; incorrect ones can be changed and checked again. The
// server only reveals explanations once every answer is right, so they appear
// under each question after a pass.
export default function KnowledgeCheck({
  questions,
  answers,
  submitted,
  result,
  pending,
  onAnswer,
  onSubmit,
  onReviewPdf,
}) {
  const total = questions.length;
  const passed = Boolean(result?.passed);
  const failed = Boolean(result && !result.passed);
  const wrong = new Set(
    result?.results?.filter((r) => !r.correct).map((r) => r.id),
  );
  const answered = questions.filter((x) => answers[x._id]).length;

  // After a failed check, bring the first question marked wrong into view.
  useEffect(() => {
    if (!failed) return;
    const firstWrong = result.results?.find((r) => !r.correct)?.id;
    if (firstWrong) {
      document
        .getElementById(`kc-${firstWrong}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [failed, result]);

  // "correct" | "incorrect" | null (not checked yet, or changed since the check)
  const statusOf = (id) => {
    if (passed) return "correct";
    if (!failed) return null;
    if (!wrong.has(id)) return "correct";
    return answers[id] === submitted?.[id] ? "incorrect" : null;
  };

  const correctCount = failed
    ? result.results.filter((r) => r.correct).length
    : total;

  return (
    <div className="border-mist rounded-2xl border bg-white">
      <div className="border-mist flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 sm:px-6">
        <div>
          <p className="text-brand text-[11px] font-semibold tracking-[0.14em] uppercase">
            Knowledge check
          </p>
          <p className="text-shuttle mt-0.5 text-sm">
            {total} {total === 1 ? "question" : "questions"} · answer all
            correctly to continue
          </p>
        </div>
        <button
          type="button"
          onClick={onReviewPdf}
          className="text-shuttle hover:text-brand inline-flex items-center gap-1.5 text-xs font-semibold transition"
        >
          <FiBookOpen className="h-3.5 w-3.5" />
          Review study material
        </button>
      </div>

      {/* Result banner once answers have been checked. */}
      {passed && (
        <div className="mx-5 mt-5 flex items-center gap-2 rounded-xl bg-[#E4F7EC] px-4 py-3 text-sm font-medium text-green-800 sm:mx-6">
          <FiCheckCircle className="h-4 w-4 shrink-0" />
          {total === 1
            ? "Your answer is correct."
            : `All ${total} answers are correct.`}
        </div>
      )}
      {failed && (
        <div className="mx-5 mt-5 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 sm:mx-6">
          <FiXCircle className="h-4 w-4 shrink-0" />
          {correctCount} of {total} correct. Review the questions marked
          incorrect and check again.
        </div>
      )}

      <ol className="divide-mist divide-y">
        {questions.map((q, n) => {
          const status = statusOf(q._id);
          const locked = status === "correct";
          return (
            <li
              key={q._id}
              id={`kc-${q._id}`}
              className="scroll-mt-24 px-5 py-5 sm:px-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-brand text-xs font-semibold">
                    Question {n + 1}
                  </p>
                  <p className="text-ink mt-1 text-base leading-snug font-semibold">
                    {q.prompt}
                  </p>
                </div>
                {status === "correct" && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#E4F7EC] px-2.5 py-1 text-[11px] font-semibold text-[#1B8A4B]">
                    <FiCheckCircle className="h-3 w-3" />
                    Correct
                  </span>
                )}
                {status === "incorrect" && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                    <FiXCircle className="h-3 w-3" />
                    Incorrect
                  </span>
                )}
              </div>

              <div
                role="radiogroup"
                aria-label={`Question ${n + 1}`}
                className="mt-4 space-y-2.5"
              >
                {q.options.map((o) => {
                  const selected = answers[q._id] === o._key;
                  const tone = !selected
                    ? "border-mist hover:border-brand/50"
                    : status === "correct"
                      ? "border-[#1B8A4B] bg-[#E4F7EC]"
                      : status === "incorrect"
                        ? "border-red-300 bg-red-50"
                        : "border-brand bg-[#E8EEFF]";
                  const dot =
                    status === "correct"
                      ? "#1B8A4B"
                      : status === "incorrect"
                        ? "#dc2626"
                        : "var(--color-brand)";
                  return (
                    <label
                      key={o._key}
                      className={`text-ink flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${tone} ${
                        locked ? "cursor-default" : "cursor-pointer"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q._id}
                        value={o._key}
                        checked={selected}
                        disabled={locked}
                        onChange={() => onAnswer(q._id, o._key)}
                        className="sr-only"
                      />
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                        style={{
                          borderColor: selected
                            ? dot
                            : "var(--color-slate-soft)",
                        }}
                      >
                        {selected && (
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ background: dot }}
                          />
                        )}
                      </span>
                      <span>{o.text}</span>
                    </label>
                  );
                })}
              </div>

              {status === "incorrect" && (
                <p className="mt-3 text-sm text-red-700">
                  Not quite — pick another answer and check again.
                </p>
              )}
              {passed && result.explanations?.[q._id] && (
                <div className="text-ink mt-3 rounded-xl border border-[#1B8A4B]/20 bg-[#F3FBF6] px-4 py-3 text-sm">
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-[#1B8A4B] uppercase">
                    Explanation
                  </p>
                  <p className="mt-1 leading-relaxed">
                    {result.explanations[q._id]}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {!passed && (
        <div className="border-mist flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 sm:px-6">
          <p className="text-shuttle text-sm">
            {answered} of {total} answered
          </p>
          <button
            type="button"
            onClick={onSubmit}
            disabled={pending || answered < total}
            className="bg-brand rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Checking…" : failed ? "Check again" : "Check answers"}
          </button>
        </div>
      )}
    </div>
  );
}
