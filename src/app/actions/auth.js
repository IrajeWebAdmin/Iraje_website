"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  getDummyHash,
  hashPassword,
  validateNewPassword,
} from "@/lib/password";
import { createSession, deleteCurrentSession } from "@/lib/session";
import { getCurrentUser, AREAS } from "@/lib/dal";
import { createRateLimiter, clientIp } from "@/lib/rateLimit";
import { after } from "next/server";
import { validateEmail } from "@/lib/validation";
import { isHoneypotTripped } from "@/lib/honeypot";
import {
  issueResetToken,
  userForResetToken,
  RESET_LINK_MINUTES,
} from "@/lib/passwordReset";
import { sendPasswordResetEmail } from "@/lib/mailer";

// Every function in a "use server" file can be called from the browser, so
// each one checks its own inputs and permissions — never trust the form.

// 10 sign-in attempts per 15 minutes per network, shared by both login pages.
const loginLimiter = createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });

/**
 * Sign in. `role` is bound by the page ("admin" or "student"), so the admin
 * page only lets admins in and the learner page only lets learners in.
 * Returns { error, email } for the form to show, or redirects on success.
 */
export async function login(role, _previousState, formData) {
  const area = AREAS[role];
  if (!area) return { error: "Invalid sign-in request." };

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const limit = loginLimiter.check(clientIp({ headers: await headers() }));
  if (!limit.allowed) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterSeconds / 60));
    return {
      error: `Too many sign-in attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      email,
    };
  }

  if (!email || !password) {
    return { error: "Enter your email and password.", email };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always run one bcrypt comparison, even when the email is unknown.
  const passwordOk = await verifyPassword(
    password,
    user?.passwordHash ?? (await getDummyHash()),
  );

  // One message for every failure, so nobody can learn which emails exist.
  if (!user || !passwordOk || user.role !== role || user.status !== "active") {
    return { error: "Invalid email or password.", email };
  }

  if (
    user.mustChangePassword &&
    user.tempPasswordExpiresAt &&
    user.tempPasswordExpiresAt <= new Date()
  ) {
    return {
      error:
        "Your temporary password has expired. Please contact contact@iraje.com for a new one.",
      email,
    };
  }

  // Learners choose with "Keep me signed in"; the admin form has no such box
  // and keeps its usual 12-hour login.
  const persistent = role === "admin" || formData.get("remember") === "on";
  // The only durable sign-in record (sessions are deleted on logout); the
  // admin reports read it for "last login" and "never signed in".
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date(), loginCount: { increment: 1 } },
  });
  await createSession(user, { persistent });
  // redirect() works by throwing, so it must stay outside any try/catch.
  redirect(user.mustChangePassword ? area.changePassword : area.home);
}

export async function logout() {
  const user = await getCurrentUser();
  await deleteCurrentSession();
  redirect(user?.role === "admin" ? AREAS.admin.login : AREAS.student.login);
}

/** Change password — used for the forced first change and any later change. */
export async function changePassword(_previousState, formData) {
  const user = await getCurrentUser();
  if (!user) redirect(AREAS.student.login);

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  const { passwordHash } = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  if (!(await verifyPassword(current, passwordHash))) {
    return { error: "Your current password is incorrect." };
  }

  const problem = validateNewPassword(next, confirm);
  if (problem) return { error: problem };
  if (next === current) {
    return { error: "Choose a password different from your current one." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(next),
      mustChangePassword: false,
      tempPasswordExpiresAt: null,
    },
  });

  // Sign out every browser (including any that knew the old password), then
  // sign this one back in.
  await prisma.session.deleteMany({ where: { userId: user.id } });
  await createSession(user);

  redirect(AREAS[user.role].home);
}

// ---- Forgot password ---------------------------------------------------------
// 5 reset emails an hour per network and 3 an hour per address. Past those
// checks the answer is always "sent", whether or not the address has an
// account, so the form can't be used to find out which emails are registered.
const resetIpLimiter = createRateLimiter({
  limit: 5,
  windowMs: 60 * 60 * 1000,
});
const resetEmailLimiter = createRateLimiter({
  limit: 3,
  windowMs: 60 * 60 * 1000,
});

/** Step 1 of "forgot password": email a reset link if the address is a learner's. */
export async function requestPasswordReset(_previousState, formData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  // Bots fill the hidden field: answer as if sent, and do nothing.
  if (isHoneypotTripped(Object.fromEntries(formData)))
    return { sent: true, email };

  const problem = validateEmail(email);
  if (problem) return { error: problem, email };

  const limit = resetIpLimiter.check(clientIp({ headers: await headers() }));
  if (!limit.allowed) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterSeconds / 60));
    return {
      error: `Too many reset requests. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      email,
    };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const eligible = user && user.role === "student" && user.status === "active";
  if (eligible && resetEmailLimiter.check(email).allowed) {
    const token = issueResetToken(user);
    // Sent after the reply has gone, so the reply takes the same time whether
    // or not an email goes out.
    after(async () => {
      try {
        await sendPasswordResetEmail({
          email,
          name: user.name,
          token,
          minutes: RESET_LINK_MINUTES,
        });
      } catch (err) {
        console.error(`[auth] Password reset email to ${email} failed:`, err);
      }
    });
  }
  return { sent: true, email };
}

/**
 * Step 2: the page the emailed link opens. `token` is bound by that page.
 * Saves the new password, signs out every other browser and signs this one in.
 */
export async function resetPassword(token, _previousState, formData) {
  const user = await userForResetToken(token);
  if (!user) {
    return {
      error: "This link has expired or was already used.",
      expired: true,
    };
  }

  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  const problem = validateNewPassword(next, confirm);
  if (problem) return { error: problem };

  // The new hash also retires every outstanding link for this account.
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(next),
      mustChangePassword: false,
      tempPasswordExpiresAt: null,
      lastLoginAt: new Date(),
      loginCount: { increment: 1 },
    },
  });
  await prisma.session.deleteMany({ where: { userId: user.id } });
  await createSession(user);
  redirect(AREAS.student.home);
}
