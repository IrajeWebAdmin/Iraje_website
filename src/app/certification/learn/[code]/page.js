import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/dal";
import PortalHeader from "@/components/Portal/PortalHeader";
import { loadLearnerCourse } from "@/lib/learner";
import { continueHref } from "@/lib/dashboard";
import CourseHeader from "@/components/Learn/CourseHeader";
import OpenCourse from "@/components/Learn/OpenCourse";

export const metadata = { robots: { index: false, follow: false } };

// /certification/learn/pam101 — opens the learning path where the learner left
// off: the module to read next, or the final exam once every module is done.
// The dashboard links straight to that page; this one only catches typed or
// bookmarked addresses, and hands over from the browser (see OpenCourse) rather
// than with redirect(), which misfires during client-side navigation in dev.
export default async function CoursePage({ params }) {
  const user = await requireStudent();
  const { code } = await params;
  const course = await loadLearnerCourse(user.id, code);
  if (!course) redirect("/certification/dashboard"); // not theirs, or unknown

  const base = `/certification/learn/${course.code.toLowerCase()}`;
  const target = continueHref(course.outline, base);

  return (
    <>
      <PortalHeader user={user} />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <CourseHeader course={course} />
        {course.outline && target !== base ? (
          <OpenCourse href={target} />
        ) : (
          // No modules in Sanity yet — nothing to open, so say so under the header.
          <p className="border-mist text-shuttle mt-6 rounded-2xl border bg-white p-6 text-sm">
            Course content is coming soon.
          </p>
        )}
      </div>
    </>
  );
}
