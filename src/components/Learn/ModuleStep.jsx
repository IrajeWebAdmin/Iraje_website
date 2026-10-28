"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiArrowRight, FiCheckSquare } from "react-icons/fi";
import PdfReader from "./PdfReader";
import KnowledgeCheck from "./KnowledgeCheck";

// One module: click through the PDF page by page → "Mark as read" on the last
// page → the knowledge check takes the PDF's place (all correct to continue)
// → next module or exam. With no knowledge check, "Mark as read" goes straight
// to the next module. "Review study material" brings the PDF back.
export default function ModuleStep({
  hasPdf,
  materialUrl,
  initialRead,
  initialPassed,
  questions,
  markReadAction,
  submitCheckAction,
  nextHref,
  nextLabel,
}) {
  const router = useRouter();
  const [read, setRead] = useState(initialRead);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(null);
  const [result, setResult] = useState(initialPassed ? { passed: true } : null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  // PDF first; once it is read and there are questions, they take its place.
  const [showPdf, setShowPdf] = useState(
    !(initialRead && questions.length > 0),
  );

  const complete = read && (questions.length === 0 || result?.passed);
  const showCheck = read && questions.length > 0 && !showPdf;

  function finishReading() {
    setError("");
    startTransition(async () => {
      const r = await markReadAction();
      if (r?.error) return setError(r.error);
      setRead(true);
      // Nothing to answer for this module: straight on to the next one.
      if (questions.length === 0) router.push(nextHref);
      else setShowPdf(false);
    });
  }

  function submitCheck() {
    setError("");
    const snapshot = { ...answers };
    startTransition(async () => {
      const r = await submitCheckAction(snapshot);
      if (r?.error) return setError(r.error);
      setSubmitted(snapshot);
      setResult(r);
    });
  }

  return (
    <div className="space-y-6">
      {showCheck ? (
        <KnowledgeCheck
          questions={questions}
          answers={answers}
          submitted={submitted}
          result={result}
          pending={pending}
          onAnswer={(id, key) => setAnswers((a) => ({ ...a, [id]: key }))}
          onSubmit={submitCheck}
          onReviewPdf={() => setShowPdf(true)}
        />
      ) : hasPdf ? (
        <div className="space-y-3">
          {read && questions.length > 0 && (
            <div className="border-mist flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-sm">
              <span className="text-shuttle">You have read this material.</span>
              <button
                type="button"
                onClick={() => setShowPdf(false)}
                className="text-brand inline-flex items-center gap-1.5 font-semibold"
              >
                <FiCheckSquare className="h-4 w-4" />
                {result?.passed
                  ? "Back to the knowledge check"
                  : "Go to the knowledge check"}
              </button>
            </div>
          )}
          <PdfReader
            src={materialUrl}
            onFinish={finishReading}
            finishing={pending}
            alreadyRead={read}
          />
        </div>
      ) : (
        <p className="border-mist text-shuttle rounded-xl border bg-white p-6 text-sm">
          The study material for this module is coming soon.
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {complete && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
          <p className="font-semibold text-green-800">Module complete ✓</p>
          <Link
            href={nextHref}
            className="bg-brand inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
          >
            {nextLabel}
            <FiArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
