import Link from "next/link";
import { redirect } from "next/navigation";
import { FiArrowLeft, FiLock } from "react-icons/fi";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/dal";
import PortalHeader from "@/components/Portal/PortalHeader";
import { getSanityClient } from "@/lib/sanity/client";
import { QUESTIONS_BY_ID_QUERY } from "@/lib/sanity/queries";
import { loadLearnerCourse } from "@/lib/learner";
import { finishAttempt, SUBMIT_GRACE_MS } from "@/lib/exam";
import { retakeAvailableAt } from "@/lib/learning";
import { RETAKE_WAIT_DAYS } from "@/lib/examRules";
import { continueHref } from "@/lib/dashboard";
import { displayCertCode } from "@/lib/certCodes";
import { formatDate } from "@/lib/formatDate";
import { startExam, submitExam } from "../../actions";
import CourseHeader from "@/components/Learn/CourseHeader";
import CourseOutline from "@/components/Learn/CourseOutline";
import ExamStart from "@/components/Learn/ExamStart";
import ExamResult from "@/components/Learn/ExamResult";
import ExamRunner from "@/components/Learn/ExamRunner";

export const metadata = { robots: { index: false, follow: false } };

// /certification/learn/pam101/exam — instructions + start, the paper itself,
// the locked notice, or the result. Course header on top and the outline on
// the left, except while the paper is open or on the instructions page,
// which stands alone as in the design.
export default async function ExamPage({ params }) {
  const user = await requireStudent();
  const { code } = await params;
  const course = await loadLearnerCourse(user.id, code);
  if (!course?.outline) redirect("/certification/dashboard");
  const base = `/certification/learn/${course.code.toLowerCase()}`;
  const exam = course.cert.exam ?? {};
  // The course outline lives on the module pages; the last one is the way
  // back from the exam.
  const steps = course.outline.steps;
  const outlineHref = steps.length
    ? `${base}/${steps[steps.length - 1]._id}`
    : "/certification/dashboard";

  const loadAttempts = () =>
    prisma.examAttempt.findMany({
      where: { userCertificationId: course.enrolment.id },
      orderBy: { startedAt: "desc" },
      include: { certificate: true },
    });
  let attempts = await loadAttempts();

  // Close any attempt whose time ran out without a submit (tab closed, etc.).
  const expired = attempts.filter(
    (a) =>
      !a.submittedAt && a.deadlineAt.getTime() + SUBMIT_GRACE_MS < Date.now(),
  );
  if (expired.length) {
    for (const a of expired) await finishAttempt(a.id, null);
    attempts = await loadAttempts();
  }

  const open = attempts.find((a) => !a.submittedAt);
  const passed = attempts.find((a) => a.passed);
  const last = attempts.find((a) => a.submittedAt);

  let body;
  let showOutline = true;
  let showHeader = true;
  let backLink = null;
  if (passed) {
    // The result stands alone, as in the design: one centred card.
    showOutline = false;
    showHeader = false;
    body = (
      <ExamResult
        attempt={passed}
        certificate={passed.certificate}
        exam={exam}
        code={displayCertCode(course.code)}
        title={passed.certificate?.certificationTitle ?? course.cert.title}
      />
    );
  } else if (open) {
    // Show the frozen paper in its saved order, with no answer key.
    const rows = await getSanityClient().fetch(QUESTIONS_BY_ID_QUERY, {
      ids: open.paper.map((q) => q.id),
    });
    const byId = new Map(rows.map((q) => [q._id, q]));
    const questions = open.paper
      .filter((p) => byId.has(p.id))
      .map((p) => {
        const q = byId.get(p.id);
        const options = new Map(q.options.map((o) => [o._key, o]));
        return {
          id: q._id,
          prompt: q.prompt,
          options: p.options.map((k) => options.get(k)).filter(Boolean),
        };
      });
    // The paper takes over the page: its own top bar with the countdown and
    // Submit replaces the portal header.
    return (
      <ExamRunner
        attemptId={open.id}
        deadlineAt={open.deadlineAt.toISOString()}
        serverNow={new Date().toISOString()}
        questions={questions}
        submitAction={submitExam}
        code={displayCertCode(course.code)}
        label={course.cert.label}
        courseTitle={course.cert.course?.title ?? course.cert.title}
        exam={exam}
        outlineHref={outlineHref}
      />
    );
  } else if (!course.outline.examUnlocked) {
    const { completed, total } = course.outline;
    body = (
      <div className="border-mist flex items-start gap-4 rounded-2xl border bg-white px-5 py-6 sm:px-6">
        <span className="text-slate-soft flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F1F4F9]">
          <FiLock className="h-5 w-5" />
        </span>
        <div>
          <p className="text-brand text-[11px] font-semibold tracking-[0.14em] uppercase">
            Final exam
          </p>
          <h2 className="text-ink mt-1 text-xl font-semibold">
            Finish every module to unlock the exam.
          </h2>
          <p className="text-shuttle mt-1 text-sm">
            {completed} of {total} modules complete.
          </p>
          <Link
            href={continueHref(course.outline, base)}
            className="bg-brand mt-4 inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
          >
            Continue learning
          </Link>
        </div>
      </div>
    );
  } else {
    const failedAt = attempts.find((a) => a.passed === false)?.submittedAt;
    const waitUntil = retakeAvailableAt(failedAt, RETAKE_WAIT_DAYS);
    const shownCode = displayCertCode(course.code);
    // The instructions page stands alone, as in the design: a back link to
    // the course outline (the last module page shows it), then the
    // instructions card with its sidebar. No course header, no outline column.
    showOutline = false;
    showHeader = false;
    backLink = {
      href: outlineHref,
      label: `${shownCode} outline`,
    };
    body = (
      <ExamStart
        action={startExam.bind(null, course.code)}
        exam={exam}
        code={shownCode}
        label={course.cert.label}
        courseTitle={course.cert.course?.title ?? course.cert.title}
        modules={{
          completed: course.outline.completed,
          total: course.outline.total,
        }}
        attemptNumber={attempts.filter((a) => a.submittedAt).length + 1}
        lastAttempt={
          last && last.passed === false ? { percentage: last.percentage } : null
        }
        waitUntil={waitUntil ? formatDate(waitUntil, { withTime: true }) : null}
        notNowHref="/certification/dashboard"
      />
    );
  }

  return (
    <>
      <PortalHeader user={user} />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {showHeader && <CourseHeader course={course} />}
        {backLink && (
          <Link
            href={backLink.href}
            className="text-shuttle hover:text-brand mb-5 inline-flex items-center gap-1.5 text-xs font-medium transition"
          >
            <FiArrowLeft className="h-3.5 w-3.5" />
            {backLink.label}
          </Link>
        )}
        {showOutline ? (
          <div className="mt-6 flex flex-col gap-8 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start lg:gap-6">
            <div className="min-w-0">{body}</div>
            <div className="lg:order-first">
              <CourseOutline course={course} base={base} currentId="exam" />
            </div>
          </div>
        ) : (
          body
        )}
      </div>
    </>
  );
}
