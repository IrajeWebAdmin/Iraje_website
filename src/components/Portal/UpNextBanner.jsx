import Link from "next/link";
import {
  FiArrowRight,
  FiCheckSquare,
  FiBookOpen,
  FiPlay,
} from "react-icons/fi";
import { LEVEL_LABEL, continueHref } from "@/lib/dashboard";

// The dark "Up next" strip: the exam that is ready, otherwise the module to
// continue, otherwise the course to start. `card` comes from pickUpNext().
export default function UpNextBanner({ card, id }) {
  const { cert, outline, state } = card;
  const base = `/certification/learn/${cert.code.toLowerCase()}`;

  let eyebrow, title, meta, href, cta, Icon;
  if (state === "examReady") {
    const exam = cert.exam ?? {};
    const level = LEVEL_LABEL[cert.level];
    eyebrow = "Up next · Exam eligible";
    title = `${cert.label} — ${level ? `Certified ${level}` : cert.title} exam is ready`;
    meta = [
      exam.questionCount && `${exam.questionCount} MCQs`,
      exam.durationMinutes && `${exam.durationMinutes} minutes`,
      exam.passPercentage && `${exam.passPercentage}% to pass`,
    ]
      .filter(Boolean)
      .join(" · ");
    href = `${base}/exam`;
    cta = "Take exam";
    Icon = FiCheckSquare;
  } else if (state === "inProgress") {
    const step = outline.steps.find((s) => s.state === "current");
    eyebrow = "Up next · Continue learning";
    title = step
      ? `${cert.label} — Module ${step.order}: ${step.title}`
      : `${cert.label} — ${cert.title}`;
    meta = `${outline.completed} of ${outline.total} modules complete · ${outline.percent}%`;
    href = continueHref(outline, base);
    cta = "Continue";
    Icon = FiPlay;
  } else {
    eyebrow = "Up next · Start learning";
    title = `${cert.label} — ${cert.title}`;
    meta = `${outline.total} modules · PDF and knowledge check in each`;
    href = continueHref(outline, base);
    cta = "Start course";
    Icon = FiBookOpen;
  }

  return (
    <section
      id={id}
      className="bg-ink mt-6 flex scroll-mt-24 flex-col gap-5 rounded-2xl p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6"
    >
      <div className="flex items-start gap-4">
        <span className="bg-azure flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-nepal text-[11px]">{eyebrow}</p>
          <p className="mt-1 text-base leading-snug font-semibold">{title}</p>
          {meta && <p className="text-nepal mt-1 text-xs">{meta}</p>}
        </div>
      </div>
      <Link
        href={href}
        className="text-ink hover:bg-catskill inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold transition"
      >
        {cta}
        <FiArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
