import Link from "next/link";
import { FiChevronLeft } from "react-icons/fi";

// Course header for the learning pages, as in the design: a "My Dashboard"
// back link, then a card with the certification label, the course title and
// three tiles — modules, completed, final exam. Replaces the progress bar.
export default function CourseHeader({ course }) {
  const { cert, outline, enrolment } = course;
  const passed = enrolment.status === "passed";
  const exam = passed
    ? { value: "Passed", tone: "text-[#1B8A4B]" }
    : outline?.examUnlocked
      ? { value: "Ready", tone: "text-brand" }
      : { value: "Locked", tone: "text-ink" };

  const tiles = [
    { value: outline?.total ?? 0, label: "Modules", tone: "text-brand" },
    { value: outline?.completed ?? 0, label: "Completed", tone: "text-brand" },
    { value: exam.value, label: "Final Exam", tone: exam.tone },
  ];

  return (
    <div>
      <Link
        href="/certification/dashboard"
        className="text-ink hover:text-brand inline-flex items-center gap-1 text-sm transition"
      >
        <FiChevronLeft className="h-4 w-4" />
        My Dashboard
      </Link>

      <div className="border-mist mt-4 flex flex-col gap-6 rounded-2xl border bg-white p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-brand text-base font-medium">{cert.label}</p>
          <h1 className="text-ink mt-1 text-2xl leading-tight font-semibold sm:text-3xl">
            {cert.course?.title ?? cert.title}
          </h1>
        </div>

        <ul className="grid grid-cols-3 gap-3 sm:gap-4 lg:shrink-0">
          {tiles.map((t) => (
            <li
              key={t.label}
              className="border-mist rounded-xl border px-4 py-3 sm:min-w-[100px]"
            >
              <p className={`text-lg leading-tight font-semibold ${t.tone}`}>
                {t.value}
              </p>
              <p className="text-shuttle mt-0.5 text-[11px]">{t.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
