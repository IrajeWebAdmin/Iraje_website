import "server-only";
import { prisma } from "@/lib/prisma";
import { getSanityClient } from "@/lib/sanity/client";
import { ANSWER_KEY_QUERY } from "@/lib/sanity/queries";
import { addYears, gradeAnswers, makeCertificateNumber } from "@/lib/learning";
import { renderCertificatePdf } from "@/lib/certificatePdf";
import { sendCertificateEmail } from "@/lib/mailer";

// Answers arriving this long after the timer ends still count — covers a slow
// network on the final click. Anything later is marked as unanswered.
export const SUBMIT_GRACE_MS = 2 * 60 * 1000;

/** The organisation printed on a learner's certificate: from their latest approved request. */
export async function learnerOrganization(userId) {
  const row = await prisma.enrollment.findFirst({
    where: { userId, status: "approved" },
    orderBy: { reviewedAt: "desc" },
    select: { organization: true },
  });
  return row?.organization ?? null;
}

/**
 * Mark an attempt, and if it passed, issue the certificate — all in one
 * transaction. Safe to call twice: an attempt that is already marked is
 * returned unchanged. Returns the updated attempt (with `certificate`).
 *
 * `answers` is ignored when it arrives after the deadline + grace period.
 */
export async function finishAttempt(attemptId, answers, now = new Date()) {
  const attempt = await prisma.examAttempt.findUniqueOrThrow({
    where: { id: attemptId },
    include: { userCertification: { include: { user: true } }, certificate: true },
  });
  if (attempt.submittedAt) return attempt;

  const inTime = now.getTime() <= attempt.deadlineAt.getTime() + SUBMIT_GRACE_MS;
  const given = inTime && answers && typeof answers === "object" ? answers : {};

  const paper = attempt.paper;
  const keyRows = await getSanityClient().fetch(ANSWER_KEY_QUERY, { ids: paper.map((q) => q.id) });
  const answerKey = Object.fromEntries(keyRows.map((r) => [r._id, r.correct]));

  // Keep only answers to questions on this paper, with option keys that exist.
  const cleanAnswers = {};
  for (const q of paper) {
    if (typeof given[q.id] === "string" && q.options.includes(given[q.id])) cleanAnswers[q.id] = given[q.id];
  }

  const { score, total, percentage } = gradeAnswers(paper, cleanAnswers, answerKey);
  const enrolment = attempt.userCertification;
  const cert = await getSanityClient().fetch(
    `*[_type == "certification" && code == $code][0]{ title, validityYears, exam, "templateUrl": certificateTemplate.asset->url }`,
    { code: enrolment.certificationCode },
  );
  const passed = percentage >= (cert?.exam?.passPercentage ?? 100);

  const updated = await prisma.$transaction(async (tx) => {
    // Only mark it if no one else has in the meantime (double-click, two tabs).
    const claimed = await tx.examAttempt.updateMany({
      where: { id: attemptId, submittedAt: null },
      data: { submittedAt: now, answers: cleanAnswers, score, total, percentage, passed },
    });
    if (claimed.count === 0) return null;

    if (passed) {
      await tx.userCertification.update({
        where: { id: enrolment.id },
        data: { status: "passed", completedAt: now },
      });
      // Retry in the (astronomically unlikely) case two numbers collide.
      for (let i = 0; i < 3; i++) {
        try {
          await tx.certificate.create({
            data: {
              certificateNo: makeCertificateNumber(enrolment.certificationCode),
              userCertificationId: enrolment.id,
              examAttemptId: attemptId,
              holderName: enrolment.user.name,
              certificationCode: enrolment.certificationCode,
              certificationTitle: cert?.title ?? enrolment.certificationCode,
              scorePercentage: percentage,
              issuedAt: now,
              expiresAt: addYears(now, cert?.validityYears ?? 3),
            },
          });
          break;
        } catch (err) {
          if (err?.code !== "P2002" || i === 2) throw err;
        }
      }
    }
    return true;
  });

  const result = await prisma.examAttempt.findUniqueOrThrow({
    where: { id: attemptId },
    include: { certificate: true },
  });

  // Email after the transaction: a mail problem never undoes a pass.
  if (updated && result.certificate) {
    try {
      const pdf = await renderCertificatePdf(
        result.certificate,
        cert?.templateUrl ?? null,
        await learnerOrganization(enrolment.userId),
      );
      await sendCertificateEmail({
        to: enrolment.user.email,
        certificate: result.certificate,
        pdf,
      });
    } catch (err) {
      console.error("[exam] certificate email failed:", err);
    }
  }
  return result;
}
