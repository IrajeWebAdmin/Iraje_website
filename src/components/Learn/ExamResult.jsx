import Link from "next/link";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import { formatDate } from "@/lib/formatDate";

/** "41m 42s", or "1h 05m" past the hour; "—" when a time is missing. */
function timeTaken(startedAt, submittedAt) {
  if (!startedAt || !submittedAt) return "—";
  const seconds = Math.max(
    0,
    Math.round((new Date(submittedAt) - new Date(startedAt)) / 1000),
  );
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

// The passing screen after the final exam (Figma "Congratulations, you're
// certified"): one centred card with a green tick, the score as a headline
// number over a bar marked at the pass mark, three figures from the attempt,
// and the way to the certificate. `code` is the display code ("PAM 101"),
// `title` the certification's name for the sentence under the heading.
export default function ExamResult({
  attempt,
  certificate,
  exam = {},
  code,
  title,
}) {
  const percentage = Math.min(100, Math.max(0, attempt.percentage ?? 0));
  const passMark = exam.passPercentage ?? null;
  const tiles = [
    {
      value:
        attempt.score != null && attempt.total != null
          ? `${attempt.score} / ${attempt.total}`
          : "—",
      label: "Correct answers",
    },
    {
      value: timeTaken(attempt.startedAt, attempt.submittedAt),
      label: "Time taken",
    },
    { value: formatDate(attempt.submittedAt), label: "Date" },
  ];

  return (
    <div className="border-mist/60 mx-auto w-full max-w-[600px] rounded-3xl border bg-white px-6 py-10 text-center shadow-[0_24px_60px_-28px_rgba(12,30,58,0.28)] sm:px-10">
      <span
        aria-hidden="true"
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E4F7EC] text-[#1B8A4B]"
      >
        <FiCheck className="h-6 w-6" strokeWidth={2.5} />
      </span>

      <p className="text-brand mt-6 text-xs font-semibold">
        {code ? `${code} · ` : ""}Exam result
      </p>
      <h2 className="font-display text-ink mt-2 text-[28px] leading-tight font-bold tracking-tight sm:text-[32px]">
        Congratulations, you&apos;re{" "}
        <span className="text-brand font-medium italic">certified.</span>
      </h2>
      <p className="text-shuttle mx-auto mt-3 max-w-md text-sm leading-relaxed">
        You passed the {title ? `${title} ` : ""}exam.
        <br className="hidden sm:block" /> Your digital certificate is ready to
        download and share.
      </p>

      <p
        className="font-display text-brand mt-8 text-[56px] leading-none font-bold tracking-tight"
        aria-label={`Scored ${percentage}%`}
      >
        {percentage}%
      </p>
      <p className="text-shuttle mt-2 text-xs">
        Your score{passMark != null ? ` · pass mark ${passMark}%` : ""}
      </p>

      {/* Score bar, with a tick where the pass mark falls. */}
      <div className="mx-auto mt-4 w-full max-w-[400px]">
        <div className="relative">
          <div className="bg-mist h-1.5 overflow-hidden rounded-full">
            <div
              className="bg-brand h-full rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
          {passMark != null && (
            <span
              aria-hidden="true"
              className="bg-ink absolute -top-1 h-3.5 w-0.5 -translate-x-1/2"
              style={{ left: `${passMark}%` }}
            />
          )}
        </div>
        {passMark != null && (
          <div className="relative h-5">
            <span
              className="text-shuttle absolute top-1 -translate-x-1/2 text-[11px] whitespace-nowrap"
              style={{ left: `${passMark}%` }}
            >
              Pass {passMark}%
            </span>
          </div>
        )}
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <li key={t.label} className="border-mist rounded-xl border px-4 py-4">
            <p className="text-ink text-lg leading-tight font-semibold">
              {t.value}
            </p>
            <p className="text-shuttle mt-1 text-xs">{t.label}</p>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {certificate ? (
          <a
            href={`/api/certificates/${certificate.certificateNo}/pdf?view=1`}
            target="_blank"
            rel="noopener"
            className="bg-brand hover:bg-navy inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold text-white transition"
          >
            View certificate
            <FiArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        ) : null}
        <Link
          href="/certification/dashboard"
          className="border-mist text-ink hover:border-brand hover:text-brand inline-flex h-11 items-center rounded-full border bg-white px-6 text-sm font-semibold transition"
        >
          Back to dashboard
        </Link>
      </div>
      {!certificate && (
        <p className="text-shuttle mt-4 text-xs">
          Your certificate is being prepared. Refresh this page in a moment.
        </p>
      )}
    </div>
  );
}
