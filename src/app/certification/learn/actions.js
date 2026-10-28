"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/dal";
import { getSanityClient } from "@/lib/sanity/client";
import {
  ANSWER_KEY_QUERY,
  EXAM_SET_QUESTIONS_QUERY,
  KNOWLEDGE_CHECK_QUERY,
} from "@/lib/sanity/queries";
import { loadLearnerCourse } from "@/lib/learner";
import {
  buildAttemptPaper,
  chooseExamSet,
  retakeAvailableAt,
} from "@/lib/learning";
import { RETAKE_WAIT_DAYS } from "@/lib/examRules";
import { finishAttempt, SUBMIT_GRACE_MS } from "@/lib/exam";
import { formatDate } from "@/lib/formatDate";

// Every action re-checks: signed-in learner, enrolled, and the step unlocked.
// The page that rendered the button already checked — but these are public
// endpoints, so they never trust that.

async function findUnlockedStep(userId, code, moduleId) {
  const course = await loadLearnerCourse(userId, code);
  const step = course?.outline?.steps.find((s) => s._id === moduleId);
  return step?.unlocked ? { course, step } : null;
}

function refresh(code) {
  revalidatePath(`/certification/learn/${code.toLowerCase()}`, "layout");
  revalidatePath("/certification/dashboard");
}

/** The learner reached the last page and clicked "Mark as read". */
export async function markModuleRead(code, moduleId) {
  const user = await requireStudent();
  const found = await findUnlockedStep(user.id, code, moduleId);
  if (!found) return { error: "This module is locked." };
  if (!found.step.hasPdf)
    return { error: "This module has no study material yet." };

  const userCertificationId = found.course.enrolment.id;
  await prisma.moduleProgress.upsert({
    where: { userCertificationId_moduleId: { userCertificationId, moduleId } },
    create: { userCertificationId, moduleId, readAt: new Date() },
    update: found.step.read ? {} : { readAt: new Date() },
  });
  refresh(found.course.code);
  return { ok: true };
}

/**
 * Mark the 2–3 questions after a PDF. All must be correct to move on.
 * answers: { [questionId]: optionKey }
 * The right answers are only revealed once every answer is correct.
 */
export async function submitKnowledgeCheck(code, moduleId, answers) {
  const user = await requireStudent();
  const found = await findUnlockedStep(user.id, code, moduleId);
  if (!found) return { error: "This module is locked." };
  if (!found.step.read) return { error: "Finish reading the PDF first." };

  const sanity = getSanityClient();
  const questions = await sanity.fetch(KNOWLEDGE_CHECK_QUERY, { moduleId });
  if (!questions.length) return { error: "This module has no questions." };

  const keyRows = await sanity.fetch(ANSWER_KEY_QUERY, {
    ids: questions.map((q) => q._id),
  });
  const key = Object.fromEntries(keyRows.map((r) => [r._id, r]));

  const results = questions.map((q) => ({
    id: q._id,
    correct:
      typeof answers?.[q._id] === "string" &&
      answers[q._id] === key[q._id]?.correct,
  }));
  const right = results.filter((r) => r.correct).length;

  if (right < results.length) {
    return {
      passed: false,
      results,
      message: `${right} of ${results.length} correct. Review the PDF and try the ones marked wrong again.`,
    };
  }

  const userCertificationId = found.course.enrolment.id;
  await prisma.moduleProgress.update({
    where: { userCertificationId_moduleId: { userCertificationId, moduleId } },
    data: { checkPassedAt: new Date() },
  });
  refresh(found.course.code);

  return {
    passed: true,
    results,
    explanations: Object.fromEntries(
      questions.map((q) => [q._id, key[q._id]?.explanation ?? ""]),
    ),
  };
}

/** Start the final exam: pick a set, freeze the paper, start the clock. */
export async function startExam(code) {
  const user = await requireStudent();
  const course = await loadLearnerCourse(user.id, code);
  if (!course?.outline?.examUnlocked)
    return { error: "Finish every module first." };
  if (course.enrolment.status === "passed")
    return { error: "You have already passed this exam." };

  const attempts = await prisma.examAttempt.findMany({
    where: { userCertificationId: course.enrolment.id },
    orderBy: { startedAt: "desc" },
  });

  // Already sitting it (another tab, or a double click)? Just carry on.
  const open = attempts.find((a) => !a.submittedAt);
  if (open && open.deadlineAt.getTime() + SUBMIT_GRACE_MS > Date.now()) {
    refresh(course.code);
    return { ok: true };
  }
  if (open) {
    await finishAttempt(open.id, null); // timed out without submitting
    refresh(course.code);
    return {
      error:
        "Your previous attempt ran out of time and has been marked. Reload the page.",
    };
  }

  const lastFailed = attempts.find((a) => a.submittedAt && a.passed === false);
  const waitUntil = retakeAvailableAt(
    lastFailed?.submittedAt,
    RETAKE_WAIT_DAYS,
  );
  if (waitUntil) {
    return {
      error: `You can retake the exam from ${formatDate(waitUntil, { withTime: true })}.`,
    };
  }

  const set = chooseExamSet(
    course.cert.examSets ?? [],
    attempts.map((a) => a.examSet),
  );
  if (set === null)
    return { error: "The exam isn't available yet. Please check back later." };

  const questions = await getSanityClient().fetch(EXAM_SET_QUESTIONS_QUERY, {
    code: course.code,
    set,
  });
  if (!questions.length)
    return { error: "The exam isn't available yet. Please check back later." };

  const minutes = course.cert.exam?.durationMinutes ?? 60;
  const now = new Date();
  await prisma.examAttempt.create({
    data: {
      userCertificationId: course.enrolment.id,
      examSet: set,
      paper: buildAttemptPaper(questions),
      startedAt: now,
      deadlineAt: new Date(now.getTime() + minutes * 60 * 1000),
    },
  });
  refresh(course.code);
  return { ok: true };
}

/** Hand in the exam. answers: { [questionId]: optionKey } */
export async function submitExam(attemptId, answers) {
  const user = await requireStudent();
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: Number(attemptId) },
    include: { userCertification: true },
  });
  if (!attempt || attempt.userCertification.userId !== user.id)
    return { error: "Attempt not found." };

  const done = await finishAttempt(attempt.id, answers);
  refresh(attempt.userCertification.certificationCode);
  return { ok: true, passed: done.passed, percentage: done.percentage };
}
