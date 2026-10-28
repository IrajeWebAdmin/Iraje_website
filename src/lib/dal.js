import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/session";
import { SESSION_COOKIE } from "@/lib/sessionCookie";

// Data Access Layer: the one place that decides who is signed in. Every
// protected page and Server Action calls requireAdmin() or requireStudent().

// Where each kind of user signs in, changes password, and lands afterwards.
export const AREAS = {
  admin: {
    login: "/admin/login",
    changePassword: "/admin/change-password",
    home: "/admin/enrollments",
  },
  student: {
    login: "/certification/login",
    changePassword: "/certification/change-password",
    home: "/certification/dashboard",
  },
};

/**
 * The signed-in user, or null. Wrapped in cache() so a page that calls it
 * several times makes only one database query per request.
 * Selects only safe fields — the password hash never leaves this file.
 */
export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { id: hashToken(token) },
    select: {
      expiresAt: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          mustChangePassword: true,
        },
      },
    },
  });

  if (!session || session.expiresAt <= new Date()) return null;
  if (session.user.status !== "active") return null;
  return session.user;
});

/**
 * Stop here unless the signed-in user has `role`. Sends everyone else to the
 * right login page, and anyone still on a temporary password to the
 * change-password page (unless that is the page asking).
 */
async function requireRole(role, { allowPasswordChange = false } = {}) {
  const user = await getCurrentUser();
  const area = AREAS[role];

  if (!user || user.role !== role) redirect(area.login);
  if (user.mustChangePassword && !allowPasswordChange) {
    redirect(area.changePassword);
  }
  return user;
}

export function requireAdmin(options) {
  return requireRole("admin", options);
}

export function requireStudent(options) {
  return requireRole("student", options);
}