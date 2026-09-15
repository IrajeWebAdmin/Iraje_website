import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getSanityClient } from "@/lib/sanity/client";
import {
  CERTIFICATIONS_QUERY,
  COURSES_WITH_MODULES_QUERY,
  EXAM_QUESTIONS_QUERY,
} from "@/lib/sanity/queries";

// Development-only page proving the website can read the Sanity content model
// end to end: env -> server-only client -> GROQ -> Server Component render.
// Returns 404 in production builds, because it lists question-bank content and
// the question bank must never be publicly browsable.
export const metadata = {
  title: "Sanity check (development only)",
  robots: { index: false, follow: false },
};

export default async function SanityCheckPage() {
  if (process.env.NODE_ENV === "production") notFound();
  await connection();

  const client = getSanityClient();
  const [certifications, courses, questions] = await Promise.all([
    client.fetch(CERTIFICATIONS_QUERY),
    client.fetch(COURSES_WITH_MODULES_QUERY),
    client.fetch(EXAM_QUESTIONS_QUERY, { code: "PAM101" }),
  ]);

  const moduleCount = courses.reduce(
    (sum, course) => sum + course.modules.length,
    0,
  );
  const answerKeyLeaked = JSON.stringify(questions).includes("isCorrect");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 text-sm text-slate-800">
      <h1 className="text-2xl font-semibold">Sanity check</h1>
      <p className="mt-1 text-slate-500">
        Development only. Live data from Sanity, read server-side with the
        Viewer token.
      </p>

      <section className="mt-8 grid gap-3 sm:grid-cols-4">
        {[
          `Certifications: ${certifications.length}`,
          `Courses: ${courses.length}`,
          `Modules: ${moduleCount}`,
          `Active questions (PAM101): ${questions.length}`,
        ].map((stat) => (
          <div
            key={stat}
            className="rounded-lg border border-slate-200 bg-white p-4 font-medium"
          >
            {stat}
          </div>
        ))}
      </section>

      <section
        className={`mt-6 rounded-lg border p-4 font-medium ${
          answerKeyLeaked
            ? "border-red-300 bg-red-50 text-red-800"
            : "border-emerald-300 bg-emerald-50 text-emerald-800"
        }`}
      >
        {answerKeyLeaked
          ? "Answer key check: FAILED — answer key fields reached this page"
          : "Answer key check: passed — no answer key fields in data sent to this page"}
      </section>

      <h2 className="mt-10 text-lg font-semibold">Certifications</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="text-slate-500">
            <tr>
              {[
                "Code",
                "Label",
                "Level",
                "Exam",
                "Validity",
                "Prerequisite",
              ].map((heading) => (
                <th
                  key={heading}
                  className="border-b border-slate-200 py-2 pr-4 font-medium"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {certifications.map((cert) => (
              <tr key={cert._id} className="border-b border-slate-100">
                <td className="py-2 pr-4 font-mono">{cert.code}</td>
                <td className="py-2 pr-4">{cert.label}</td>
                <td className="py-2 pr-4">{cert.level}</td>
                <td className="py-2 pr-4">
                  {`${cert.exam.questionCount} Qs · ${cert.exam.durationMinutes} min · ${cert.exam.passPercentage}% to pass`}
                </td>
                <td className="py-2 pr-4">{`${cert.validityYears} years`}</td>
                <td className="py-2 pr-4">
                  {cert.prerequisite?.code ?? "None"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Courses and modules</h2>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <div
            key={course._id}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <p className="font-mono text-xs text-slate-500">
              {course.certification.code}
            </p>
            <p className="font-medium">{course.title}</p>
            <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-slate-600">
              {course.modules.map((module) => (
                <li key={module._id}>{module.title}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold">
        PAM101 exam questions (as a learner would receive them)
      </h2>
      <div className="mt-3 space-y-4">
        {questions.map((question) => (
          <div
            key={question._id}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <p className="text-xs text-slate-500">{`${question.category} · ${question.difficulty}`}</p>
            <p className="mt-1 font-medium">{question.prompt}</p>
            <ul className="mt-2 space-y-1">
              {question.options.map((option) => (
                <li
                  key={option._key}
                  className="rounded border border-slate-100 px-3 py-1.5"
                >
                  {option.text}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
