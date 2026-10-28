import Link from "next/link";
import { FiArrowLeft, FiAward, FiDownload } from "react-icons/fi";
import { formatDate } from "@/lib/formatDate";

// Score as a ring: the green arc is the percentage scored, the label under it
// is the pass mark. Pure SVG, no library.
function ScoreRing({ percentage, passMark }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, percentage ?? 0)) / 100) * c;
  return (
    <div
      className="relative h-36 w-36 shrink-0"
      role="img"
      aria-label={`Scored ${percentage}%`}
    >
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="#E8ECF4"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="#1B8A4B"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-ink text-3xl font-semibold">{percentage}%</span>
        {passMark != null && (
          <span className="text-shuttle text-[11px]">
            Pass mark {passMark}%
          </span>
        )}
      </div>
    </div>
  );
}

// The passing screen after the final exam: score ring and congratulations,
// the attempt's numbers, and the certificate with its download.
export default function ExamResult({
  attempt,
  certificate,
  exam = {},
  firstName,
  email,
}) {
  const tiles = [
    {
      value:
        attempt.score != null && attempt.total != null
          ? `${attempt.score} / ${attempt.total}`
          : "—",
      label: "Correct answers",
    },
    { value: `${attempt.percentage}%`, label: "Your score" },
    {
      value: exam.passPercentage != null ? `${exam.passPercentage}%` : "—",
      label: "Pass mark",
    },
    { value: formatDate(attempt.submittedAt), label: "Completed on" },
  ];

  return (
    <div className="border-mist rounded-2xl border bg-white">
      <div className="flex flex-col items-center gap-6 px-5 py-8 text-center sm:flex-row sm:px-8 sm:text-left">
        <ScoreRing
          percentage={attempt.percentage}
          passMark={exam.passPercentage}
        />
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#E4F7EC] px-2.5 py-1 text-[11px] font-semibold text-[#1B8A4B]">
            <FiAward className="h-3 w-3" />
            Passed
          </span>
          <h2 className="text-ink mt-3 text-2xl font-semibold">
            Congratulations{firstName ? `, ${firstName}` : ""}! You passed the
            exam.
          </h2>
          <p className="text-shuttle mt-2 text-sm leading-relaxed">
            You scored {attempt.percentage}%
            {exam.passPercentage != null
              ? ` against a pass mark of ${exam.passPercentage}%`
              : ""}
            . Your certificate has been issued
            {email ? ` and emailed to ${email}` : ""}.
          </p>
        </div>
      </div>

      <ul className="border-mist grid grid-cols-2 gap-3 border-t px-5 py-5 sm:grid-cols-4 sm:px-8">
        {tiles.map((t) => (
          <li key={t.label} className="border-mist rounded-xl border px-4 py-3">
            <p className="text-ink text-lg leading-tight font-semibold">
              {t.value}
            </p>
            <p className="text-shuttle mt-0.5 text-[11px]">{t.label}</p>
          </li>
        ))}
      </ul>

      {certificate ? (
        <div className="border-mist flex flex-col gap-4 border-t px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-brand text-[11px] font-semibold tracking-[0.14em] uppercase">
              Certificate
            </p>
            <p className="text-ink mt-1 text-sm font-semibold">
              {certificate.certificateNo}
            </p>
            <p className="text-shuttle text-xs">
              Issued {formatDate(certificate.issuedAt)} · valid until{" "}
              {formatDate(certificate.expiresAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={`/api/certificates/${certificate.certificateNo}/pdf`}
              className="bg-brand inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
            >
              <FiDownload className="h-4 w-4" />
              Download certificate
            </a>
            <Link
              href="/certification/dashboard"
              className="border-mist text-ink hover:border-brand hover:text-brand inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition"
            >
              <FiArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div className="border-mist border-t px-5 py-5 sm:px-8">
          <p className="text-shuttle text-sm">
            Your certificate is being prepared. Refresh this page in a moment.
          </p>
        </div>
      )}
    </div>
  );
}
