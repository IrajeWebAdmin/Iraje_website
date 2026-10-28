"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { parseCertList } from "@/lib/certCodes";
import {
  generateTempPassword,
  hashPassword,
  tempPasswordExpiry,
} from "@/lib/password";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/mailer";

// Thrown inside a transaction to cancel it with a message the admin should see.
class ReviewError extends Error {}

// How each message describes the email: only say "emailed" if it really was.
// In console mode (MAIL_TRANSPORT=console) it was only printed in the terminal.
function delivery(mail, to) {
  return mail?.sent
    ? `emailed to ${to}`
    : `printed in the server terminal for ${to} — NOT sent, because email is in console mode (MAIL_TRANSPORT=console)`;
}

function refresh(enrollmentId) {
  revalidatePath("/admin/enrollments");
  revalidatePath(`/admin/enrollments/${enrollmentId}`);
}

/**
 * Accept a request: create (or reuse) the learner account and email the login
 * details. `enrollmentId` is bound on the server by the detail page.
 */
export async function approveEnrollment(enrollmentId) {
  const admin = await requireAdmin();

  // Hash before the transaction: bcrypt is slow on purpose, and a database
  // transaction should hold its locks for as short a time as possible.
  const tempPassword = generateTempPassword();
  const tempHash = await hashPassword(tempPassword);
  const now = new Date();
  const expiresAt = tempPasswordExpiry(now);

  let result;
  try {
    // Everything inside $transaction happens together or not at all.
    result = await prisma.$transaction(async (tx) => {
      // "Claim" the request: this only matches while it is still "new", so if
      // two admins click Accept at once, exactly one of them wins.
      const claimed = await tx.enrollment.updateMany({
        where: { id: enrollmentId, status: "new" },
        data: { status: "approved", reviewedAt: now, reviewedById: admin.id },
      });
      if (claimed.count === 0) {
        throw new ReviewError("This request has already been decided. Refresh the page to see the result.");
      }

      const enrollment = await tx.enrollment.findUniqueOrThrow({ where: { id: enrollmentId } });
      const email = enrollment.email.trim().toLowerCase();

      let user = await tx.user.findUnique({ where: { email } });
      let sentPassword = null;

      if (!user) {
        user = await tx.user.create({
          data: {
            email,
            name: enrollment.name,
            passwordHash: tempHash,
            role: "student",
            mustChangePassword: true,
            tempPasswordExpiresAt: expiresAt,
          },
        });
        sentPassword = tempPassword;
      } else if (user.role !== "student") {
        throw new ReviewError("This email address belongs to an admin account, so it can't be approved as a learner.");
      } else if (user.mustChangePassword) {
        // Approved before but never signed in — their old temporary password
        // may be lost or expired, so issue a fresh one.
        await tx.user.update({
          where: { id: user.id },
          data: { passwordHash: tempHash, tempPasswordExpiresAt: expiresAt },
        });
        sentPassword = tempPassword;
      }
      // Otherwise they already have a password of their own: leave it alone.

      await tx.enrollment.update({
        where: { id: enrollmentId },
        data: { userId: user.id },
      });

      // One learning record per approved certification. If Priya already has
      // PAM101 and is now approved for EPM201, she gets a second row.
      for (const code of parseCertList(enrollment.certifications)) {
        await tx.userCertification.upsert({
          where: { userId_certificationCode: { userId: user.id, certificationCode: code } },
          create: { userId: user.id, certificationCode: code },
          update: {},
        });
      }

      return { enrollment, email, sentPassword };
    });
  } catch (err) {
    if (err instanceof ReviewError) return { error: err.message };
    console.error("[admin] approve failed:", err);
    return { error: "Could not approve this request. Nothing was changed — please try again." };
  }

  refresh(enrollmentId);

  // The approval is saved. Email is sent after, and a failure doesn't undo it.
  try {
    const mail = await sendApprovalEmail({
      name: result.enrollment.name,
      email: result.email,
      certifications: result.enrollment.certifications,
      tempPassword: result.sentPassword,
      expiresAt,
    });
    return { message: `Approved. Login details ${delivery(mail, result.email)}.` };
  } catch (err) {
    console.error("[admin] approval email failed:", err);
    return { error: 'Approved, but the email could not be sent. Use "Resend login details" once email is working.' };
  }
}

/** Reject a request, with an optional reason that goes into the email. */
export async function rejectEnrollment(enrollmentId, _previousState, formData) {
  const admin = await requireAdmin();

  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length > 500) {
    return { error: "Please keep the reason under 500 characters." };
  }

  let enrollment;
  try {
    const claimed = await prisma.enrollment.updateMany({
      where: { id: enrollmentId, status: "new" },
      data: {
        status: "rejected",
        rejectionReason: reason || null,
        reviewedAt: new Date(),
        reviewedById: admin.id,
      },
    });
    if (claimed.count === 0) {
      return { error: "This request has already been decided. Refresh the page to see the result." };
    }
    enrollment = await prisma.enrollment.findUniqueOrThrow({ where: { id: enrollmentId } });
  } catch (err) {
    console.error("[admin] reject failed:", err);
    return { error: "Could not reject this request. Please try again." };
  }

  refresh(enrollmentId);

  try {
    const mail = await sendRejectionEmail(enrollment);
    return { message: `Rejected. The rejection email was ${delivery(mail, enrollment.email)}.` };
  } catch (err) {
    console.error("[admin] rejection email failed:", err);
    return { error: "Rejected, but the email to the applicant could not be sent." };
  }
}

/** Give an approved learner who never signed in a new temporary password. */
export async function resendCredentials(enrollmentId) {
  await requireAdmin();

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: {
      name: true,
      status: true,
      certifications: true,
      user: { select: { id: true, email: true, mustChangePassword: true } },
    },
  });

  if (!enrollment || enrollment.status !== "approved" || !enrollment.user) {
    return { error: "Only approved requests have login details to resend." };
  }
  if (!enrollment.user.mustChangePassword) {
    return { error: "This learner has already set their own password." };
  }

  const tempPassword = generateTempPassword();
  const expiresAt = tempPasswordExpiry();

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: enrollment.user.id },
        data: { passwordHash: await hashPassword(tempPassword), tempPasswordExpiresAt: expiresAt },
      }),
      prisma.session.deleteMany({ where: { userId: enrollment.user.id } }),
    ]);
  } catch (err) {
    console.error("[admin] resend failed:", err);
    return { error: "Could not create new login details. Please try again." };
  }

  try {
    const mail = await sendApprovalEmail({
      name: enrollment.name,
      email: enrollment.user.email,
      certifications: enrollment.certifications,
      tempPassword,
      expiresAt,
    });
    return { message: `New login details ${delivery(mail, enrollment.user.email)}.` };
  } catch (err) {
    console.error("[admin] resend email failed:", err);
    return { error: "The password was reset, but the email could not be sent. Try again once email is working." };
  }
}