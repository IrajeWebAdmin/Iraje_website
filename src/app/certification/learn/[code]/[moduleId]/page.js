import { notFound, redirect } from "next/navigation";
import { FiClock, FiCheckSquare } from "react-icons/fi";
import { requireStudent } from "@/lib/dal";
import { getSanityClient } from "@/lib/sanity/client";
import { KNOWLEDGE_CHECK_QUERY } from "@/lib/sanity/queries";
import { loadLearnerCourse } from "@/lib/learner";
import { markModuleRead, submitKnowledgeCheck } from "../../actions";
import ModuleStep from "@/components/Learn/ModuleStep";
import CourseHeader from "@/components/Learn/CourseHeader";
import CourseOutline from "@/components/Learn/CourseOutline";

export const metadata = { robots: { index: false, follow: false } };

// /certification/learn/pam101/<moduleId> — one module's PDF and knowledge check.
// Course header (title + modules / completed / exam tiles) across the top, the
// outline on the left, the module's PDF reader and knowledge check on the right.
// On small screens the outline drops below the content.
export default async function ModulePage({ params }) {
  const user = await requireStudent();
  const { code, moduleId } = await params;
  const course = await loadLearnerCourse(user.id, code);
  if (!course?.outline) redirect("/certification/dashboard");

  const base = `/certification/learn/${course.code.toLowerCase()}`;
  const steps = course.outline.steps;
  const index = steps.findIndex((s) => s._id === moduleId);
  if (index < 0) notFound();
  const step = steps[index];
  if (!step.unlocked) redirect(base); // typed the address of a locked module

  const questions = step.checkCount
    ? await getSanityClient().fetch(KNOWLEDGE_CHECK_QUERY, {
        moduleId: step._id,
      })
    : [];
  const next = steps[index + 1];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <CourseHeader course={course} />

      <div className="mt-6 flex flex-col gap-8 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start lg:gap-6">
        {/* Main column: module header card, then the PDF and knowledge check. */}
        <div className="min-w-0">
          <div className="border-mist rounded-2xl border bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="bg-ink rounded-md px-2.5 py-1 text-xs font-semibold text-white">
                {course.cert.label}
              </span>
              <span className="text-brand text-xs font-medium">
                Module {step.order} of {steps.length}
              </span>
              {step.estimatedMinutes > 0 && (
                <span className="text-shuttle inline-flex items-center gap-1 text-xs">
                  <FiClock className="h-3.5 w-3.5" />
                  {step.estimatedMinutes} min
                </span>
              )}
              <span className="text-shuttle inline-flex items-center gap-1 text-xs">
                <FiCheckSquare className="h-3.5 w-3.5" />
                {step.checkCount > 0
                  ? `${step.checkCount}-question knowledge check`
                  : "No knowledge check"}
              </span>
            </div>
            <h2 className="text-ink mt-3 text-2xl font-semibold">
              {step.title}
            </h2>
            {step.summary && (
              <p className="text-shuttle mt-2 text-sm leading-relaxed">
                {step.summary}
              </p>
            )}
          </div>

          <div className="mt-6">
            <ModuleStep
              key={step._id}
              hasPdf={step.hasPdf}
              materialUrl={`/api/materials/${step._id}`}
              initialRead={step.read}
              initialPassed={step.checkCount > 0 && step.checkPassed}
              questions={questions}
              markReadAction={markModuleRead.bind(null, course.code, step._id)}
              submitCheckAction={submitKnowledgeCheck.bind(
                null,
                course.code,
                step._id,
              )}
              nextHref={next ? `${base}/${next._id}` : `${base}/exam`}
              nextLabel={
                next ? `Next: Module ${next.order}` : "Go to the final exam"
              }
            />
          </div>
        </div>

        {/* Outline: first column on desktop, after the content on phones. */}
        <div className="lg:order-first">
          <CourseOutline course={course} base={base} currentId={step._id} />
        </div>
      </div>
    </div>
  );
}
