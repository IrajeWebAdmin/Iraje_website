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

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
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